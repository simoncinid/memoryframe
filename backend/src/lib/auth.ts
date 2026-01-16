import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Pool } from 'pg';
import { config } from './config.js';
import type { User } from './database.js';
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
 * Creates a new user with hashed password
 */
/**
 * Generates a 6-digit numeric verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createUserMemoryFrame(
  db: Pool,
  email: string,
  password: string
): Promise<{ user: User; verificationCode: string }> {
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = generateVerificationCode();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  await db.query(
    `INSERT INTO users_memory_frame 
     (id, email, password_hash, email_verified, email_verification_token, email_verification_expires_at, credits_photo)
     VALUES ($1, $2, $3, FALSE, $4, $5, 0)`,
    [userId, email, passwordHash, verificationCode, expiresAt]
  );

  // Create email verification record
  await db.query(
    `INSERT INTO email_verifications_memory_frame (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, verificationCode, expiresAt]
  );

  const result = await db.query(
    `SELECT * FROM users_memory_frame WHERE id = $1`,
    [userId]
  );

  const user = result.rows[0] as User;

  // Send verification email
  await sendVerificationEmail(email, verificationCode);

  return { user, verificationCode };
}

/**
 * Verifies user credentials
 */
export async function verifyUserCredentialsMemoryFrame(
  db: Pool,
  email: string,
  password: string
): Promise<User | null> {
  const result = await db.query(
    `SELECT * FROM users_memory_frame WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0] as User;

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
    expiresIn: String(config.jwtExpiresIn),
  } as SignOptions);
}

/**
 * Generates refresh token and saves it to the database
 */
export async function generateRefreshTokenMemoryFrame(
  db: Pool,
  userId: string
): Promise<string> {
  const tokenId = uuidv4();
  const token = jwt.sign({ userId, tokenId }, config.jwtSecret, {
    expiresIn: String(config.jwtRefreshExpiresIn),
  } as SignOptions);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await db.query(
    `INSERT INTO refresh_tokens_memory_frame (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [tokenId, userId, token, expiresAt]
  );

  return token;
}

/**
 * Verifies and decodes access token
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
 * Verifies refresh token and returns new access token
 */
export async function refreshAccessTokenMemoryFrame(
  db: Pool,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    // Verify token
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string; tokenId: string };

    // Verify it exists in database
    const result = await db.query(
      `SELECT * FROM refresh_tokens_memory_frame 
       WHERE id = $1 AND token = $2 AND expires_at > NOW()`,
      [decoded.tokenId, refreshToken]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Load user
    const userResult = await db.query(
      `SELECT * FROM users_memory_frame WHERE id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0] as User;

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      emailVerified: user.email_verified,
    });

    // Generate new refresh token
    const newRefreshToken = await generateRefreshTokenMemoryFrame(db, user.id);

    // Delete old refresh token
    await db.query(
      `DELETE FROM refresh_tokens_memory_frame WHERE id = $1`,
      [decoded.tokenId]
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    return null;
  }
}

/**
 * Verifies user email with code
 */
export async function verifyEmailMemoryFrame(
  db: Pool,
  code: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT ev.*, u.id as user_id
     FROM email_verifications_memory_frame ev
     JOIN users_memory_frame u ON ev.user_id = u.id
     WHERE ev.token = $1 AND ev.expires_at > NOW() AND ev.verified_at IS NULL`,
    [code]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const verification = result.rows[0];

  // Update user
  await db.query(
    `UPDATE users_memory_frame 
     SET email_verified = TRUE, 
         email_verification_token = NULL,
         email_verification_expires_at = NULL
     WHERE id = $1`,
    [verification.user_id]
  );

  // Mark verification as completed
  await db.query(
    `UPDATE email_verifications_memory_frame 
     SET verified_at = NOW() 
     WHERE id = $1`,
    [verification.id]
  );

  return true;
}

/**
 * Sends new verification email
 */
export async function resendVerificationEmailMemoryFrame(
  db: Pool,
  userId: string
): Promise<boolean> {
  const result = await db.query(
    `SELECT * FROM users_memory_frame WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0 || !result.rows[0].email) {
    return false;
  }

  const user = result.rows[0] as User;

  if (user.email_verified) {
    return false; // Already verified
  }

  // Generate new code
  const verificationCode = generateVerificationCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await db.query(
    `UPDATE users_memory_frame 
     SET email_verification_token = $1, 
         email_verification_expires_at = $2
     WHERE id = $3`,
    [verificationCode, expiresAt, userId]
  );

  // Create new verification record
  await db.query(
    `INSERT INTO email_verifications_memory_frame (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [uuidv4(), userId, verificationCode, expiresAt]
  );

  // Send email
  if (user.email) {
    await sendVerificationEmail(user.email, verificationCode);
  }

  return true;
}

/**
 * Logout - deletes refresh token
 */
export async function logoutMemoryFrame(
  db: Pool,
  refreshToken: string
): Promise<boolean> {
  try {
    const decoded = jwt.verify(refreshToken, config.jwtSecret) as { tokenId: string };
    await db.query(
      `DELETE FROM refresh_tokens_memory_frame WHERE id = $1`,
      [decoded.tokenId]
    );
    return true;
  } catch (error) {
    return false;
  }
}
