import { Redis } from 'ioredis';
import { config } from './config.js';

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
      enableReadyCheck: true,
    });

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Ready');
    });

    redisClient.on('close', () => {
      console.log('[Redis] Connection closed');
    });
  }

  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedis();
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function pingRedis(): Promise<boolean> {
  try {
    const redis = getRedis();
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
}

