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
    
    // Rimuovi parametri SSL dalla connection string per evitare conflitti
    // Gestiremo SSL solo tramite l'oggetto ssl nel Pool
    // I parametri SSL nella connection string (come sslmode=require) forzano la verifica del certificato
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
    
    // Determina se serve SSL
    if (config.nodeEnv === 'production') {
      // In produzione, abilita sempre SSL
      needsSsl = true;
    }
    
    // Se CA_FILE è presente, gestiscilo (può essere un percorso o il contenuto del certificato)
    if (config.databaseCaFile) {
      try {
        // Se inizia con "-----BEGIN", è il contenuto del certificato stesso
        if (config.databaseCaFile.trim().startsWith('-----BEGIN')) {
          // Usa direttamente il contenuto, sostituendo \n con newline reali
          sslConfig.ca = config.databaseCaFile.replace(/\\n/g, '\n');
        } else {
          // Altrimenti, è un percorso a un file
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
    
    // Se siamo in produzione o abbiamo bisogno di SSL, configura rejectUnauthorized
    if (needsSsl && !sslConfig.ca) {
      // Se siamo in produzione senza CA_FILE, usa rejectUnauthorized dalla config
      // Su Render i certificati sono spesso autofirmati, quindi impostiamo false
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
