export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(code, message, 400);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number, isGlobal: boolean = false) {
    super(
      isGlobal ? 'GLOBAL_RATE_LIMIT' : 'RATE_LIMIT_EXCEEDED',
      isGlobal ? 'System is busy. Try again soon.' : 'Too many requests. Please slow down.',
      429,
      retryAfterSeconds
    );
  }
}

export class UpstreamError extends AppError {
  constructor(message: string = 'Generation failed. Try again.') {
    super('UPSTREAM_ERROR', message, 502);
  }
}

export class FileTooLargeError extends ValidationError {
  constructor(maxMb: number) {
    super(`File too large. Maximum size is ${maxMb}MB.`, 'FILE_TOO_LARGE');
  }
}

export class InvalidFileTypeError extends ValidationError {
  constructor() {
    super('Invalid file type. Accepted: jpg, png, webp.', 'INVALID_FILE_TYPE');
  }
}

export class MissingFieldError extends ValidationError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, 'MISSING_FIELD');
  }
}

export class InvalidFieldError extends ValidationError {
  constructor(field: string, reason: string) {
    super(`Invalid ${field}: ${reason}`, 'INVALID_FIELD');
  }
}

export function formatErrorResponse(error: AppError): {
  error: string;
  message: string;
  retry_after_seconds?: number;
} {
  return {
    error: error.code,
    message: error.message,
    ...(error.retryAfterSeconds !== undefined && { retry_after_seconds: error.retryAfterSeconds }),
  };
}

