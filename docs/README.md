# CoderailFlow - Browser Automation Platform

**Status:** Production Ready
**Stack:** Cloudflare Workers, Hono, React, Vite, D1, R2, Puppeteer

## Quick Start

### Development

```bash
cd deploy
cp .env.example .env
docker build -t coderailflow .
docker run -p 8787:8787 coderailflow
```

### Create First Flow

1. Open http://localhost:5173
2. Click "New Flow"
3. Add steps: Navigate → Click → Screenshot
4. Click "Run"

### Deploy

```bash
wrangler deploy --env production
```

## Features

- **Visual Flow Builder** - Drag-and-drop automation
- **Cloudflare-Native** - Workers + Pages + D1
- **Screenshot Capture** - Auto-upload to R2
- **SRT Generation** - Subtitle files from execution
- **Real-Time Analytics** - Monitor executions
- **Billing Integration** - LemonSqueezy subscriptions

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for system design.

**Components:**
- API: Hono on Cloudflare Workers
- Database: D1 SQLite
- Storage: R2 object storage
- Cache: KV sessions
- Browser: Puppeteer rendering
- Auth: Clerk JWT

## API Documentation

Full API docs at [API.md](API.md).

**Key endpoints:**
- `POST /flows` - Create automation flow
- `POST /flows/{id}/execute` - Run flow
- `POST /checkout` - Start billing checkout

## Testing

```bash
# Unit & integration tests
pnpm test

# Coverage must be ≥95% line, ≥90% branch
pnpm test:coverage
```

## Pricing

- **Free:** 3 flows, 100 executions/month
- **Pro:** $29/month, unlimited
- **Enterprise:** Custom pricing

## Security

- Clerk JWT authentication
- D1 encrypted at rest
- R2 signed URLs only
- Zod input validation
- Rate limiting: 10 req/sec per user

## Performance

- Flow list: <200ms (cached)
- Flow execution: <5s
- Screenshot upload: <500ms
- Max 30s execution timeout

## Monitoring

```bash
# View live logs
wrangler tail
```

## Support

- Docs: https://docs.coderailflow.dev
- GitHub: https://github.com/coderailflow/coderailflow
- Email: support@coderailflow.dev
