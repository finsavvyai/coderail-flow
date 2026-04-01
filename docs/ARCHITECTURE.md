# CoderailFlow Architecture

## System Overview

CoderailFlow is a Cloudflare-native browser automation platform built on Workers, Pages, D1, and R2.

```
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                          │
│  React UI (Vite) - Flow Builder, Dashboard, Results View    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │
┌───────────────────────┴─────────────────────────────────────┐
│           Cloudflare Workers (Hono API)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Auth Middleware (Clerk JWT)                        │    │
│  │  Rate Limiting (KV-based)                           │    │
│  │  CORS, Logging                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Routes: /flows /executions /schedules /webhooks    │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
        │               │               │
    ┌───▼─┐         ┌───▼─┐         ┌──▼────┐
    │ D1  │         │ R2  │         │ KV    │
    │ SQL │         │S3   │         │Cache  │
    └─────┘         └─────┘         └───────┘
        │
    ┌───▼────────────────────────┐
    │  Browser Rendering API     │
    │  (Puppeteer)               │
    └────────────────────────────┘
```

## Component Architecture

See [ARCHITECTURE-COMPONENTS.md](ARCHITECTURE-COMPONENTS.md) for detailed component implementation.

**Key Components:**
1. **API Layer** - Hono on Cloudflare Workers
2. **Database** - D1 SQLite
3. **Storage** - R2 for screenshots/artifacts
4. **Cache** - KV for sessions and rate limits
5. **Browser** - Puppeteer for automation
6. **Auth** - Clerk JWT validation
7. **Billing** - LemonSqueezy webhooks

## Data Flow

### Flow Execution Flow

```
1. User clicks "Execute Flow"
   │
2. POST /executions/{flow_id}
   │
3. Workers receives request
   │
4. Verify JWT (Clerk)
   │
5. Check rate limits (KV)
   │
6. Load flow definition (D1)
   │
7. Acquire browser session
   │
8. For each step:
   ├─ Execute step on page
   ├─ Capture screenshot (if enabled)
   └─ Upload to R2
   │
9. Generate SRT subtitles
   │
10. Save execution record (D1)
    │
11. Return execution_id + status
    │
12. Frontend polls for updates
```

### Billing Flow

```
1. User clicks "Upgrade to Pro"
   │
2. POST /checkout
   │
3. Create LemonSqueezy session
   │
4. Return checkout URL
   │
5. User completes payment
   │
6. LemonSqueezy sends webhook
   │
7. POST /webhooks/lemon-squeezy
   │
8. Verify signature
   │
9. Update subscription (D1)
   │
10. Update user plan in KV cache
```

## Deployment

**Development:**
```bash
docker build -t coderailflow .
docker run -p 8787:8787 coderailflow
```

**Production:**
```bash
wrangler deploy --env production
```

See `deploy/wrangler.toml` and `deploy/.env.example` for configuration.

## Performance

- Flow list: <200ms (cached)
- Flow execution: <5s
- Screenshot upload: <500ms

## Security

- Clerk JWT auth on all endpoints
- D1: Encrypted at rest
- R2: Signed URLs only
- Rate limiting: 10 req/sec per user
- Input validation: Zod schemas

## Scalability

- Auto-scaling Workers
- Global R2 distribution
- D1 with failover
- KV for caching

## Resource Limits

- Max 30s execution time
- Max 512MB per Worker
- Max 100 steps per flow
- Max 5MB per screenshot

## Monitoring

- Logs: `wrangler tail`
- Metrics: Request latency, success rate
- Alerts: Error rate >5%, quota breached
