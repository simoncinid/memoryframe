import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'pg';
import type { User, IPDailyUsage } from './database.js';

/**
 * Controlla se l'IP ha ancora quota gratuita disponibile oggi
 * @returns (has_quota: bool, remaining: int)
 */
export async function checkFreeQuotaMemoryFrame(
  db: Pool,
  ipHash: string
): Promise<{ hasQuota: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const result = await db.query(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = $1 AND usage_date = $2`,
    [ipHash, today]
  );

  if (result.rows.length === 0) {
    // Nessun record per oggi = quota disponibile
    return { hasQuota: true, remaining: 1 };
  }

  const usage = result.rows[0] as IPDailyUsage;
  const remaining = Math.max(0, 1 - usage.free_images_used);

  return {
    hasQuota: remaining > 0,
    remaining,
  };
}

/**
 * Usa la quota gratuita per l'IP (1 immagine al giorno)
 * @returns true se successo, false se quota esaurita
 */
export async function useFreeQuotaMemoryFrame(
  db: Pool,
  ipHash: string
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  // Usa INSERT ... ON CONFLICT ... DO UPDATE per atomicità
  await db.query(
    `INSERT INTO ip_daily_usage_memory_frame (id, ip_hash, usage_date, free_images_used)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (ip_hash, usage_date) DO UPDATE
       SET free_images_used = CASE 
         WHEN ip_daily_usage_memory_frame.free_images_used >= 1 
         THEN ip_daily_usage_memory_frame.free_images_used 
         ELSE ip_daily_usage_memory_frame.free_images_used + 1 
       END,
       updated_at = CURRENT_TIMESTAMP`,
    [uuidv4(), ipHash, today]
  );

  // Verifica se l'update ha effettivamente incrementato
  const result = await db.query(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = $1 AND usage_date = $2`,
    [ipHash, today]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const usage = result.rows[0] as IPDailyUsage;
  return usage.free_images_used <= 1;
}

/**
 * Controlla se l'utente ha crediti sufficienti
 */
export async function checkUserCreditsMemoryFrame(
  db: Pool,
  userId: string,
  photoNeeded: number = 0
): Promise<boolean> {
  const result = await db.query(
    `SELECT credits_photo FROM users_memory_frame WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const user = result.rows[0] as User;
  return photoNeeded === 0 || user.credits_photo >= photoNeeded;
}

/**
 * Spende crediti foto per un utente
 * @returns true se successo, false se crediti insufficienti
 */
export async function spendCreditsMemoryFrame(
  db: Pool,
  userId: string,
  photoAmount: number,
  reason: string,
  jobId: string | null = null
): Promise<boolean> {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Verifica crediti disponibili
    const userResult = await client.query(
      `SELECT credits_photo FROM users_memory_frame WHERE id = $1 FOR UPDATE`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const user = userResult.rows[0] as User;
    if (user.credits_photo < photoAmount) {
      await client.query('ROLLBACK');
      return false;
    }

    // Decrementa crediti
    await client.query(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [photoAmount, userId]
    );

    // Crea transazione
    await client.query(
      `INSERT INTO credit_transactions_memory_frame 
       (id, user_id, kind, photo_delta, reason, job_id)
       VALUES ($1, $2, 'spend', $3, $4, $5)`,
      [uuidv4(), userId, -photoAmount, reason, jobId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Assegna crediti foto a un utente
 * @returns true se successo
 */
export async function grantCreditsMemoryFrame(
  db: Pool,
  userId: string,
  photoAmount: number,
  reason: string,
  stripeEventId: string | null = null
): Promise<boolean> {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Incrementa crediti
    await client.query(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [photoAmount, userId]
    );

    // Crea transazione
    await client.query(
      `INSERT INTO credit_transactions_memory_frame 
       (id, user_id, kind, photo_delta, reason, stripe_event_id)
       VALUES ($1, $2, 'grant', $3, $4, $5)`,
      [uuidv4(), userId, photoAmount, reason, stripeEventId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ottiene l'utente dal database
 */
export async function getUserById(
  db: Pool,
  userId: string
): Promise<User | null> {
  const result = await db.query(
    `SELECT * FROM users_memory_frame WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
}

/**
 * Ottiene o crea un utente per email
 */
export async function getOrCreateUserByEmail(
  db: Pool,
  email: string
): Promise<User> {
  const result = await db.query(
    `SELECT * FROM users_memory_frame WHERE email = $1`,
    [email]
  );

  if (result.rows.length > 0) {
    return result.rows[0] as User;
  }

  // Crea nuovo utente
  const userId = uuidv4();
  await db.query(
    `INSERT INTO users_memory_frame (id, email, email_verified, credits_photo)
     VALUES ($1, $2, FALSE, 0)`,
    [userId, email]
  );

  const newResult = await db.query(
    `SELECT * FROM users_memory_frame WHERE id = $1`,
    [userId]
  );

  return newResult.rows[0] as User;
}
