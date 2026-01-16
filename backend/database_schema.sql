-- MemoryFrame Database Schema
-- Eseguire questo script in PostgreSQL per creare tutte le tabelle necessarie

-- Tabella Users (utenti autenticati e anonimi)
CREATE TABLE IF NOT EXISTS users_memory_frame (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    credits_photo INT NOT NULL DEFAULT 0,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_memory_frame ON users_memory_frame(email);
CREATE INDEX IF NOT EXISTS idx_stripe_customer_id_memory_frame ON users_memory_frame(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_token_memory_frame ON users_memory_frame(email_verification_token);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column_memory_frame()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_memory_frame_updated_at BEFORE UPDATE ON users_memory_frame
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_memory_frame();

-- Tabella IP Daily Usage (traccia utilizzo free credit per IP)
CREATE TABLE IF NOT EXISTS ip_daily_usage_memory_frame (
    id CHAR(36) PRIMARY KEY,
    ip_hash VARCHAR(64) NOT NULL,
    usage_date DATE NOT NULL,
    free_images_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (ip_hash, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_ip_hash_memory_frame ON ip_daily_usage_memory_frame(ip_hash);
CREATE INDEX IF NOT EXISTS idx_usage_date_memory_frame ON ip_daily_usage_memory_frame(usage_date);

CREATE TRIGGER update_ip_daily_usage_memory_frame_updated_at BEFORE UPDATE ON ip_daily_usage_memory_frame
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_memory_frame();

-- Tabella Credit Transactions (audit completo operazioni crediti)
CREATE TYPE transaction_kind_memory_frame AS ENUM ('grant', 'spend', 'refund');

CREATE TABLE IF NOT EXISTS credit_transactions_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    kind transaction_kind_memory_frame NOT NULL,
    photo_delta INT NOT NULL DEFAULT 0,
    reason VARCHAR(500) NOT NULL,
    stripe_event_id VARCHAR(255),
    job_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id_credit_transactions_memory_frame ON credit_transactions_memory_frame(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_event_id_memory_frame ON credit_transactions_memory_frame(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_job_id_memory_frame ON credit_transactions_memory_frame(job_id);
CREATE INDEX IF NOT EXISTS idx_created_at_credit_transactions_memory_frame ON credit_transactions_memory_frame(created_at);
CREATE INDEX IF NOT EXISTS idx_kind_memory_frame ON credit_transactions_memory_frame(kind);

-- Tabella Email Verifications (token di verifica email)
CREATE TABLE IF NOT EXISTS email_verifications_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_memory_frame ON email_verifications_memory_frame(token);
CREATE INDEX IF NOT EXISTS idx_user_id_email_verifications_memory_frame ON email_verifications_memory_frame(user_id);
CREATE INDEX IF NOT EXISTS idx_expires_at_memory_frame ON email_verifications_memory_frame(expires_at);

-- Tabella Jobs (opzionale, per tracciare generazioni immagini)
CREATE TYPE job_type_memory_frame AS ENUM ('t2i', 'paint_by_numbers', 'edit');
CREATE TYPE job_status_memory_frame AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS jobs_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    request_id VARCHAR(255) NOT NULL,
    type job_type_memory_frame NOT NULL,
    status job_status_memory_frame DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_id_jobs_memory_frame ON jobs_memory_frame(user_id);
CREATE INDEX IF NOT EXISTS idx_request_id_memory_frame ON jobs_memory_frame(request_id);
CREATE INDEX IF NOT EXISTS idx_status_memory_frame ON jobs_memory_frame(status);
CREATE INDEX IF NOT EXISTS idx_created_at_jobs_memory_frame ON jobs_memory_frame(created_at);

CREATE TRIGGER update_jobs_memory_frame_updated_at BEFORE UPDATE ON jobs_memory_frame
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_memory_frame();

-- Tabella Refresh Tokens (per autenticazione JWT)
CREATE TABLE IF NOT EXISTS refresh_tokens_memory_frame (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_memory_frame(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id_refresh_tokens_memory_frame ON refresh_tokens_memory_frame(user_id);
CREATE INDEX IF NOT EXISTS idx_token_refresh_memory_frame ON refresh_tokens_memory_frame(token);
CREATE INDEX IF NOT EXISTS idx_expires_at_refresh_memory_frame ON refresh_tokens_memory_frame(expires_at);
