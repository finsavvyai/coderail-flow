# 🚀 PRODUCTION DEPLOYMENT GUIDE

**CodeRail Flow v1.0.0** - Ready to Ship!

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Phase 1 Complete ✅
- [x] Browser automation with Puppeteer
- [x] Real-time execution progress
- [x] Screenshot gallery
- [x] Error handling with retry
- [x] D1 database migrations
- [x] R2 artifact storage
- [x] All core step types implemented

### Production Readiness ✅
- [x] Professional UI branding
- [x] Error boundaries
- [x] Loading states
- [x] Retry functionality
- [x] Progress tracking
- [x] Artifact management

---

## 🔧 DEPLOYMENT STEPS

### 1. Set Up Cloudflare Resources

```bash
# Login to Cloudflare
wrangler login

# Create D1 Database (if not already created)
wrangler d1 create coderail-flow-db
# Copy the database_id to apps/api/wrangler.toml

# Create R2 Bucket
wrangler r2 bucket create coderail-flow-artifacts

# Create R2 Bucket for production (optional separate bucket)
wrangler r2 bucket create coderail-flow-artifacts-prod
```

### 2. Configure Production Environment

Update `apps/api/wrangler.toml`:

```toml
name = "coderail-flow-api"
main = "src/index.ts"
compatibility_date = "2025-12-13"

# Production D1
[[d1_databases]]
binding = "DB"
database_name = "coderail-flow-db-prod"  # Use separate prod DB
database_id = "YOUR_PRODUCTION_DB_ID"     # Replace with actual ID

# Production R2
[[r2_buckets]]
binding = "ARTIFACTS"
bucket_name = "coderail-flow-artifacts-prod"

# Browser Rendering
[[browser]]
binding = "BROWSER"

[vars]
APP_ENV = "production"
PUBLIC_BASE_URL = "https://coderail-flow.pages.dev"  # Your production URL
```

### 3. Apply Database Migrations

```bash
cd apps/api

# List existing migrations
wrangler d1 migrations list coderail-flow-db-prod

# Apply all migrations
wrangler d1 migrations apply coderail-flow-db-prod

# Verify migrations
wrangler d1 execute coderail-flow-db-prod --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 4. Deploy API Worker

```bash
cd apps/api

# Deploy to production
wrangler deploy

# Verify deployment
curl https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev/health

# Should return: {"ok":true,"service":"coderail-flow-api"}
```

### 5. Deploy Web UI (Cloudflare Pages)

```bash
cd apps/web

# Build for production
pnpm run build

# Deploy to Pages (first time)
wrangler pages deploy dist --project-name=coderail-flow

# Or if already set up
wrangler pages deploy dist
```

### 6. Configure Custom Domain (Optional)

```bash
# Add custom domain to Pages
wrangler pages deployment list --project-name=coderail-flow

# Add domain via Cloudflare dashboard:
# Pages > coderail-flow > Custom domains > Set up a custom domain
```

---

## 🔐 SECURITY CONFIGURATION

### Environment Variables

Set these in Cloudflare dashboard (Workers & Pages):

```bash
# API Worker (Settings > Variables)
APP_ENV=production
ALLOWED_ORIGINS=https://your-domain.com
LOG_LEVEL=info

