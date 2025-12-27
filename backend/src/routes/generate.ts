import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
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
  fastify.post('/api/generate', async (request, reply) => {
    const startTime = Date.now();
    const clientIp = request.ip;
    let requestId = '';
    let reservationMade = false;

    try {
      // Parse multipart form data
      const { files, fields } = await parseMultipart(request);

      // Generate or use client request ID
      requestId = fields.get('client_request_id') || generateRequestId();

      // Extract files
      const personA = files.get('personA');
      const personB = files.get('personB');
      const background = files.get('background');

      // Validate required files
      validateFile(personA, 'personA');
      validateFile(personB, 'personB');
      validateFile(background, 'background');

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
      const backgroundBase64 = background!.buffer.toString('base64');

      // Call OpenAI
      const result = await generateImage({
        personABase64,
        personBBase64,
        backgroundBase64,
        style,
        scene,
        size,
        quality,
        outputFormat,
        outputCompression,
      });

      const generationTimeMs = Date.now() - startTime;

      // Log success
      request.log.info({
        request_id: requestId,
        generation_time_ms: generationTimeMs,
        status: 'success',
      }, 'Generation completed');

      const response: GenerateResponse = {
        request_id: requestId,
        image_base64: result.imageBase64,
        mime_type: result.mimeType,
        generation_time_ms: generationTimeMs,
      };

      return reply.status(200).send(response);

    } catch (error) {
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

