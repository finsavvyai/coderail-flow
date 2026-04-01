# Monitoring Setup Guide

## Overview

Guide covers setting up comprehensive monitoring for CodeRail Flow production deployment.

## Metrics to Track

### Application Metrics
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (percentage)
- Success rate (percentage)
- Active users
- Flows executed
- Runs completed

### Infrastructure Metrics
- CPU usage (Cloudflare Workers)
- Memory usage
- Database query performance
- R2 storage operations
- Browser rendering success rate

## Tools

### 1. Cloudflare Analytics (Built-in)

Access: https://dash.cloudflare.com/<your-account>

**Metrics Available**:
- Request count
- Response time
- Error rate
- Geographic distribution

### 2. Sentry (Error Tracking)

**Setup**:
1. Configure SENTRY_DSN
2. Add alert rules:
   - Error rate >1% for 5 minutes
   - New error introduced
   - Performance degradation

### Alert Configuration

#### Critical Alerts (Page/SMS)
- Application down (>5 minutes)
- Error rate >5%
- API response time >2s
- Database connection failures

#### Warning Alerts (Email)
- Error rate >1%
- API response time >1s
- Storage quota >80%

## Setup Scripts

### Custom Metrics

```typescript
import { getLogger } from './monitoring/logger';

const logger = getLogger();

logger.info('flow_executed', {
  flowId: 'flow-123',
  duration: 1500,
  status: 'succeeded',
  userId: 'user-123',
});
```

## Log Aggregation

### View Logs

**Real-time**:
```bash
wrangler tail
```

**Analysis**:
```bash
# Count errors in last hour
wrangler tail --format=json | grep '"status":5' | wc -l

# Find slow requests (>1s)
wrangler tail --format=json | jq 'select(.duration > 1000)'
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

**Target Values**:
- API p95 latency: <500ms
- Error rate: <0.1%
- Uptime: >99.9%
- Success rate: >95%

---

**Last Updated**: March 6, 2026
