-- Migration: supporto sblocco foto gratuita a $0.99
-- Eseguire manualmente: psql $DATABASE_URL -f backend/migrations/001_unlock_photo.sql

-- Colonna per tracciare quando la foto è stata sbloccata con pagamento
ALTER TABLE jobs_memory_frame
  ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP;

-- Immagine pulita (solo per generazioni free): usata dopo pagamento $0.99
ALTER TABLE jobs_memory_frame
  ADD COLUMN IF NOT EXISTS output_image_base64 TEXT;

ALTER TABLE jobs_memory_frame
  ADD COLUMN IF NOT EXISTS output_mime_type VARCHAR(50);

COMMENT ON COLUMN jobs_memory_frame.unlocked_at IS 'Set when user pays $0.99 to unlock a free-generated photo';
COMMENT ON COLUMN jobs_memory_frame.output_image_base64 IS 'Clean image (no watermark), only stored for free-quota generations';
COMMENT ON COLUMN jobs_memory_frame.output_mime_type IS 'MIME type of output_image_base64';
