import { Pool } from 'pg';
import { config } from './config.js';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const dbUrl = config.databaseUrl;
    
    pool = new Pool({
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
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
