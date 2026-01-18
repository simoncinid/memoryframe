import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'pg';
import type { User, IPDailyUsage } from './database.js';

/**
 * Checks if the device/IP still has free quota available today
 * Checks BOTH device_id AND IP - if either has been used today, blocks the request
 * @returns (has_quota: bool, remaining: int)
 */
export async function checkFreeQuotaMemoryFrame(
  db: Pool,
  ipHash: string,
  deviceIdHash?: string
): Promise<{ hasQuota: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Se abbiamo device_id, controlla prima quello
  if (deviceIdHash) {
    const deviceResult = await db.query(
      `SELECT free_images_used 
       FROM ip_daily_usage_memory_frame 
       WHERE device_id_hash = $1 AND usage_date = $2`,
      [deviceIdHash, today]
    );

    if (deviceResult.rows.length > 0) {
      const usage = deviceResult.rows[0] as IPDailyUsage;
      const remaining = Math.max(0, 1 - usage.free_images_used);
      return {
        hasQuota: remaining > 0,
        remaining,
      };
    }
    
    // Se device_id non ha record, controlla anche l'IP
    // Se l'IP è già stato usato oggi (con qualsiasi device_id o senza), blocca
    const ipResult = await db.query(
      `SELECT free_images_used 
       FROM ip_daily_usage_memory_frame 
       WHERE ip_hash = $1 AND usage_date = $2`,
      [ipHash, today]
    );

    if (ipResult.rows.length > 0) {
      const usage = ipResult.rows[0] as IPDailyUsage;
      const remaining = Math.max(0, 1 - usage.free_images_used);
      return {
        hasQuota: remaining > 0,
        remaining,
      };
    }

    // Né device_id né IP sono stati usati oggi
    return { hasQuota: true, remaining: 1 };
  }

  // Fallback a IP hash (retrocompatibilità)
  const result = await db.query(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = $1 AND usage_date = $2 AND device_id_hash IS NULL`,
    [ipHash, today]
  );

  if (result.rows.length === 0) {
    // No record for today = quota available
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
 * Uses free quota for the device/IP (1 image per day)
 * Prioritizes device_id over IP for anonymous users (more robust)
 * @returns true if successful, false if quota exhausted
 */
export async function useFreeQuotaMemoryFrame(
  db: Pool,
  ipHash: string,
  deviceIdHash?: string
): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  // Se abbiamo device_id, usa quello (più robusto)
  if (deviceIdHash) {
    await db.query(
      `INSERT INTO ip_daily_usage_memory_frame (id, ip_hash, device_id_hash, usage_date, free_images_used)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (device_id_hash, usage_date) DO UPDATE
         SET free_images_used = CASE 
           WHEN ip_daily_usage_memory_frame.free_images_used >= 1 
           THEN ip_daily_usage_memory_frame.free_images_used 
           ELSE ip_daily_usage_memory_frame.free_images_used + 1 
         END,
         updated_at = CURRENT_TIMESTAMP`,
      [uuidv4(), ipHash, deviceIdHash, today]
    );

    // Verify if the update actually incremented
    const result = await db.query(
      `SELECT free_images_used 
       FROM ip_daily_usage_memory_frame 
       WHERE device_id_hash = $1 AND usage_date = $2`,
      [deviceIdHash, today]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const usage = result.rows[0] as IPDailyUsage;
    return usage.free_images_used <= 1;
  }

  // Fallback a IP hash (retrocompatibilità)
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

  // Verify if the update actually incremented
  const result = await db.query(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = $1 AND usage_date = $2 AND device_id_hash IS NULL`,
    [ipHash, today]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const usage = result.rows[0] as IPDailyUsage;
  return usage.free_images_used <= 1;
}

/**
 * Checks if the user has sufficient credits
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
 * Spends photo credits for a user
 * @returns true if successful, false if insufficient credits
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

    // Verify available credits
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

    // Decrement credits
    await client.query(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo - $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [photoAmount, userId]
    );

    // Create transaction
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
 * Grants photo credits to a user
 * @returns true if successful
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

    // Increment credits
    await client.query(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [photoAmount, userId]
    );

    // Create transaction
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
 * Gets the user from the database
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
 * Gets or creates a user by email
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

  // Create new user
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
