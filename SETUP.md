# ClinicBot — Local Setup Guide

## 1. Prerequisites
- Docker Desktop running
- Node.js 20+
- ngrok account (free): https://ngrok.com
- Meta Developer account: https://developers.facebook.com

---

## 2. Environment

```bash
cp .env.example apps/api/.env
# Fill in: WHATSAPP_VERIFY_TOKEN (any random string), OPENAI_API_KEY
# Leave WhatsApp fields as DEMO_* for now
```

---

## 3. Start infrastructure

```bash
docker compose up -d
# Postgres on :5432, Redis on :6379
```

---

## 4. Database

```bash
# Generate Prisma client
npm run db:generate -w @clinic-bot/api

# Create tables
npm run db:migrate -w @clinic-bot/api
# Enter migration name when prompted: "init"

# Seed demo data (clinic + 2 doctors + services)
npm run db:seed -w @clinic-bot/api
# Copy the printed Tenant ID → paste as VITE_TENANT_ID in apps/web/.env
```

---

## 5. Run the apps

Open 3 terminals:

```bash
# Terminal 1 — API server (port 3001)
npm run dev -w @clinic-bot/api

# Terminal 2 — Background worker (reminders)
npm run worker -w @clinic-bot/api

# Terminal 3 — React dashboard (port 3000)
npm run dev -w @clinic-bot/web
```

Dashboard → http://localhost:3000

---

## 6. Wire up WhatsApp

### 6a. Expose API with ngrok
```bash
ngrok http 3001
# Copy the https URL, e.g.: https://abc123.ngrok-free.app
```

### 6b. Meta App setup
1. Go to https://developers.facebook.com/apps → Create App → Business
2. Add "WhatsApp" product
3. Under **WhatsApp → Configuration → Webhook**:
   - Callback URL: `https://abc123.ngrok-free.app/webhook/whatsapp`
   - Verify Token: same value as `WHATSAPP_VERIFY_TOKEN` in your `.env`
   - Subscribe to: `messages`
4. Under **WhatsApp → API Setup**:
   - Copy `Phone Number ID` → update `DEMO_PHONE_NUMBER_ID` in seed.ts
   - Copy `Temporary Access Token` → update `DEMO_ACCESS_TOKEN` in seed.ts
   - Copy `WhatsApp Business Account ID` → update `DEMO_WABA_ID`
5. Re-run seed: `npm run db:seed -w @clinic-bot/api`

### 6c. Test
Send any WhatsApp message to your test number → bot responds with the main menu.

---

## 7. Production deployment (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init

# Add services: Web (api), Worker, Redis
# Set env vars in Railway dashboard
# Deploy
railway up
```
