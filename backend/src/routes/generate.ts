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
import { RateLimitError, AppError, formatErrorResponse } from '../lib/errors.js';
import { getDatabasePool } from '../lib/database.js';
import { getClientIpMemoryFrame } from '../lib/ip.js';
import {
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
      let requestId = '';
      let reservationMade = false;
      let jobId: string | null = null;
      let creditsUsed = false;

      try {
        // Require authentication: no more free generations
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({
            error: 'UNAUTHORIZED',
            message: 'Sign in to generate. One portrait = $0.99.',
          });
        }

        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        if (!payload || !payload.userId) {
          return reply.status(401).send({
            error: 'UNAUTHORIZED',
            message: 'Sign in to generate. One portrait = $0.99.',
          });
        }

        const userId = payload.userId;

        // Require at least 1 credit before generating (pay-first flow)
        const userHasCredits = await checkUserCreditsMemoryFrame(db, userId, 1);
        if (!userHasCredits) {
          return reply.status(402).send({
            error: 'INSUFFICIENT_CREDITS',
            message: 'Pay $0.99 to generate one portrait.',
          });
        }

        // Parse multipart form data
        const { files, fields } = await parseMultipart(request);

        // Generate or use client request ID
        requestId = fields.get('client_request_id') || generateRequestId();
        jobId = uuidv4();

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

      // Spend 1 credit (user already had credits; we checked at start)
      const spent = await spendCreditsMemoryFrame(
        db,
        userId,
        1,
        'Image generation',
        jobId
      );
      if (spent) creditsUsed = true;

      // Update job status (no watermark; clean image only)
      await db.query(
        `UPDATE jobs_memory_frame 
         SET status = 'completed', completed_at = NOW() 
         WHERE id = $1`,
        [jobId]
      );

      // Log success
      request.log.info({
        request_id: requestId,
        job_id: jobId,
        user_id: userId,
        credits_used: creditsUsed,
        generation_time_ms: generationTimeMs,
        status: 'success',
      }, 'Generation completed');

      const response: GenerateResponse = {
        request_id: requestId,
        job_id: jobId!,
        image_base64: result.imageBase64,
        mime_type: result.mimeType,
        generation_time_ms: generationTimeMs,
        used_free_quota: false,
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
};

export default generateRoutes;
