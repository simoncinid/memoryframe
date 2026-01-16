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

  // CORS (supporta sia CORS_ORIGIN che FRONTEND_ORIGIN per retrocompatibilità)
  frontendOrigin: process.env.CORS_ORIGIN || getEnvOrDefault('FRONTEND_ORIGIN', 'http://localhost:3000'),

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

  // Database
  databaseUrl: getEnvOrDefault('DATABASE_URL', 'postgres://user:password@localhost:5432/memoryframe_db'),
  databaseCaFile: process.env.CA_FILE || '',
  databaseSslRejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',

  // JWT
  jwtSecret: getEnvOrDefault('JWT_SECRET', 'change-me-in-production'),
  jwtExpiresIn: getEnvOrDefault('JWT_EXPIRES_IN', '7d'),
  jwtRefreshExpiresIn: getEnvOrDefault('JWT_REFRESH_EXPIRES_IN', '30d'),

  // IP Hashing
  ipSalt: getEnvOrDefault('IP_SALT', 'change-me-in-production'),

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Email
  smtpHost: getEnvOrDefault('SMTP_HOST', 'smtp.gmail.com'),
  smtpPort: getEnvNumber('SMTP_PORT', 587),
  smtpUser: getEnvOrDefault('SMTP_USER', ''),
  smtpPass: getEnvOrDefault('SMTP_PASS', ''),
  emailFrom: getEnvOrDefault('EMAIL_FROM', 'noreply@memoryframe.com'),
  emailFromName: getEnvOrDefault('EMAIL_FROM_NAME', 'MemoryFrame'),

  // Pricing
  pricePerPhotoCredit: getEnvNumber('PRICE_PER_PHOTO_CREDIT', 19), // in centesimi
} as const;

export function validateConfig(): void {
  // Warn if Redis is not configured in production
  if (config.nodeEnv === 'production' && !config.useRedis) {
    console.warn('[Config] REDIS_URL not set - using in-memory rate limiting (not suitable for multiple instances)');
  }

  // Warn if database is not configured
  if (config.nodeEnv === 'production' && config.databaseUrl.includes('localhost')) {
    console.warn('[Config] DATABASE_URL appears to be using localhost - check configuration');
  }

  // Warn if JWT secret is default
  if (config.jwtSecret === 'change-me-in-production') {
    console.warn('[Config] JWT_SECRET is using default value - change in production!');
  }
}

