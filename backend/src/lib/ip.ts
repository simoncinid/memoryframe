import crypto from 'crypto';
import type { FastifyRequest } from 'fastify';
import { config } from './config.js';

/**
 * Estrae l'IP reale del client da request, gestendo proxy e load balancer
 */
export function getClientIpMemoryFrame(request: FastifyRequest): string {
  // Controlla x-forwarded-for header (primo elemento se multipli)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = typeof forwardedFor === 'string' 
      ? forwardedFor.split(',').map(ip => ip.trim())
      : forwardedFor;
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  // Fallback a request.ip (già gestito da Fastify con trustProxy)
  return request.ip || '0.0.0.0';
}

/**
 * Hash SHA256 dell'IP concatenato con salt per privacy
 */
export function hashIpMemoryFrame(ip: string): string {
  const salt = config.ipSalt;
  const hash = crypto.createHash('sha256');
  hash.update(ip + salt);
  return hash.digest('hex');
}
