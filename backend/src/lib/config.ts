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

  // SeedDream (WaveSpeed AI)
  seedreamApiKey: process.env.SEEDREAM_API_KEY ?? '',

  // Redis (optional - falls back to in-memory rate limiting)
  redisUrl: process.env.REDIS_URL || '',
  get useRedis() {
    return !!this.redisUrl;
  },

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
    return !this.seedreamApiKey;
  },
} as const;

export function validateConfig(): void {
  // Warn if Redis is not configured in production
  if (config.nodeEnv === 'production' && !config.useRedis) {
    console.warn('[Config] REDIS_URL not set - using in-memory rate limiting (not suitable for multiple instances)');
  }
}

