# CoderailFlow - Component Architecture Details

## API Layer (Cloudflare Workers)

**File:** `src/api/index.ts` (<200 lines)

Entry point for Hono server. Routes requests to handlers.

```typescript
import { Hono } from 'hono';
import { auth, rateLimit, cors } from './middleware';
import { flowsRouter } from './routes/flows';
import { executionRouter } from './routes/executions';

const app = new Hono();
app.use('*', cors(), auth(), rateLimit());
app.route('/flows', flowsRouter);
app.route('/executions', executionRouter);
export default app;
```

## Database Schema (D1)

```sql
CREATE TABLE flows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT DEFAULT 'active'
);

CREATE TABLE executions (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES flows(id),
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  duration_ms INTEGER,
  error TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES flows(id),
  cron TEXT NOT NULL,
  timezone TEXT,
  enabled BOOLEAN DEFAULT true,
  next_run TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_executions_flow_id ON executions(flow_id);
CREATE INDEX idx_schedules_flow_id ON schedules(flow_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

## Storage Layer (R2 Bucket Structure)

```
coderailflow-storage/
├── executions/
│   ├── {execution_id}/
│   │   ├── screenshot_0.png (5MB max)
│   │   ├── screenshot_1.png
│   │   └── subtitles.srt (1MB max)
└── temp/
    └── {temp_file}
```

Limits:
- Max 100 screenshots per execution
- Max 5MB per screenshot
- Max 1MB per SRT file

## Browser Automation Module

**File:** `src/services/executor.ts` (split into <200 line modules)

Sub-modules:
- `executor/browser.ts` - Browser session management
- `executor/steps.ts` - Step execution logic (navigate, click, fill)
- `executor/screenshot.ts` - Screenshot capture + R2 upload
- `executor/srt.ts` - SRT subtitle generation

```typescript
export async function executeFlow(browser, flow) {
  const page = await browser.newPage();
  const screenshots = [];

  for (const step of flow.steps) {
    await executeStep(page, step);
    if (step.captureScreenshot) {
      const screenshot = await captureScreenshot(page);
      screenshots.push(screenshot);
    }
  }

  return screenshots;
}
```

## Authentication Middleware

**File:** `src/middleware/auth.ts` (<100 lines)

Validates Clerk JWT and sets user context.

```typescript
export async function authMiddleware(c, next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const verified = await jwtVerify(token, PUBLIC_KEY);
    c.set('userId', verified.sub);
    c.set('orgId', verified.org_id);
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
```

## Rate Limiting Middleware

**File:** `src/middleware/rateLimit.ts` (<100 lines)

Uses KV for per-user rate limit tracking.

```typescript
export async function rateLimitMiddleware(c, next) {
  const userId = c.get('userId');
  const key = `rate_limit:${userId}`;

  const current = await KV.get(key);
  const count = (parseInt(current) || 0) + 1;

  if (count > LIMIT) {
    return c.json({ error: 'Rate limited' }, 429);
  }

  await KV.put(key, count.toString(), { expirationTtl: 86400 });
  await next();
}
```

## Webhook Handler

**File:** `src/webhooks/lemon-squeezy.ts` (<150 lines)

Processes LemonSqueezy billing events with signature validation.

```typescript
import crypto from 'crypto';

export async function handleWebhook(request) {
  const signature = request.headers.get('X-Signature');
  const body = await request.text();

  const valid = crypto.timingSafeEqual(
    signature,
    createSignature(body, WEBHOOK_SECRET)
  );

  if (!valid) return new Response('Unauthorized', { status: 401 });

  const payload = JSON.parse(body);
  if (payload.meta.event_name === 'subscription.created') {
    await updateUserPlan(payload.data);
  }

  return new Response('OK');
}
```
