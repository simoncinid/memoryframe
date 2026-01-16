import type { FastifyPluginAsync } from 'fastify';
import { getDatabasePool, type CreditTransaction } from '../lib/database.js';
import {
  checkFreeQuotaMemoryFrame,
} from '../lib/credits.js';
import { getClientIpMemoryFrame, hashIpMemoryFrame } from '../lib/ip.js';
import { verifyAccessToken } from '../lib/auth.js';

const creditsRoutes: FastifyPluginAsync = async (fastify) => {
  const db = getDatabasePool();

  // Get free quota status
  fastify.get('/v1/free-quota', async (request, reply) => {
    try {
      const clientIp = getClientIpMemoryFrame(request);
      const ipHash = hashIpMemoryFrame(clientIp);

      const { hasQuota, remaining } = await checkFreeQuotaMemoryFrame(db, ipHash);

      return reply.status(200).send({
        remaining,
        total: 1,
        hasQuota,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error checking quota',
      });
    }
  });

  // Get user transactions
  fastify.get('/v1/transactions', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload || !payload.userId) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token invalid',
        });
      }

      const { limit = 50, offset = 0 } = request.query as { limit?: number; offset?: number };

      const result = await db.query(
        `SELECT id, kind, photo_delta, reason, stripe_event_id, job_id, created_at
         FROM credit_transactions_memory_frame
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [payload.userId, limit, offset]
      );

      return reply.status(200).send({
        transactions: result.rows.map((row: Pick<CreditTransaction, 'id' | 'kind' | 'photo_delta' | 'reason' | 'stripe_event_id' | 'job_id' | 'created_at'>) => ({
          id: row.id,
          kind: row.kind,
          photoDelta: row.photo_delta,
          reason: row.reason,
          stripeEventId: row.stripe_event_id,
          jobId: row.job_id,
          createdAt: row.created_at,
        })),
        limit,
        offset,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error retrieving transactions',
      });
    }
  });
};

export default creditsRoutes;
