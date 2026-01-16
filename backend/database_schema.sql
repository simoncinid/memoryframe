-- MemoryFrame Database Schema
-- Eseguire questo script in MySQL per creare tutte le tabelle necessarie

-- Tabella Users (utenti autenticati e anonimi)
CREATE TABLE IF NOT EXISTS users_memory_frame (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at DATETIME,
    credits_photo INT NOT NULL DEFAULT 0,
    stripe_customer_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_stripe_customer_id (stripe_customer_id),
    INDEX idx_email_verification_token (email_verification_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella IP Daily Usage (traccia utilizzo free credit per IP)
CREATE TABLE IF NOT EXISTS ip_daily_usage_memory_frame (
    id CHAR(36) PRIMARY KEY,
    ip_hash VARCHAR(64) NOT NULL,
    usage_date DATE NOT NULL,
    free_images_used INT NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ip_date (ip_hash, usage_date),
    INDEX idx_ip_hash (ip_hash),
    INDEX idx_usage_date (usage_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Credit Transactions (audit completo operazioni crediti)
CREATE TABLE IF NOT EXISTS credit_transactions_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    kind ENUM('grant', 'spend', 'refund') NOT NULL,
    photo_delta INT NOT NULL DEFAULT 0,
    reason VARCHAR(500) NOT NULL,
    stripe_event_id VARCHAR(255),
    job_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_stripe_event_id (stripe_event_id),
    INDEX idx_job_id (job_id),
    INDEX idx_created_at (created_at),
    INDEX idx_kind (kind),
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Email Verifications (token di verifica email)
CREATE TABLE IF NOT EXISTS email_verifications_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Jobs (opzionale, per tracciare generazioni immagini)
CREATE TABLE IF NOT EXISTS jobs_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    request_id VARCHAR(255) NOT NULL,
    type ENUM('t2i', 'paint_by_numbers', 'edit') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME,
    INDEX idx_user_id (user_id),
    INDEX idx_request_id (request_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabella Refresh Tokens (per autenticazione JWT)
CREATE TABLE IF NOT EXISTS refresh_tokens_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
