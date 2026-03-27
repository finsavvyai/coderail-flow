# 🚀 Production Deployment Guide

This guide will walk you through deploying CodeRail Flow to production and running E2E tests.

## Prerequisites

Before deploying to production, ensure you have:

- [x] Cloudflare account with Workers and Pages enabled
- [x] Wrangler CLI installed (`pnpm add -g wrangler`)
- [x] Logged in to Cloudflare (`wrangler login`)
- [x] Production validation passing locally (`pnpm run validate:production`)
- [x] Database created and migrations applied
- [x] R2 bucket created
- [x] Environment variables configured

## Step 1: Configure Secrets

### Required Secrets

```bash
# Authentication
wrangler secret put CLERK_ISSUER --cwd apps/api
# Enter your Clerk issuer URL, e.g., https://your-domain.clerk.accounts.dev

wrangler secret put AUTH_ENCRYPTION_KEY --cwd apps/api
# Enter a long random secret for encrypted auth profiles

# Optional: Error Monitoring
wrangler secret put SENTRY_DSN --cwd apps/api
# Enter your Sentry DSN

wrangler secret put SENTRY_ENVIRONMENT --cwd apps/api
# Enter: production
```

### Optional Secrets (Billing)

```bash
# Lemon Squeezy (if using billing)
wrangler secret put LEMONSQUEEZY_API_KEY
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET
wrangler secret put LEMONSQUEEZY_STORE_ID
wrangler secret put LEMONSQUEEZY_VARIANT_PRO
wrangler secret put LEMONSQUEEZY_VARIANT_TEAM
```

## Step 2: Deploy to Production

### Option A: Automated Deployment (Recommended)

```bash
# Deploy both API and Web to production
pnpm run deploy:production
```

This script will:
1. ✅ Run production validation
2. ✅ Check authentication
3. ✅ Deploy API to Cloudflare Workers
4. ✅ Build and deploy Web to Cloudflare Pages

### Option B: Manual Deployment

#### Deploy API

```bash
# Deploy API to production
cd apps/api
wrangler deploy
cd ../..
```

#### Deploy Web

```bash
# Build web application
cd apps/web
pnpm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=coderail-flow
cd ../..
```

## Step 3: Verify Deployment

### Health Checks

```bash
# Basic health check
curl https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev/health

# Readiness check (must return 200 before routing production traffic)
curl https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev/health/ready

# Detailed health check (requires auth)
curl https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev/health/detailed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "ok": true,
  "service": "coderail-flow-api"
}
```

### Check Application

Open your browser and navigate to:
- **Web App**: https://coderail-flow.pages.dev
- **API**: https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev/health

## Step 4: Run E2E Tests

### Option A: Automated Testing

```bash
# Run E2E tests against production
pnpm run test:e2e:production
```

### Option B: Manual Testing

```bash
# Set production URLs
export E2E_BASE_URL=https://coderail-flow.pages.dev
export E2E_API_URL=https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev

# Run Playwright tests
npm run test:e2e
```

### View Test Results

```bash
# Open HTML report
npm run test:e2e:report
```

## Step 5: Monitor Production

### View Live Logs

```bash
# Tail logs from Cloudflare Workers
wrangler tail
```

### Check Sentry Dashboard

Navigate to your Sentry dashboard to monitor:
- Error rates
- Performance metrics
- User feedback

### Health Monitoring

Set up uptime monitoring for:
- `GET /health` - Basic health check
- `GET /health/ready` - Traffic readiness gate
- `GET /health/detailed` - Detailed service status

## Production URLs

After successful deployment, your URLs will be:

### API
```
https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev
```

### Web
```
https://coderail-flow.pages.dev
```

### Environment Variables
Make sure to update `apps/api/wrangler.toml`:

```toml
[vars]
APP_ENV = "production"
PUBLIC_BASE_URL = "https://coderail-flow.pages.dev"
```

## Rollback Procedure

If something goes wrong:

### Rollback API

```bash
cd apps/api
wrangler rollback
cd ../..
```

### Rollback Web

```bash
cd apps/web
# Redeploy previous version
wrangler pages deploy dist --project-name=coderail-flow --branch=rollback
cd ../..
```

## Troubleshooting

### Issue: "secret not found"

```bash
# List all secrets
wrangler secret list

# Set missing secret
wrangler secret put SECRET_NAME
```

### Issue: "database not found"

```bash
# Check database binding
wrangler d1 list

# Apply migrations if needed
cd apps/api
wrangler d1 execute coderail-flow-db --file migrations/0001_init.sql
```

### Issue: "CORS errors"

1. Update `PUBLIC_BASE_URL` in `wrangler.toml`
2. Redeploy API
3. Clear browser cache

### Issue: "Tests failing"

```bash
# Run tests locally first
npm test

# Check test configuration
cat playwright.config.ts

# Update test URLs if needed
export E2E_BASE_URL=https://your-url.pages.dev
export E2E_API_URL=https://your-api.workers.dev
```

## Post-Deployment Checklist

- [ ] All health checks passing
- [ ] E2E tests passing
- [ ] No errors in logs (`wrangler tail`)
- [ ] Sentry error rate <1%
- [ ] API response time <500ms
- [ ] Web app loads <2s
- [ ] Authentication working
- [ ] Database queries working
- [ ] R2 storage accessible

## Monitoring

### Key Metrics to Track

1. **Error Rate**: Target <0.1%
2. **API Latency**: Target p95 <500ms
3. **Web LCP**: Target <2s
4. **Uptime**: Target >99.9%

### Alerts to Configure

1. Error rate spike (>1% for 5 minutes)
2. High latency (p95 >2s for 10 minutes)
3. Database connection failures
4. R2 upload failures
5. Authentication failures

## Support

If you encounter issues:

1. Check logs: `wrangler tail`
2. Review Sentry dashboard
3. Check health endpoints
4. Review this guide's troubleshooting section
5. Check GitHub Issues: https://github.com/your-repo/issues

---

**Last Updated**: 2026-03-06
**Status**: 🟢 Ready for Production Deployment
