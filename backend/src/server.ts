import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { config, validateConfig } from './lib/config.js';
import healthRoutes from './routes/health.js';
import generateRoutes from './routes/generate.js';

// Validate configuration on startup before initializing server
validateConfig();

const fastify = Fastify({
  logger: {
    level: config.logLevel,
    transport: config.nodeEnv === 'development' 
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  trustProxy: true,
  requestTimeout: 120000, // 2 minutes timeout for long AI generation requests
});

async function start() {
  try {
    // Register security and middleware plugins
    await fastify.register(helmet, {
      contentSecurityPolicy: false, // Disabled for API
    });

    // Parse CORS origins
    const origins = config.frontendOrigin.split(',').map(o => o.trim());
    await fastify.register(cors, {
      origin: origins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await fastify.register(multipart, {
      limits: {
        fileSize: config.maxUploadBytes,
        files: 3,
        fields: 10,
      },
    });

    // Rate limiting mode info
    fastify.log.info(`Rate limiting: in-memory (single instance)`);

    // Register routes
    await fastify.register(healthRoutes);
    await fastify.register(generateRoutes);

    // Global error handler
    fastify.setErrorHandler((error: Error & { code?: string }, request, reply) => {
      request.log.error({
        error: error.message,
        stack: config.nodeEnv === 'development' ? error.stack : undefined,
      });

      // Handle multipart errors
      if (error.code === 'FST_REQ_FILE_TOO_LARGE') {
        return reply.status(400).send({
          error: 'FILE_TOO_LARGE',
          message: `File too large. Maximum size is ${config.maxUploadMb}MB.`,
        });
      }

      if (error.code === 'FST_FILES_LIMIT') {
        return reply.status(400).send({
          error: 'TOO_MANY_FILES',
          message: 'Too many files. Maximum is 3.',
        });
      }

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      });
    });

    // Not found handler
    fastify.setNotFoundHandler((_request, reply) => {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Endpoint not found.',
      });
    });

    // Start server
    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    fastify.log.info(`Server running on http://${config.host}:${config.port}`);
    fastify.log.info(`Environment: ${config.nodeEnv}`);
    fastify.log.info(`Mock mode: ${config.isMockMode}`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string) {
  fastify.log.info(`Received ${signal}. Shutting down gracefully...`);
  
  try {
    await fastify.close();
    fastify.log.info('HTTP server closed');
    process.exit(0);
  } catch (err) {
    fastify.log.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();

