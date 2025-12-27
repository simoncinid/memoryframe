import { getRedis } from './redis.js';
import { config } from './config.js';
import type { RateLimitResult } from '../types.js';

const RATE_LIMIT_KEY = 'global:imggen:events';

/**
 * Lua script for atomic rate limiting with sliding window.
 * 
 * Operations:
 * 1. Remove events older than window
 * 2. Count remaining events
 * 3. If count >= limit, calculate retry_after and return deny
 * 4. If count < limit, add new event and return allow
 * 
 * Returns: [allowed (0|1), remaining|retry_after_seconds, limit]
 */
const RATE_LIMIT_LUA_SCRIPT = `
local key = KEYS[1]
local request_id = ARGV[1]
local now_ms = tonumber(ARGV[2])
local window_ms = tonumber(ARGV[3])
local limit = tonumber(ARGV[4])

-- Remove events older than window
local cutoff = now_ms - window_ms
redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)

-- Count current events
local count = redis.call('ZCARD', key)

if count >= limit then
    -- Calculate retry_after based on oldest event
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local retry_after_seconds = 0
    if oldest and #oldest >= 2 then
        local oldest_time = tonumber(oldest[2])
        local time_until_expire = (oldest_time + window_ms) - now_ms
        retry_after_seconds = math.ceil(time_until_expire / 1000)
        if retry_after_seconds < 1 then
            retry_after_seconds = 1
        end
    end
    return {0, retry_after_seconds, limit}
else
    -- Add new event
    redis.call('ZADD', key, now_ms, request_id)
    -- Set expiry on key to auto-cleanup (window + buffer)
    redis.call('EXPIRE', key, math.ceil(window_ms / 1000) + 60)
    local remaining = limit - count - 1
    return {1, remaining, limit}
end
`;

/**
 * Check global rate limit and reserve a slot atomically.
 */
export async function checkAndReserveSlot(requestId: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const limit = config.globalLimitPerHour;

  const result = await redis.eval(
    RATE_LIMIT_LUA_SCRIPT,
    1,
    RATE_LIMIT_KEY,
    requestId,
    now.toString(),
    windowMs.toString(),
    limit.toString()
  ) as [number, number, number];

  const [allowed, secondValue, limitValue] = result;

  if (allowed === 1) {
    return {
      allowed: true,
      remaining: secondValue,
      limit: limitValue,
    };
  } else {
    return {
      allowed: false,
      retry_after_seconds: secondValue,
      limit: limitValue,
    };
  }
}

/**
 * Remove a reservation (call on failure to avoid wasting slots).
 */
export async function removeReservation(requestId: string): Promise<void> {
  const redis = getRedis();
  await redis.zrem(RATE_LIMIT_KEY, requestId);
}

/**
 * Get current rate limit status without modifying.
 */
export async function getRateLimitStatus(): Promise<{ current: number; limit: number; windowSeconds: number }> {
  const redis = getRedis();
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const cutoff = now - windowMs;

  // Clean old entries first
  await redis.zremrangebyscore(RATE_LIMIT_KEY, '-inf', cutoff);
  
  const current = await redis.zcard(RATE_LIMIT_KEY);

  return {
    current,
    limit: config.globalLimitPerHour,
    windowSeconds: config.globalWindowSeconds,
  };
}

// IP-based rate limiting key generator
export function getIpRateLimitKey(ip: string): string {
  return `ratelimit:ip:${ip}`;
}

/**
 * Check IP-based rate limit (simpler, non-atomic version).
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const key = getIpRateLimitKey(ip);
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const limit = config.ipLimitPerHour;
  const cutoff = now - windowMs;

  // Clean and count in pipeline
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, '-inf', cutoff);
  pipeline.zcard(key);
  
  const results = await pipeline.exec();
  const count = results?.[1]?.[1] as number ?? 0;

  if (count >= limit) {
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    let retryAfter = 60;
    if (oldest && oldest.length >= 2) {
      const oldestTime = parseInt(oldest[1], 10);
      retryAfter = Math.ceil((oldestTime + windowMs - now) / 1000);
      if (retryAfter < 1) retryAfter = 1;
    }
    return {
      allowed: false,
      retry_after_seconds: retryAfter,
      limit,
    };
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, config.globalWindowSeconds + 60);

  return {
    allowed: true,
    remaining: limit - count - 1,
    limit,
  };
}

