import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { config } from './config.js';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    let dbUrl = config.databaseUrl;
    
    // Configura SSL per PostgreSQL
    // Su Render e altri provider cloud, PostgreSQL richiede SSL
    const sslConfig: any = {};
    let needsSsl = false;
    
    // Remove SSL parameters from connection string to avoid conflicts
    // We'll handle SSL only through the ssl object in the Pool
    // SSL parameters in the connection string (like sslmode=require) force certificate verification
    const sslParams = ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'sslcrl'];
    const urlParts = dbUrl.split('?');
    if (urlParts.length > 1) {
      const baseUrl = urlParts[0];
      const queryString = urlParts[1];
      const params = new URLSearchParams(queryString);
      sslParams.forEach(param => params.delete(param));
      const newQueryString = params.toString();
      dbUrl = newQueryString ? `${baseUrl}?${newQueryString}` : baseUrl;
    }
    
    // Determine if SSL is needed
    if (config.nodeEnv === 'production') {
      // In production, always enable SSL
      needsSsl = true;
    }
    
    // If CA_FILE is present, handle it (can be a path or certificate content)
    if (config.databaseCaFile) {
      try {
        // If it starts with "-----BEGIN", it's the certificate content itself
        if (config.databaseCaFile.trim().startsWith('-----BEGIN')) {
          // Use the content directly, replacing \n with real newlines
          sslConfig.ca = config.databaseCaFile.replace(/\\n/g, '\n');
        } else {
          // Otherwise, it's a file path
          sslConfig.ca = readFileSync(config.databaseCaFile).toString();
        }
        sslConfig.rejectUnauthorized = config.databaseSslRejectUnauthorized;
        needsSsl = true;
      } catch (error) {
        console.warn('[Database] Failed to read CA_FILE, falling back to rejectUnauthorized:', error);
        sslConfig.rejectUnauthorized = config.databaseSslRejectUnauthorized;
        needsSsl = true;
      }
    }
    
    // If we're in production or need SSL, configure rejectUnauthorized
    if (needsSsl && !sslConfig.ca) {
      // If we're in production without CA_FILE, use rejectUnauthorized from config
      // On Render certificates are often self-signed, so we set false
      sslConfig.rejectUnauthorized = config.databaseSslRejectUnauthorized;
    }
    
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ...(needsSsl ? { ssl: sslConfig } : {}),
    });

    pool.on('connect', () => {
      console.log('[Database] New connection established');
    });

    pool.on('error', (err: Error) => {
      console.error('[Database] Pool error:', err.message);
    });
  }

  return pool;
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const pool = getDatabasePool();
    const result = await pool.query('SELECT 1 as test');
    return result.rows.length > 0;
  } catch (error) {
    console.error('[Database] Connection test failed:', error);
    return false;
  }
}

// Database types
export interface User {
  id: string;
  email: string | null;
  password_hash: string | null;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires_at: Date | null;
  credits_photo: number;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IPDailyUsage {
  id: string;
  ip_hash: string;
  usage_date: Date;
  free_images_used: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  kind: 'grant' | 'spend' | 'refund';
  photo_delta: number;
  reason: string;
  stripe_event_id: string | null;
  job_id: string | null;
  created_at: Date;
}

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}

export interface Job {
  id: string;
  user_id: string | null;
  request_id: string;
  type: 't2i' | 'paint_by_numbers' | 'edit';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}
