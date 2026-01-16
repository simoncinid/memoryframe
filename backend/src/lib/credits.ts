import { v4 as uuidv4 } from 'uuid';
import type { Pool } from 'mysql2/promise';
import mysql from 'mysql2/promise';
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

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = ? AND usage_date = ?`,
    [ipHash, today]
  );

  if (rows.length === 0) {
    // Nessun record per oggi = quota disponibile
    return { hasQuota: true, remaining: 1 };
  }

  const usage = rows[0] as IPDailyUsage;
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

  // Usa INSERT ... ON DUPLICATE KEY UPDATE per atomicità
  await db.execute(
    `INSERT INTO ip_daily_usage_memory_frame (id, ip_hash, usage_date, free_images_used)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE
       free_images_used = IF(free_images_used >= 1, free_images_used, free_images_used + 1),
       updated_at = CURRENT_TIMESTAMP`,
    [uuidv4(), ipHash, today]
  );

  // Verifica se l'update ha effettivamente incrementato
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT free_images_used 
     FROM ip_daily_usage_memory_frame 
     WHERE ip_hash = ? AND usage_date = ?`,
    [ipHash, today]
  );

  if (rows.length === 0) {
    return false;
  }

  const usage = rows[0] as IPDailyUsage;
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
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT credits_photo FROM users_memory_frame WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return false;
  }

  const user = rows[0] as User;
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
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verifica crediti disponibili
    const [userRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT credits_photo FROM users_memory_frame WHERE id = ? FOR UPDATE`,
      [userId]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return false;
    }

    const user = userRows[0] as User;
    if (user.credits_photo < photoAmount) {
      await connection.rollback();
      return false;
    }

    // Decrementa crediti
    await connection.execute(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo - ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [photoAmount, userId]
    );

    // Crea transazione
    await connection.execute(
      `INSERT INTO credit_transactions_memory_frame 
       (id, user_id, kind, photo_delta, reason, job_id)
       VALUES (?, ?, 'spend', ?, ?, ?)`,
      [uuidv4(), userId, -photoAmount, reason, jobId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
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
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Incrementa crediti
    await connection.execute(
      `UPDATE users_memory_frame 
       SET credits_photo = credits_photo + ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [photoAmount, userId]
    );

    // Crea transazione
    await connection.execute(
      `INSERT INTO credit_transactions_memory_frame 
       (id, user_id, kind, photo_delta, reason, stripe_event_id)
       VALUES (?, ?, 'grant', ?, ?, ?)`,
      [uuidv4(), userId, photoAmount, reason, stripeEventId]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Ottiene l'utente dal database
 */
export async function getUserById(
  db: Pool,
  userId: string
): Promise<User | null> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as User;
}

/**
 * Ottiene o crea un utente per email
 */
export async function getOrCreateUserByEmail(
  db: Pool,
  email: string
): Promise<User> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE email = ?`,
    [email]
  );

  if (rows.length > 0) {
    return rows[0] as User;
  }

  // Crea nuovo utente
  const userId = uuidv4();
  await db.execute(
    `INSERT INTO users_memory_frame (id, email, email_verified, credits_photo)
     VALUES (?, ?, FALSE, 0)`,
    [userId, email]
  );

  const [newRows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE id = ?`,
    [userId]
  );

  return newRows[0] as User;
}
