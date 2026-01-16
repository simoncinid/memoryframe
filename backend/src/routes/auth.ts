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

  // Registration
  fastify.post('/v1/auth/register', async (request, reply) => {
    try {
      const { email, password } = request.body as { email?: string; password?: string };

      if (!email || !password) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        });
      }

      if (password.length < 8) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
        });
      }

      // Check if email already exists
      const existingResult = await db.query(
        `SELECT id FROM users_memory_frame WHERE email = $1`,
        [email]
      );

      if (existingResult.rows.length > 0) {
        return reply.status(409).send({
          error: 'EMAIL_EXISTS',
          message: 'This email is already registered',
        });
      }

      const { user } = await createUserMemoryFrame(db, email, password);

      // Don't return token until email is verified
      return reply.status(201).send({
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified,
          creditsPhoto: user.credits_photo,
        },
        message: 'Registration completed. Check your email for the verification code.',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error during registration',
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
          message: 'Email and password are required',
        });
      }

      const user = await verifyUserCredentialsMemoryFrame(db, email, password);

      if (!user) {
        return reply.status(401).send({
          error: 'INVALID_CREDENTIALS',
          message: 'Email or password incorrect',
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
        message: 'Error during login',
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
          message: 'Refresh token required',
        });
      }

      const result = await refreshAccessTokenMemoryFrame(db, refreshToken);

      if (!result) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Refresh token invalid or expired',
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
        message: 'Error during token refresh',
      });
    }
  });

  // Verify email with code (POST)
  fastify.post('/v1/auth/verify-email', async (request, reply) => {
    try {
      const { code } = request.body as { code?: string };

      if (!code) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Verification code required',
        });
      }

      if (!/^\d{6}$/.test(code)) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Code must be 6 digits',
        });
      }

      const success = await verifyEmailMemoryFrame(db, code);

      if (!success) {
        return reply.status(400).send({
          error: 'INVALID_CODE',
          message: 'Verification code invalid or expired',
        });
      }

      return reply.status(200).send({
        message: 'Email verified successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error during email verification',
      });
    }
  });

  // Resend verification email
  fastify.post('/v1/auth/resend-verification', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'Authentication token required',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token invalid',
        });
      }

      const success = await resendVerificationEmailMemoryFrame(db, payload.userId);

      if (!success) {
        return reply.status(400).send({
          error: 'ALREADY_VERIFIED',
          message: 'Email already verified or user not found',
        });
      }

      return reply.status(200).send({
        message: 'Verification email sent',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error sending email',
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
          message: 'Refresh token required',
        });
      }

      await logoutMemoryFrame(db, refreshToken);

      return reply.status(200).send({
        message: 'Logout successful',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error during logout',
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
          message: 'Authentication token required',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token invalid',
        });
      }

      const user = await getUserById(db, payload.userId);

      if (!user) {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
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
        message: 'Error retrieving user',
      });
    }
  });
};

export default authRoutes;
