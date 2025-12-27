import dotenv from 'dotenv';

dotenv.config();

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config = {
  // Server
  port: getEnvNumber('PORT', 8080),
  host: '0.0.0.0',
  nodeEnv: getEnvOrDefault('NODE_ENV', 'development'),
  logLevel: getEnvOrDefault('LOG_LEVEL', 'info'),

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: getEnvOrDefault('OPENAI_MODEL', 'gpt-image-1'),

  // Redis
  redisUrl: getEnvOrDefault('REDIS_URL', 'redis://localhost:6379'),

  // CORS
  frontendOrigin: getEnvOrDefault('FRONTEND_ORIGIN', 'http://localhost:3000'),

  // Rate Limiting
  globalLimitPerHour: getEnvNumber('GLOBAL_LIMIT_PER_HOUR', 10),
  globalWindowSeconds: getEnvNumber('GLOBAL_WINDOW_SECONDS', 3600),
  ipLimitPerHour: getEnvNumber('IP_LIMIT_PER_HOUR', 20),

  // Upload
  maxUploadMb: getEnvNumber('MAX_UPLOAD_MB', 10),
  get maxUploadBytes() {
    return this.maxUploadMb * 1024 * 1024;
  },

  // Image Generation Defaults
  defaultSize: getEnvOrDefault('DEFAULT_SIZE', '1024x1024'),
  defaultQuality: getEnvOrDefault('DEFAULT_QUALITY', 'medium'),
  defaultOutputFormat: getEnvOrDefault('DEFAULT_OUTPUT_FORMAT', 'webp'),
  defaultOutputCompression: getEnvNumber('DEFAULT_OUTPUT_COMPRESSION', 80),

  // Feature flags
  get isMockMode() {
    return !this.openaiApiKey;
  },
} as const;

export function validateConfig(): void {
  // Redis URL is required for production
  if (config.nodeEnv === 'production' && !config.redisUrl) {
    throw new Error('REDIS_URL is required in production for global rate limiting');
  }
}

