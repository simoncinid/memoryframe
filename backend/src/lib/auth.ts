import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Pool } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import { config } from './config.js';
import { getDatabasePool } from './database.js';
import type { User, RefreshToken } from './database.js';
import { sendVerificationEmail } from './email.js';

export interface JWTPayload {
  userId: string;
  email: string | null;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Crea un nuovo utente con password hashata
 */
export async function createUserMemoryFrame(
  db: Pool,
  email: string,
  password: string
): Promise<{ user: User; verificationToken: string }> {
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 ore

  await db.execute(
    `INSERT INTO users_memory_frame 
     (id, email, password_hash, email_verified, email_verification_token, email_verification_expires_at, credits_photo)
     VALUES (?, ?, ?, FALSE, ?, ?, 0)`,
    [userId, email, passwordHash, verificationToken, expiresAt]
  );

  // Crea record email verification
  await db.execute(
    `INSERT INTO email_verifications_memory_frame (id, user_id, token, expires_at)
     VALUES (?, ?, ?, ?)`,
    [uuidv4(), userId, verificationToken, expiresAt]
  );

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE id = ?`,
    [userId]
  );

  const user = rows[0] as User;

  // Invia email di verifica
  await sendVerificationEmail(email, verificationToken);

  return { user, verificationToken };
}

/**
 * Verifica credenziali utente
 */
export async function verifyUserCredentialsMemoryFrame(
  db: Pool,
  email: string,
  password: string
): Promise<User | null> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0] as User;

  if (!user.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return user;
}

/**
 * Genera token JWT
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Genera refresh token e lo salva nel database
 */
export async function generateRefreshTokenMemoryFrame(
  db: Pool,
  userId: string
): Promise<string> {
  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 giorni

  await db.execute(
    `INSERT INTO refresh_tokens_memory_frame (id, user_id, token, expires_at)
     VALUES (?, ?, ?, ?)`,
    [tokenId, userId, token, expiresAt]
  );

  return token;
}

/**
 * Verifica e decodifica access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica refresh token e restituisce nuovo access token
 */
export async function refreshAccessTokenMemoryFrame(
  db: Pool,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    // Verifica token
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string; tokenId: string };

    // Verifica che esista nel database
    const [rows] = await db.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM refresh_tokens_memory_frame 
       WHERE id = ? AND token = ? AND expires_at > NOW()`,
      [decoded.tokenId, refreshToken]
    );

    if (rows.length === 0) {
      return null;
    }

    // Carica utente
    const [userRows] = await db.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM users_memory_frame WHERE id = ?`,
      [decoded.userId]
    );

    if (userRows.length === 0) {
      return null;
    }

    const user = userRows[0] as User;

    // Genera nuovo access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      emailVerified: user.email_verified,
    });

    // Genera nuovo refresh token
    const newRefreshToken = await generateRefreshTokenMemoryFrame(db, user.id);

    // Elimina vecchio refresh token
    await db.execute(
      `DELETE FROM refresh_tokens_memory_frame WHERE id = ?`,
      [decoded.tokenId]
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return null;
  }
}

/**
 * Verifica email utente
 */
export async function verifyEmailMemoryFrame(
  db: Pool,
  token: string
): Promise<boolean> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT ev.*, u.id as user_id
     FROM email_verifications_memory_frame ev
     JOIN users_memory_frame u ON ev.user_id = u.id
     WHERE ev.token = ? AND ev.expires_at > NOW() AND ev.verified_at IS NULL`,
    [token]
  );

  if (rows.length === 0) {
    return false;
  }

  const verification = rows[0];

  // Aggiorna utente
  await db.execute(
    `UPDATE users_memory_frame 
     SET email_verified = TRUE, 
         email_verification_token = NULL,
         email_verification_expires_at = NULL
     WHERE id = ?`,
    [verification.user_id]
  );

  // Marca verifica come completata
  await db.execute(
    `UPDATE email_verifications_memory_frame 
     SET verified_at = NOW() 
     WHERE id = ?`,
    [verification.id]
  );

  return true;
}

/**
 * Invia nuova email di verifica
 */
export async function resendVerificationEmailMemoryFrame(
  db: Pool,
  userId: string
): Promise<boolean> {
  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT * FROM users_memory_frame WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0 || !rows[0].email) {
    return false;
  }

  const user = rows[0] as User;

  if (user.email_verified) {
    return false; // Già verificato
  }

  // Genera nuovo token
  const verificationToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await db.execute(
    `UPDATE users_memory_frame 
     SET email_verification_token = ?, 
         email_verification_expires_at = ?
     WHERE id = ?`,
    [verificationToken, expiresAt, userId]
  );

  // Crea nuovo record verifica
  await db.execute(
    `INSERT INTO email_verifications_memory_frame (id, user_id, token, expires_at)
     VALUES (?, ?, ?, ?)`,
    [uuidv4(), userId, verificationToken, expiresAt]
  );

  // Invia email
  await sendVerificationEmail(user.email, verificationToken);

  return true;
}

/**
 * Logout - elimina refresh token
 */
export async function logoutMemoryFrame(
  db: Pool,
  refreshToken: string
): Promise<boolean> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { tokenId: string };
    await db.execute(
      `DELETE FROM refresh_tokens_memory_frame WHERE id = ?`,
      [decoded.tokenId]
    );
    return true;
  } catch (error) {
    return false;
  }
}
