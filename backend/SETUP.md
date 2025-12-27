# MemoryFrame Backend Setup

## Requisiti

- Node.js 20+
- Redis (obbligatorio per rate limiting globale)
- OpenAI API Key (opzionale per sviluppo, obbligatorio in produzione)

## Installazione Locale

```bash
cd backend
npm install
```

## Configurazione Ambiente

Crea un file `.env` nella cartella `backend`:

```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-image-1

# Redis (obbligatorio)
REDIS_URL=redis://localhost:6379

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# Rate Limiting
GLOBAL_LIMIT_PER_HOUR=10
GLOBAL_WINDOW_SECONDS=3600
IP_LIMIT_PER_HOUR=20

# Upload
MAX_UPLOAD_MB=10

# Server
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

## Avviare Redis Locale

Con Docker:
```bash
docker run -d -p 6379:6379 redis:alpine
```

Con Homebrew (macOS):
```bash
brew install redis
brew services start redis
```

## Avvio in Sviluppo

```bash
npm run dev
```

Il server partirà su `http://localhost:8080`.

**Nota:** Senza `OPENAI_API_KEY`, il server funziona in modalità mock (restituisce immagini placeholder).

## Build per Produzione

```bash
npm run build
npm start
```

## Deploy su Render.com

### 1. Crea un nuovo Web Service

- Repository: collega il tuo repo GitHub
- Root Directory: `backend`
- Environment: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### 2. Configura Redis

- Crea un nuovo Redis su Render
- Copia l'URL interno (es: `redis://red-xxx:6379`)

### 3. Environment Variables

Aggiungi queste variabili in Render:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | `sk-your-key` |
| `OPENAI_MODEL` | `gpt-image-1` |
| `REDIS_URL` | `redis://red-xxx:6379` |
| `FRONTEND_ORIGIN` | `https://yourapp.com` |
| `NODE_ENV` | `production` |
| `LOG_LEVEL` | `info` |

### 4. Health Check

Configura health check su `/health`.

## Endpoints

### GET /health

Verifica stato del server.

```bash
curl http://localhost:8080/health
```

Risposta:
```json
{
  "status": "ok",
  "uptime": 120,
  "timestamp": "2025-01-01T12:00:00.000Z",
  "redis": "connected",
  "rate_limit": {
    "current": 2,
    "limit": 10,
    "window_seconds": 3600
  }
}
```

### POST /api/generate

Genera un'immagine AI combinando due persone e uno sfondo.

**Content-Type:** `multipart/form-data`

**Campi richiesti:**
- `personA`: file immagine (jpg/png/webp, max 10MB)
- `personB`: file immagine (jpg/png/webp, max 10MB)
- `background`: file immagine (jpg/png/webp, max 10MB)
- `style`: stringa (`photorealistic`, `vintage`, `cinematic`, `painterly`)
- `scene`: descrizione della scena

**Campi opzionali:**
- `size`: `1024x1024`, `1536x1024`, `1024x1536`, `auto` (default: `1024x1024`)
- `quality`: `low`, `medium`, `high` (default: `medium`)
- `output_format`: `png`, `jpeg`, `webp` (default: `webp`)
- `output_compression`: 1-100 (default: `80`)
- `delete_policy`: `immediate` o `24h` (default: `immediate`)
- `client_request_id`: UUID per tracciamento (generato automaticamente se assente)

## Rate Limiting

Il sistema ha un limite globale di **10 immagini generate per ora**, condiviso tra tutte le istanze.

Quando il limite è raggiunto, il server risponde:
```json
{
  "error": "GLOBAL_RATE_LIMIT",
  "message": "System is busy. Try again soon.",
  "retry_after_seconds": 1234
}
```

C'è anche un limite per IP di 20 richieste/ora.

## Note Importanti

⚠️ **Redis è obbligatorio** per il rate limiting globale. Senza Redis, il rate limiting non funziona correttamente con più istanze del server.

⚠️ **OpenAI API Key** è obbligatoria in produzione. Senza, il server usa una modalità mock che restituisce immagini placeholder.

