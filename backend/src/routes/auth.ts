import type { FastifyPluginAsync } from 'fastify';
import { getDatabasePool } from '../lib/database.js';
import {
  createUserMemoryFrame,
  verifyUserCredentialsMemoryFrame,
  generateAccessToken,
  generateRefreshTokenMemoryFrame,
  refreshAccessTokenMemoryFrame,
  verifyEmailMemoryFrame,
  resendVerificationEmailMemoryFrame,
  logoutMemoryFrame,
  verifyAccessToken,
} from '../lib/auth.js';
import { getUserById } from '../lib/credits.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const db = getDatabasePool();

  // Registrazione
  fastify.post('/v1/auth/register', async (request, reply) => {
    try {
      const { email, password } = request.body as { email?: string; password?: string };

      if (!email || !password) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Email e password sono obbligatorie',
        });
      }

      if (password.length < 8) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'La password deve essere di almeno 8 caratteri',
        });
      }

      // Verifica se email esiste già
      const [existing] = await db.execute(
        `SELECT id FROM users_memory_frame WHERE email = ?`,
        [email]
      );

      if (Array.isArray(existing) && existing.length > 0) {
        return reply.status(409).send({
          error: 'EMAIL_EXISTS',
          message: 'Questa email è già registrata',
        });
      }

      const { user } = await createUserMemoryFrame(db, email, password);

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified,
      });

      const refreshToken = await generateRefreshTokenMemoryFrame(db, user.id);

      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          creditsPhoto: user.credits_photo,
        },
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 giorni in secondi
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante la registrazione',
      });
    }
  });

  // Login
  fastify.post('/v1/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as { email?: string; password?: string };

      if (!email || !password) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Email e password sono obbligatorie',
        });
      }

      const user = await verifyUserCredentialsMemoryFrame(db, email, password);

      if (!user) {
        return reply.status(401).send({
          error: 'INVALID_CREDENTIALS',
          message: 'Email o password non corretti',
        });
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        emailVerified: user.email_verified,
      });

      const refreshToken = await generateRefreshTokenMemoryFrame(db, user.id);

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          creditsPhoto: user.credits_photo,
        },
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante il login',
      });
    }
  });

  // Refresh token
  fastify.post('/v1/auth/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken?: string };

      if (!refreshToken) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Refresh token obbligatorio',
        });
      }

      const result = await refreshAccessTokenMemoryFrame(db, refreshToken);

      if (!result) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Refresh token non valido o scaduto',
        });
      }

      return reply.status(200).send({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante il refresh del token',
      });
    }
  });

  // Verifica email
  fastify.get('/v1/auth/verify-email', async (request, reply) => {
    try {
      const { token } = request.query as { token?: string };

      if (!token) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Token di verifica obbligatorio',
        });
      }

      const success = await verifyEmailMemoryFrame(db, token);

      if (!success) {
        return reply.status(400).send({
          error: 'INVALID_TOKEN',
          message: 'Token di verifica non valido o scaduto',
        });
      }

      return reply.status(200).send({
        message: 'Email verificata con successo',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante la verifica email',
      });
    }
  });

  // Reinvia email verifica
  fastify.post('/v1/auth/resend-verification', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'Token di autenticazione obbligatorio',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token non valido',
        });
      }

      const success = await resendVerificationEmailMemoryFrame(db, payload.userId);

      if (!success) {
        return reply.status(400).send({
          error: 'ALREADY_VERIFIED',
          message: 'Email già verificata o utente non trovato',
        });
      }

      return reply.status(200).send({
        message: 'Email di verifica inviata',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante l\'invio email',
      });
    }
  });

  // Logout
  fastify.post('/v1/auth/logout', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken?: string };

      if (!refreshToken) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Refresh token obbligatorio',
        });
      }

      await logoutMemoryFrame(db, refreshToken);

      return reply.status(200).send({
        message: 'Logout effettuato con successo',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante il logout',
      });
    }
  });

  // Get current user
  fastify.get('/v1/auth/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'Token di autenticazione obbligatorio',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token non valido',
        });
      }

      const user = await getUserById(db, payload.userId);

      if (!user) {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'Utente non trovato',
        });
      }

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          creditsPhoto: user.credits_photo,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Errore durante il recupero utente',
      });
    }
  });
};

export default authRoutes;
