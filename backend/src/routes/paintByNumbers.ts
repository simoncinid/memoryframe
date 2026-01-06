import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import { generateRequestId } from '../lib/id.js';
import { validateFile, validateDeletePolicy } from '../lib/validation.js';
import { checkAndReserveSlot, removeReservation, checkIpRateLimit } from '../lib/globalRateLimit.js';
import { generatePaintByNumbersTemplate } from '../lib/paintByNumbersGenerator.js';
import { RateLimitError, AppError, formatErrorResponse } from '../lib/errors.js';
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
  fastify.post('/api/paint-by-numbers', async (request, reply) => {
    const startTime = Date.now();
    const clientIp = request.ip;
    let requestId = '';
    let reservationMade = false;

    try {
      const { files, fields } = await parseMultipart(request);
      requestId = fields.get('client_request_id') || generateRequestId();

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

      request.log.info(
        {
          request_id: requestId,
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


