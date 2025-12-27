import type { FastifyPluginAsync } from 'fastify';
import { getRateLimitStatus } from '../lib/globalRateLimit.js';

const startTime = Date.now();

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
            timestamp: { type: 'string' },
            rate_limit: {
              type: 'object',
              properties: {
                current: { type: 'number' },
                limit: { type: 'number' },
                window_seconds: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (_request, reply) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    const status = await getRateLimitStatus();
    const rateLimitInfo = {
      current: status.current,
      limit: status.limit,
      window_seconds: status.windowSeconds,
    };

    return reply.send({
      status: 'ok',
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
      storage: 'in-memory',
      rate_limit: rateLimitInfo,
    });
  });
};

export default healthRoutes;
