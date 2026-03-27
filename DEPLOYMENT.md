# CodeRail Flow - Deployment Guide

Complete guide for deploying CodeRail Flow to production on Cloudflare.

## Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- Wrangler CLI (`npm i -g wrangler`)
- Cloudflare account (free tier works)
- Clerk account (for authentication)
- Lemon Squeezy account (for billing, optional)

## 1. Infrastructure Setup

### Create D1 Database

```bash
wrangler login
wrangler d1 create coderail-flow-db
```

Copy the `database_id` to `apps/api/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "coderail-flow-db"
database_id = "YOUR_DATABASE_ID"
```

### Create R2 Bucket

```bash
wrangler r2 bucket create coderail-flow-artifacts
```

### Apply Migrations

```bash
cd apps/api

# Apply all migrations
wrangler d1 execute coderail-flow-db --file migrations/0001_init.sql
wrangler d1 execute coderail-flow-db --file migrations/0002_seed.sql
wrangler d1 execute coderail-flow-db --file migrations/0003_full_schema.sql
wrangler d1 execute coderail-flow-db --file migrations/0004_demo_flow.sql
wrangler d1 execute coderail-flow-db --file migrations/0005_waitlist.sql
wrangler d1 execute coderail-flow-db --file migrations/0006_billing.sql
```

## 2. Configure Secrets

### Clerk Authentication

```bash
# Get your Clerk issuer URL from Clerk Dashboard > API Keys
wrangler secret put CLERK_ISSUER --cwd apps/api
# Enter: https://YOUR_CLERK_INSTANCE.clerk.accounts.dev
```

### Auth Payload Encryption

```bash
wrangler secret put AUTH_ENCRYPTION_KEY --cwd apps/api
# Enter a long random secret used for encrypted auth profiles
```

### Lemon Squeezy Billing (Optional)

```bash
wrangler secret put LEMONSQUEEZY_API_KEY
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET
wrangler secret put LEMONSQUEEZY_STORE_ID
wrangler secret put LEMONSQUEEZY_VARIANT_PRO
wrangler secret put LEMONSQUEEZY_VARIANT_TEAM
```

## 3. Deploy API

```bash
cd apps/api
pnpm run deploy
```

This deploys to: `https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev`

## 4. Deploy Web App

### Option A: Cloudflare Pages (Recommended)

```bash
cd apps/web

# Set production environment variables
echo "VITE_API_URL=https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev" > .env.production
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_KEY" >> .env.production

# Build
pnpm run build

# Deploy
npx wrangler pages deploy dist --project-name=coderail-flow
```

### Option B: Netlify

```bash
cd apps/web
pnpm run build
# Deploy dist/ folder via Netlify dashboard
```

## 5. Configure CORS

Update `apps/api/wrangler.toml`:

```toml
[vars]
PUBLIC_BASE_URL = "https://coderail-flow.pages.dev"  # Your Pages URL
```

Redeploy API:

```bash
cd apps/api && pnpm run deploy
```

## 6. Verify Deployment

1. Open your Pages URL
2. Sign in with Clerk
3. Navigate to Dashboard
4. Run the demo flow
5. Verify screenshots and artifacts are generated
6. Confirm `GET /health/ready` returns `200` before sending traffic

## Environment Variables Reference

### API (wrangler.toml / secrets)

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_ENV` | "production" or "development" | Yes |
| `PUBLIC_BASE_URL` | Web app URL for CORS | Yes |
| `CLERK_ISSUER` | Clerk issuer URL | Yes |
| `AUTH_ENCRYPTION_KEY` | Auth profile encryption key | Yes in staging/production |
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy API key | No |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signature secret | No |

### Web (.env.production)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | API endpoint URL | Yes |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |

## Troubleshooting

### Browser Rendering Not Working

Ensure your Cloudflare plan supports Browser Rendering (Workers Paid plan required).

### CORS Errors

1. Verify `PUBLIC_BASE_URL` matches your web app URL exactly
2. Check for trailing slashes
3. Redeploy API after changes

### Readiness Fails With 503

1. Check `GET /health/ready`
2. Set any missing required secrets with `wrangler secret put ... --cwd apps/api`
3. Redeploy the API after fixing config

### Authentication Failures

1. Verify `CLERK_ISSUER` is set correctly
2. Check Clerk dashboard for API key status
3. Ensure Clerk publishable key matches environment

### Database Errors

```bash
# Check database status
wrangler d1 info coderail-flow-db

# Re-run migrations if needed
wrangler d1 execute coderail-flow-db --file migrations/0001_init.sql
```

## Local Development

```bash
# Terminal 1: API
cd apps/api && pnpm run dev

# Terminal 2: Web
cd apps/web && pnpm run dev

# Terminal 3: Demo target (for local flow testing)
npx serve apps/demo-target -l 3333

# Terminal 4: Run local flow (optional)
npx tsx scripts/run-local.ts real-txn-flow --params '{"cardId":"7842"}'
```

## Staging Environment

```bash
# Create staging database
wrangler d1 create coderail-flow-db-staging

# Update wrangler.toml with staging database_id

# Deploy to staging
cd apps/api && wrangler deploy --env staging
```
