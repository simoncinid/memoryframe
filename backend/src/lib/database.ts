import mysql from 'mysql2/promise';
import { config } from './config.js';

let pool: mysql.Pool | null = null;

export function getDatabasePool(): mysql.Pool {
  if (!pool) {
    const dbUrl = new URL(config.databaseUrl);
    
    pool = mysql.createPool({
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306', 10),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove leading /
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    pool.on('connection', () => {
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
    const [rows] = await pool.execute('SELECT 1 as test');
    return Array.isArray(rows) && rows.length > 0;
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
