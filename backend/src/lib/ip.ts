import crypto from 'crypto';
import type { FastifyRequest } from 'fastify';
import { config } from './config.js';

/**
 * Extracts the real client IP from request, handling proxy and load balancer
 */
export function getClientIpMemoryFrame(request: FastifyRequest): string {
  // Check x-forwarded-for header (first element if multiple)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = typeof forwardedFor === 'string' 
      ? forwardedFor.split(',').map(ip => ip.trim())
      : forwardedFor;
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  // Fallback to request.ip (already handled by Fastify with trustProxy)
  return request.ip || '0.0.0.0';
}

/**
 * SHA256 hash of IP concatenated with salt for privacy
 */
export function hashIpMemoryFrame(ip: string): string {
  const salt = config.ipSalt;
  const hash = crypto.createHash('sha256');
  hash.update(ip + salt);
  return hash.digest('hex');
}

/**
 * SHA256 hash of device ID concatenated with salt for privacy
 */
export function hashDeviceIdMemoryFrame(deviceId: string): string {
  const salt = config.ipSalt; // Usa lo stesso salt per coerenza
  const hash = crypto.createHash('sha256');
  hash.update(deviceId + salt);
  return hash.digest('hex');
}