# Pages (Settings > Environment variables)
VITE_API_URL=https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev
VITE_ENV=production
```

### CORS Configuration

Update `apps/api/src/index.ts` for production:

```typescript
app.use("*", cors({
  origin: (origin) => {
    const allowed = [
      'https://coderail-flow.pages.dev',
      'https://your-custom-domain.com'
    ];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
```

---

## 📊 MONITORING & OBSERVABILITY

### Cloudflare Analytics

1. **Workers Analytics**:
   - Go to Workers > coderail-flow-api > Metrics
   - Track: Requests, Errors, CPU time

2. **Pages Analytics**:
   - Go to Pages > coderail-flow > Analytics
   - Track: Page views, Performance

### Error Tracking (Optional)

Add Sentry integration:

```bash
cd apps/api
pnpm add @sentry/cloudflare

# apps/api/src/index.ts
import * as Sentry from '@sentry/cloudflare';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### Logging

Production logs are available in:
- Cloudflare Dashboard > Workers > Logs (Real-time)
- Tail logs: `wrangler tail`

---

## 🧪 POST-DEPLOYMENT TESTING

### Smoke Tests

```bash
# 1. Health Check
curl https://your-api-domain/health

# 2. List Flows
curl https://your-api-domain/flows

# 3. Create Test Run
curl -X POST https://your-api-domain/runs \
  -H "Content-Type: application/json" \
  -d '{"flowId":"demo-failed-txn","params":{"cardId":"****7842"}}'

# 4. Check Run Status
curl https://your-api-domain/runs/RUN_ID
```

### End-to-End Test

1. Open production URL
2. Select "Explain a Failed Card Transaction"
3. Click "Run flow"
4. Verify:
   - ✅ Real-time progress shows
   - ✅ Steps execute successfully
   - ✅ Screenshots appear in gallery
   - ✅ Artifacts downloadable
   - ✅ No console errors

---

## 📈 SCALING CONFIGURATION

### Browser Rendering Limits

Contact Cloudflare for increased limits:
- Default: 2 concurrent browsers
- Enterprise: 10+ concurrent browsers

### D1 Limits (Free Tier)

- 5GB storage
- 100k reads/day
- 100k writes/day

**Monitor usage**: Dashboard > D1 > Metrics

### R2 Limits (Free Tier)

- 10GB storage
- 1M Class A operations/month
- 10M Class B operations/month

**Monitor usage**: Dashboard > R2 > Metrics

---

## 🔄 CI/CD SETUP (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Build overlay
        run: cd packages/overlay && pnpm run build

      - name: Deploy API
        run: cd apps/api && npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Build Web
        run: cd apps/web && pnpm run build

      - name: Deploy Pages
        run: cd apps/web && npx wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 🐛 TROUBLESHOOTING

### Common Issues

**Issue**: Migrations not applied
```bash
# Solution: Apply manually
wrangler d1 migrations apply coderail-flow-db-prod --remote
```

**Issue**: CORS errors
```bash
# Solution: Check allowed origins in index.ts
# Add your production domain to allowed list
```

**Issue**: Browser Rendering fails
```bash
# Solution: Verify Browser binding in wrangler.toml
# Check Cloudflare dashboard for Browser Rendering status
```

**Issue**: R2 artifacts not loading
```bash
# Solution: Verify R2 bucket name and binding
# Check bucket permissions
```

---

## 📞 SUPPORT & MAINTENANCE

### Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Check usage metrics
- **Quarterly**: Update dependencies

### Database Backups

```bash
# Export D1 database
wrangler d1 export coderail-flow-db-prod --output=backup-$(date +%Y%m%d).sql

# Import if needed
wrangler d1 execute coderail-flow-db-prod --file=backup-20260107.sql
```

### Rollback Procedure

```bash
# Rollback API Worker
wrangler rollback

# Rollback Pages deployment
wrangler pages deployment list --project-name=coderail-flow
wrangler pages deployment rollback DEPLOYMENT_ID
```

---

## 🎯 PERFORMANCE OPTIMIZATION

### API Worker

- Keep worker bundle < 1MB
- Use cache-control headers
- Minimize database queries

### Web UI

- Enable Cloudflare CDN caching
- Compress images
- Lazy load components

### Database

- Add indexes for frequent queries:
```sql
CREATE INDEX idx_run_status ON run(status);
CREATE INDEX idx_run_created ON run(created_at);
CREATE INDEX idx_artifact_run ON artifact(run_id);
```

---

## 📋 PRODUCTION CHECKLIST

Before going live:

- [ ] All migrations applied
- [ ] Environment variables configured
- [ ] CORS properly restricted
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Monitoring dashboards created
- [ ] Backup procedure tested
- [ ] Smoke tests passing
- [ ] Documentation updated
- [ ] Team trained

---

## 🚀 LAUNCH!

Once all checks pass:

1. **Announce internally** - Let your team know it's live
2. **Monitor closely** - Watch logs for first 24 hours
3. **Gather feedback** - Get user input immediately
4. **Iterate** - Fix issues quickly

---

## 🎉 POST-LAUNCH

### Week 1
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Collect user feedback
- [ ] Fix critical bugs

### Week 2-4
- [ ] Implement user-requested features
- [ ] Optimize performance
- [ ] Scale as needed

---

**Status**: READY FOR PRODUCTION 🚀
**Version**: 1.0.0
**Last Updated**: January 7, 2026

**LET'S SHIP IT!** 🔥
