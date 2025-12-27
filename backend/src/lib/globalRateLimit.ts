import { config } from './config.js';
import type { RateLimitResult } from '../types.js';

// In-memory storage for rate limiting when Redis is not available
const inMemoryEvents: Map<string, number> = new Map();
const inMemoryIpEvents: Map<string, Map<string, number>> = new Map();

/**
 * Clean old events from in-memory storage
 */
function cleanInMemoryEvents(): void {
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const cutoff = now - windowMs;

  for (const [key, timestamp] of inMemoryEvents) {
    if (timestamp < cutoff) {
      inMemoryEvents.delete(key);
    }
  }
}

/**
 * Check global rate limit and reserve a slot (in-memory version).
 */
export async function checkAndReserveSlot(requestId: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const limit = config.globalLimitPerHour;

  // Clean old events
  cleanInMemoryEvents();

  const count = inMemoryEvents.size;

  if (count >= limit) {
    // Find oldest event to calculate retry_after
    let oldestTime = now;
    for (const timestamp of inMemoryEvents.values()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
      }
    }
    const retryAfterSeconds = Math.ceil((oldestTime + windowMs - now) / 1000);
    return {
      allowed: false,
      retry_after_seconds: Math.max(1, retryAfterSeconds),
      limit,
    };
  }

  // Reserve slot
  inMemoryEvents.set(requestId, now);

  return {
    allowed: true,
    remaining: limit - count - 1,
    limit,
  };
}

/**
 * Remove a reservation (call on failure to avoid wasting slots).
 */
export async function removeReservation(requestId: string): Promise<void> {
  inMemoryEvents.delete(requestId);
}

/**
 * Get current rate limit status without modifying.
 */
export async function getRateLimitStatus(): Promise<{ current: number; limit: number; windowSeconds: number }> {
  cleanInMemoryEvents();
  
  return {
    current: inMemoryEvents.size,
    limit: config.globalLimitPerHour,
    windowSeconds: config.globalWindowSeconds,
  };
}

/**
 * Check IP-based rate limit (in-memory version).
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = config.globalWindowSeconds * 1000;
  const limit = config.ipLimitPerHour;
  const cutoff = now - windowMs;

  // Get or create IP events map
  let ipEvents = inMemoryIpEvents.get(ip);
  if (!ipEvents) {
    ipEvents = new Map();
    inMemoryIpEvents.set(ip, ipEvents);
  }

  // Clean old events for this IP
  for (const [key, timestamp] of ipEvents) {
    if (timestamp < cutoff) {
      ipEvents.delete(key);
    }
  }

  const count = ipEvents.size;

  if (count >= limit) {
    // Find oldest event
    let oldestTime = now;
    for (const timestamp of ipEvents.values()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
      }
    }
    const retryAfterSeconds = Math.ceil((oldestTime + windowMs - now) / 1000);
    return {
      allowed: false,
      retry_after_seconds: Math.max(1, retryAfterSeconds),
      limit,
    };
  }

  // Add current request
  ipEvents.set(`${now}-${Math.random()}`, now);

  return {
    allowed: true,
    remaining: limit - count - 1,
    limit,
  };
}
