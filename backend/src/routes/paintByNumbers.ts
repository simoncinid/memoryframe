import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { v4 as uuidv4 } from 'uuid';
import { generateRequestId } from '../lib/id.js';
import { validateFile, validateDeletePolicy } from '../lib/validation.js';
import { checkAndReserveSlot, removeReservation, checkIpRateLimit } from '../lib/globalRateLimit.js';
import { generatePaintByNumbersTemplate } from '../lib/paintByNumbersGenerator.js';
import { RateLimitError, AppError, formatErrorResponse } from '../lib/errors.js';
import { getDatabasePool } from '../lib/database.js';
import { getClientIpMemoryFrame, hashIpMemoryFrame, hashDeviceIdMemoryFrame } from '../lib/ip.js';
import {
  checkFreeQuotaMemoryFrame,
  useFreeQuotaMemoryFrame,
  checkUserCreditsMemoryFrame,
  spendCreditsMemoryFrame,
} from '../lib/credits.js';
import { verifyAccessToken } from '../lib/auth.js';
import type { FileInfo } from '../types.js';

interface ParsedMultipart {
  files: Map<string, FileInfo>;
  fields: Map<string, string>;
}

async function parseMultipart(request: FastifyRequest): Promise<ParsedMultipart> {
  const files = new Map<string, FileInfo>();
  const fields = new Map<string, string>();

  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === 'file') {
      const file = part as MultipartFile;
      const buffer = await file.toBuffer();
      files.set(file.fieldname, {
        buffer,
        filename: file.filename,
        mimetype: file.mimetype,
      });
    } else {
      fields.set(part.fieldname, part.value as string);
    }
  }

  return { files, fields };
}

const paintByNumbersRoutes: FastifyPluginAsync = async (fastify) => {
  const db = getDatabasePool();

  fastify.post('/api/paint-by-numbers', async (request, reply) => {
    const startTime = Date.now();
    const clientIp = getClientIpMemoryFrame(request);
    const ipHash = hashIpMemoryFrame(clientIp);
    let requestId = '';
    let reservationMade = false;
    let jobId: string | null = null;
    let creditsUsed = false;

    try {
      const { files, fields } = await parseMultipart(request);
      requestId = fields.get('client_request_id') || generateRequestId();
      jobId = uuidv4();

      // Extract device ID from form data and hash it
      const deviceId = fields.get('device_id');
      const deviceIdHash = deviceId ? hashDeviceIdMemoryFrame(deviceId) : undefined;

      const photo = files.get('photo');
      validateFile(photo, 'photo');
      validateDeletePolicy(fields.get('delete_policy'));

      // IP rate limit first
      const ipResult = await checkIpRateLimit(clientIp);
      if (!ipResult.allowed) {
        throw new RateLimitError(ipResult.retry_after_seconds!, false);
      }

      // Global limit reservation
      const globalResult = await checkAndReserveSlot(requestId);
      if (!globalResult.allowed) {
        throw new RateLimitError(globalResult.retry_after_seconds!, true);
      }
      reservationMade = true;

      // Check authentication and credits (but don't spend yet - only after successful generation)
      const authHeader = request.headers.authorization;
      let userId: string | null = null;
      let usedFreeQuota = false;
      let userHasCredits = false;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        
        if (payload && payload.userId) {
          userId = payload.userId;
          
          // Check user credits (but don't spend yet)
          userHasCredits = await checkUserCreditsMemoryFrame(db, userId, 1);
          
          if (!userHasCredits) {
            // No credits, try free quota
            const { hasQuota } = await checkFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
            if (hasQuota) {
              // We'll use free quota after successful generation
            } else {
              return reply.status(402).send({
                error: 'INSUFFICIENT_CREDITS',
                message: 'Insufficient credits. Buy credits or use the free quota tomorrow.',
              });
            }
          }
        }
      } else {
        // Anonymous user - check free quota
        const { hasQuota } = await checkFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
        if (!hasQuota) {
          return reply.status(402).send({
            error: 'FREE_QUOTA_EXHAUSTED',
            message: 'Free quota exhausted. Register or buy credits to continue.',
          });
        }
      }

      // Create job in database
      await db.query(
        `INSERT INTO jobs_memory_frame (id, user_id, request_id, type, status)
         VALUES ($1, $2, $3, 'paint_by_numbers', 'processing')`,
        [jobId, userId, requestId]
      );

      request.log.info(
        {
          request_id: requestId,
          ip: clientIp,
        },
        'Paint-by-numbers generation started'
      );

      // Use deterministic algorithm (not AI) for professional paint-by-numbers
      const result = await generatePaintByNumbersTemplate(photo!.buffer);

      const generationTimeMs = Date.now() - startTime;

      // NOW that generation succeeded, spend credits or use free quota
      if (userId && userHasCredits) {
        // Spend user credits
        const spent = await spendCreditsMemoryFrame(
          db,
          userId,
          1,
          'Paint-by-numbers generation',
          jobId
        );
        
        if (spent) {
          creditsUsed = true;
        } else {
          // Fallback to free quota if spending failed (shouldn't happen, but handle gracefully)
          const { hasQuota } = await checkFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
          if (hasQuota) {
            await useFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
            usedFreeQuota = true;
          }
        }
      } else {
        // Use free quota for anonymous users or users without credits
        const { hasQuota } = await checkFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
        if (hasQuota) {
          await useFreeQuotaMemoryFrame(db, ipHash, deviceIdHash);
          usedFreeQuota = true;
        }
      }

      // Update job status
      await db.query(
        `UPDATE jobs_memory_frame 
         SET status = 'completed', completed_at = NOW() 
         WHERE id = $1`,
        [jobId]
      );

      request.log.info(
        {
          request_id: requestId,
          job_id: jobId,
          user_id: userId,
          credits_used: creditsUsed,
          free_quota_used: usedFreeQuota,
          generation_time_ms: generationTimeMs,
          status: 'success',
        },
        'Paint-by-numbers generation completed'
      );

      // Return both template and colored preview
      const response = {
        request_id: requestId,
        image_base64: result.imageBase64,
        colored_base64: result.coloredBase64,
        mime_type: result.mimeType,
        generation_time_ms: generationTimeMs,
      };

      return reply.status(200).send(response);
    } catch (error) {
      // Update job status to failed if created
      if (jobId) {
        try {
          await db.query(
            `UPDATE jobs_memory_frame SET status = 'failed' WHERE id = $1`,
            [jobId]
          );
        } catch (updateError) {
          request.log.error({ job_id: jobId, error: updateError }, 'Failed to update job status');
        }
      }

      if (reservationMade && requestId) {
        try {
          await removeReservation(requestId);
          request.log.info({ request_id: requestId }, 'Removed rate limit reservation after failure');
        } catch (removeError) {
          request.log.error({ request_id: requestId, error: removeError }, 'Failed to remove reservation');
        }
      }

      const generationTimeMs = Date.now() - startTime;

      if (error instanceof AppError) {
        request.log.warn(
          {
            request_id: requestId,
            error_code: error.code,
            generation_time_ms: generationTimeMs,
            status: 'error',
          },
          error.message
        );

        return reply.status(error.statusCode).send(formatErrorResponse(error));
      }

      request.log.error(
        {
          request_id: requestId,
          error: (error as Error).message,
          generation_time_ms: generationTimeMs,
          status: 'error',
        },
        'Unexpected error'
      );

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  });
};

export default paintByNumbersRoutes;


