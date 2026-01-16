# Implementazione Sistema Crediti e Pagamenti - MemoryFrame

## ✅ Completato

Sistema completo di crediti, pagamenti Stripe e autenticazione implementato su backend e frontend.

## 📋 Database Setup

### 1. Eseguire lo script SQL

Eseguire il file `backend/database_schema.sql` nel database MySQL:

```bash
mysql -u your_user -p your_database < backend/database_schema.sql
```

Oppure copiare e incollare il contenuto del file in un client MySQL (phpMyAdmin, MySQL Workbench, ecc.).

### 2. Tabelle create

- `users_memory_frame` - Utenti con crediti e info Stripe
- `ip_daily_usage_memory_frame` - Traccia free quota giornaliera per IP
- `credit_transactions_memory_frame` - Audit completo transazioni crediti
- `email_verifications_memory_frame` - Token verifica email
- `jobs_memory_frame` - Traccia generazioni immagini
- `refresh_tokens_memory_frame` - Token refresh JWT

## 🔧 Configurazione Backend

### 1. Installare dipendenze

```bash
cd backend
npm install
```

### 2. Configurare variabili ambiente

Creare file `.env` in `backend/` basato su `backend/env.example`:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/memoryframe_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# IP Hashing
IP_SALT=your-ip-salt-secret-change-in-production

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (per verifica email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@memoryframe.com
EMAIL_FROM_NAME=MemoryFrame

# Pricing
PRICE_PER_PHOTO_CREDIT=19  # in centesimi ($0.19 per credito)
```

### 3. Configurare Stripe Webhook

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Crea nuovo webhook endpoint: `https://your-backend-url.com/v1/stripe/webhook`
3. Seleziona evento: `checkout.session.completed`
4. Copia il webhook secret e aggiungilo a `STRIPE_WEBHOOK_SECRET`

## 🎨 Configurazione Frontend

### 1. Aggiungere variabile ambiente

Creare o aggiornare `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

In produzione:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

## 🚀 Avvio

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
npm run dev
```

## 📍 Endpoint Implementati

### Autenticazione
- `POST /v1/auth/register` - Registrazione
- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh` - Refresh token
- `GET /v1/auth/me` - Get current user
- `GET /v1/auth/verify-email?token=...` - Verifica email
- `POST /v1/auth/resend-verification` - Reinvia email verifica
- `POST /v1/auth/logout` - Logout

### Crediti
- `GET /v1/free-quota` - Controlla quota gratuita IP
- `GET /v1/transactions` - Lista transazioni utente (autenticato)
- `GET /v1/pricing` - Lista prezzi e pack disponibili

### Stripe
- `POST /v1/stripe/create-dynamic-checkout` - Crea checkout session (autenticato)
- `POST /v1/stripe/webhook` - Webhook Stripe (pubblico, verifica firma)

### Generazione Immagini (modificati)
- `POST /api/generate` - Ora richiede crediti o free quota
- `POST /api/paint-by-numbers` - Ora richiede crediti o free quota

## 🎯 Flusso Utente

### Utente Anonimo
1. Può generare 1 immagine gratuita al giorno (basato su IP)
2. Se quota esaurita, deve registrarsi o acquistare crediti

### Utente Autenticato
1. Può usare crediti acquistati
2. Se crediti esauriti, può usare free quota IP (1 al giorno)
3. Può acquistare crediti da `/purchase-credits`
4. Può vedere transazioni da `/transactions`

## 🔐 Sicurezza

- **Hash IP**: Gli IP sono hashati con SHA256 + salt (non salvati in chiaro)
- **JWT**: Token con scadenza e refresh token
- **Stripe Webhook**: Verifica firma obbligatoria
- **Idempotenza**: Controllo duplicati webhook tramite `stripe_event_id`
- **Transazioni Atomiche**: Operazioni crediti in transazioni database

## 📝 Note

- Free quota si resetta a mezzanotte (basato su data)
- Prezzo default: $0.19 per credito (19 centesimi)
- Email verifica obbligatoria per account completi
- Refresh token valido 30 giorni
- Access token valido 7 giorni

## 🐛 Troubleshooting

### Database connection error
- Verificare `DATABASE_URL` nel formato corretto: `mysql://user:password@host:port/database`
- Verificare che il database esista e l'utente abbia i permessi

### Stripe webhook non funziona
- Verificare che `STRIPE_WEBHOOK_SECRET` sia corretto
- Verificare che l'endpoint webhook sia accessibile pubblicamente
- Controllare i log backend per errori di verifica firma

### Email non inviate
- Verificare credenziali SMTP
- Per Gmail, usare "App Password" invece della password normale
- Verificare che `SMTP_HOST` e `SMTP_PORT` siano corretti

## 📦 File Creati/Modificati

### Backend
- `backend/database_schema.sql` - Schema database
- `backend/src/lib/database.ts` - Connessione MySQL
- `backend/src/lib/credits.ts` - Funzioni gestione crediti
- `backend/src/lib/auth.ts` - Autenticazione JWT
- `backend/src/lib/email.ts` - Invio email
- `backend/src/lib/ip.ts` - Utility IP
- `backend/src/routes/auth.ts` - Route autenticazione
- `backend/src/routes/stripe.ts` - Route Stripe
- `backend/src/routes/credits.ts` - Route crediti
- `backend/src/routes/generate.ts` - Modificato per crediti
- `backend/src/routes/paintByNumbers.ts` - Modificato per crediti
- `backend/src/server.ts` - Aggiunte nuove route
- `backend/src/lib/config.ts` - Aggiunte nuove config

### Frontend
- `src/lib/auth.ts` - Utility autenticazione
- `src/lib/credits.ts` - Utility crediti
- `src/app/login/page.tsx` - Pagina login/registrazione
- `src/app/verify-email/page.tsx` - Verifica email
- `src/app/purchase-credits/page.tsx` - Acquisto crediti
- `src/app/transactions/page.tsx` - Visualizzazione transazioni
- `src/app/purchase-success/page.tsx` - Successo pagamento
- `src/app/purchase-cancel/page.tsx` - Annullamento pagamento
- `src/components/Navbar.tsx` - Aggiornato con crediti e login

## ✅ Prossimi Passi

1. Eseguire lo script SQL nel database
2. Configurare variabili ambiente backend
3. Configurare Stripe e webhook
4. Configurare SMTP per email
5. Testare registrazione/login
6. Testare acquisto crediti
7. Testare generazione immagini con crediti
