// Rate limiting utility
// TODO: Replace in-memory store with Redis or similar for production

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (works for single server, replace with Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or expired, create new one
  if (!entry || entry.resetAt <= now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Check if under limit
  if (entry.count < MAX_REQUESTS_PER_WINDOW) {
    entry.count += 1;
    rateLimitStore.set(identifier, entry);
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limited
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

export function getRateLimitStatus(identifier: string): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
  }

  return {
    allowed: entry.count < MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - entry.count),
    resetAt: entry.resetAt,
  };
}

// Clean up expired entries periodically (call this from a cron job in production)
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

