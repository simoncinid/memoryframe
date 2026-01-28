import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { v4 as uuidv4 } from 'uuid';
import { generateRequestId } from '../lib/id.js';
import {
  validateFile,
  validateStyle,
  validateScene,
  validateSize,
  validateQuality,
  validateOutputFormat,
  validateOutputCompression,
  validateDeletePolicy,
} from '../lib/validation.js';
import { checkAndReserveSlot, removeReservation, checkIpRateLimit } from '../lib/globalRateLimit.js';
import { generateImage } from '../lib/openai.js';
import { applyDiagonalWatermark } from '../lib/watermark.js';
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
import type { FileInfo, GenerateResponse } from '../types.js';

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

const generateRoutes: FastifyPluginAsync = async (fastify) => {
  const db = getDatabasePool();

  fastify.post('/api/generate', async (request, reply) => {
      const startTime = Date.now();
      const clientIp = getClientIpMemoryFrame(request);
      const ipHash = hashIpMemoryFrame(clientIp);
      let requestId = '';
      let reservationMade = false;
      let jobId: string | null = null;
      let creditsUsed = false;

      try {
        // Parse multipart form data
        const { files, fields } = await parseMultipart(request);

        // Generate or use client request ID
        requestId = fields.get('client_request_id') || generateRequestId();
        jobId = uuidv4();

        // Extract device ID from form data and hash it
        const deviceId = fields.get('device_id');
        const deviceIdHash = deviceId ? hashDeviceIdMemoryFrame(deviceId) : undefined;

      // Extract files (only personA and personB needed now)
      const personA = files.get('personA');
      const personB = files.get('personB');

      // Validate required files
      validateFile(personA, 'personA');
      validateFile(personB, 'personB');

      // Validate required fields
      const style = validateStyle(fields.get('style'));
      const scene = validateScene(fields.get('scene'));

      // Validate optional fields
      const size = validateSize(fields.get('size'));
      const quality = validateQuality(fields.get('quality'));
      const outputFormat = validateOutputFormat(fields.get('output_format'));
      const outputCompression = validateOutputCompression(fields.get('output_compression'));
      validateDeletePolicy(fields.get('delete_policy'));

      // Check IP rate limit first
      const ipResult = await checkIpRateLimit(clientIp);
      if (!ipResult.allowed) {
        throw new RateLimitError(ipResult.retry_after_seconds!, false);
      }

      // Check global rate limit and reserve slot
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
         VALUES ($1, $2, $3, 't2i', 'processing')`,
        [jobId, userId, requestId]
      );

      // Log request start (without sensitive data)
      request.log.info({
        request_id: requestId,
        style,
        size,
        quality,
        ip: clientIp,
      }, 'Generation started');

      // Convert images to base64
      const personABase64 = personA!.buffer.toString('base64');
      const personBBase64 = personB!.buffer.toString('base64');

      // Call SeedDream v4
      const result = await generateImage({
        personABase64,
        personBBase64,
        backgroundBase64: '', // Not used anymore
        style,
        scene,
        size,
        quality,
        outputFormat,
        outputCompression,
      });

      const generationTimeMs = Date.now() - startTime;

      // NOW that generation succeeded, spend credits or use free quota
      if (userId && userHasCredits) {
        // Spend user credits
        const spent = await spendCreditsMemoryFrame(
          db,
          userId,
          1,
          'Image generation',
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

      // Update job status; se free, salva immagine pulita per sblocco $0.99
      if (usedFreeQuota) {
        await db.query(
          `UPDATE jobs_memory_frame 
           SET status = 'completed', completed_at = NOW(), 
               output_image_base64 = $2, output_mime_type = $3 
           WHERE id = $1`,
          [jobId, result.imageBase64, result.mimeType]
        );
      } else {
        await db.query(
          `UPDATE jobs_memory_frame 
           SET status = 'completed', completed_at = NOW() 
           WHERE id = $1`,
          [jobId]
        );
      }

      // Log success
      request.log.info({
        request_id: requestId,
        job_id: jobId,
        user_id: userId,
        credits_used: creditsUsed,
        free_quota_used: usedFreeQuota,
        generation_time_ms: generationTimeMs,
        status: 'success',
      }, 'Generation completed');

      // Per free: applica watermark e restituisci quella; altrimenti immagine pulita
      let imageBase64 = result.imageBase64;
      let mimeType = result.mimeType;
      if (usedFreeQuota) {
        const wm = await applyDiagonalWatermark(result.imageBase64, result.mimeType);
        imageBase64 = wm.base64;
        mimeType = wm.mimeType;
      }

      const response: GenerateResponse = {
        request_id: requestId,
        job_id: jobId!,
        image_base64: imageBase64,
        mime_type: mimeType,
        generation_time_ms: generationTimeMs,
        used_free_quota: usedFreeQuota,
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

      // Remove reservation if we made one and failed
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
        request.log.warn({
          request_id: requestId,
          error_code: error.code,
          generation_time_ms: generationTimeMs,
          status: 'error',
        }, error.message);

        return reply.status(error.statusCode).send(formatErrorResponse(error));
      }

      // Unexpected error
      request.log.error({
        request_id: requestId,
        error: (error as Error).message,
        generation_time_ms: generationTimeMs,
        status: 'error',
      }, 'Unexpected error');

      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  });

  // GET immagine pulita dopo sblocco $0.99 (solo se unlocked_at IS NOT NULL)
  fastify.get<{ Params: { jobId: string } }>('/v1/generate/result/:jobId', async (request, reply) => {
    const { jobId } = request.params;
    const result = await db.query(
      `SELECT output_image_base64, output_mime_type, unlocked_at, status 
       FROM jobs_memory_frame 
       WHERE id = $1`,
      [jobId]
    );
    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Job not found' });
    }
    const row = result.rows[0] as { output_image_base64: string | null; output_mime_type: string | null; unlocked_at: Date | null; status: string };
    if (row.status !== 'completed' || !row.output_image_base64) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: 'Image not available' });
    }
    if (!row.unlocked_at) {
      return reply.status(402).send({ error: 'LOCKED', message: 'Unlock this photo for $0.99 to download' });
    }
    return reply.status(200).send({
      image_base64: row.output_image_base64,
      mime_type: row.output_mime_type || 'image/png',
    });
  });
};

export default generateRoutes;
