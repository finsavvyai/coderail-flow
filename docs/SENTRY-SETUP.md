# Sentry Configuration Guide

## Setup Instructions

### 1. Create Sentry Project

1. Go to https://sentry.io/
2. Create a new project: "coderail-flow-api"
3. Select "Cloudflare Workers" as the platform
4. Get your DSN from project settings

### 2. Configure Secrets

```bash
cd apps/api

# Set Sentry DSN
wrangler secret put SENTRY_DSN
# Enter: https://your-dsn@sentry.io/project-id

# Set environment
wrangler secret put SENTRY_ENVIRONMENT
# Enter: production

# Set release version (optional)
wrangler secret put SENTRY_RELEASE
# Enter: coderail-flow@1.0.0
```

### 3. Verify Configuration

```bash
# Deploy to apply changes
wrangler deploy

# Check logs for Sentry integration
wrangler tail
```

### 4. Test Error Tracking

Visit your app and trigger an error to verify Sentry is capturing events.

### Environment Variables

The following are automatically included:
- `APP_ENV` - From wrangler.toml
- `SENTRY_ENVIRONMENT` - Secret you set
- `SENTRY_RELEASE` - Secret you set

### Monitoring

After configuration, monitor:
- Error rates
- Performance metrics
- User feedback
- Release tracking

View dashboard: https://sentry.io/organizations/your-org/projects/
