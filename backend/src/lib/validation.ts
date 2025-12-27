import {
  VALID_STYLES,
  VALID_MIME_TYPES,
  VALID_SIZES,
  VALID_QUALITIES,
  VALID_OUTPUT_FORMATS,
  type FileInfo,
} from '../types.js';
import {
  MissingFieldError,
  InvalidFieldError,
  InvalidFileTypeError,
  FileTooLargeError,
} from './errors.js';
import { config } from './config.js';

export function validateFile(file: FileInfo | undefined, fieldName: string): void {
  if (!file || !file.buffer || file.buffer.length === 0) {
    throw new MissingFieldError(fieldName);
  }

  if (!VALID_MIME_TYPES.includes(file.mimetype)) {
    throw new InvalidFileTypeError();
  }

  if (file.buffer.length > config.maxUploadBytes) {
    throw new FileTooLargeError(config.maxUploadMb);
  }
}

export function validateStyle(style: string | undefined): string {
  if (!style || style.trim() === '') {
    throw new MissingFieldError('style');
  }

  const normalizedStyle = style.toLowerCase().trim();
  if (!VALID_STYLES.includes(normalizedStyle as typeof VALID_STYLES[number])) {
    throw new InvalidFieldError('style', `Must be one of: ${VALID_STYLES.join(', ')}`);
  }

  return normalizedStyle;
}

export function validateScene(scene: string | undefined): string {
  if (!scene || scene.trim() === '') {
    throw new MissingFieldError('scene');
  }

  if (scene.length > 500) {
    throw new InvalidFieldError('scene', 'Maximum 500 characters');
  }

  return scene.trim();
}

export function validateSize(size: string | undefined): string {
  if (!size) return config.defaultSize;

  if (!VALID_SIZES.includes(size)) {
    throw new InvalidFieldError('size', `Must be one of: ${VALID_SIZES.join(', ')}`);
  }

  return size;
}

export function validateQuality(quality: string | undefined): string {
  if (!quality) return config.defaultQuality;

  if (!VALID_QUALITIES.includes(quality)) {
    throw new InvalidFieldError('quality', `Must be one of: ${VALID_QUALITIES.join(', ')}`);
  }

  return quality;
}

export function validateOutputFormat(format: string | undefined): string {
  if (!format) return config.defaultOutputFormat;

  if (!VALID_OUTPUT_FORMATS.includes(format)) {
    throw new InvalidFieldError('output_format', `Must be one of: ${VALID_OUTPUT_FORMATS.join(', ')}`);
  }

  return format;
}

export function validateOutputCompression(compression: number | string | undefined): number {
  if (compression === undefined || compression === null) {
    return config.defaultOutputCompression;
  }

  const num = typeof compression === 'string' ? parseInt(compression, 10) : compression;

  if (isNaN(num) || num < 1 || num > 100) {
    throw new InvalidFieldError('output_compression', 'Must be a number between 1 and 100');
  }

  return num;
}

export function validateDeletePolicy(policy: string | undefined): 'immediate' | '24h' {
  if (!policy) return 'immediate';

  if (policy !== 'immediate' && policy !== '24h') {
    throw new InvalidFieldError('delete_policy', 'Must be "immediate" or "24h"');
  }

  return policy;
}

