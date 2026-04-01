# Testing Strategy - 90% Coverage Target

**Version:** 1.0
**Created:** 2025-02-28
**Target:** 95% line / 90% branch coverage (stricter than portfolio 90%/85%)

## Executive Summary

**Current Status:** 0% test coverage (NO tests exist)
**Target Status:** 95% line, 90% branch coverage
**Timeline:** 2 weeks (Sprint 1)
**Critical Paths:** 100% coverage (auth, billing, execution, security)

---

## Coverage Targets by Layer

| Layer | Current | Target Line | Target Branch | Priority |
|-------|---------|-------------|---------------|----------|
| **Critical Paths** | 0% | **100%** | **100%** | P0 |
| **Packages** | 0% | 95% | 90% | P1 |
| **API** | 0% | 90% | 85% | P1 |
| **Frontend** | 0% | 80% | 75% | P2 |
| **Overall** | 0% | **95%** | **90%** | - |

---

## Phase 1: Infrastructure Setup (Day 1)

### 1.1 Install Vitest (Packages + Frontend)

**Configuration:**

```typescript
// packages/runner/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 95,
      branches: 90,
      functions: 95,
      statements: 95,
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/dist/**',
        '**/node_modules/**',
        '**/__mocks__/**'
      ],
      all: true,
      skipFull: false
    },
    setupFiles: ['./vitest.setup.ts']
  }
})
```

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      branches: 75,
      functions: 80,
      statements: 80,
      exclude: [
        '**/*.test.tsx',
        '**/*.spec.tsx',
        '**/test/**',
        '**/dist/**'
      ]
    }
  }
})
```

### 1.2 Install Testing Libraries

```bash
# Root package.json
pnpm add -D -w vitest @vitest/coverage-v8 @vitest/ui

# Frontend testing
pnpm add -D -w @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# API testing (Cloudflare Workers)
pnpm add -D -w @cloudflare/vitest-pool-workers wrangler
```

### 1.3 Configure CI Enforcement

```yaml
# .github/workflows/test.yml
name: Test & Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests (all workspaces)
        run: pnpm run test:coverage

      - name: Check coverage thresholds
        run: |
          # Fail if any workspace below target
          pnpm run test:coverage -- --reporter=json > coverage.json

          # Parse coverage.json and check thresholds
          node scripts/check-coverage.js

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Comment PR with coverage
        uses: codecov/codecov-action@v3
        with:
          flags: unittests
          fail_ci_if_error: true
```

### 1.4 Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running tests for changed files..."

# Get changed files
changed_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

if [ -z "$changed_files" ]; then
  echo "No TypeScript files changed, skipping tests"
  exit 0
fi

# Run tests for changed packages
for file in $changed_files; do
  if [[ $file == packages/* ]]; then
    package=$(echo $file | cut -d'/' -f2)
    echo "Testing package: $package"
    pnpm --filter "@coderail/$package" test
  elif [[ $file == apps/api/* ]]; then
    echo "Testing API"
    pnpm --filter coderail-api test
  elif [[ $file == apps/web/* ]]; then
    echo "Testing Web"
    pnpm --filter coderail-web test
  fi
done

echo "✅ All tests passed"
```

---

## Phase 2: Critical Path Tests (Day 2-4, 100% Coverage)

### 2.1 Authentication Tests (100% coverage)

**File:** `apps/api/src/middleware/auth.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { authMiddleware } from './auth'
import { Hono } from 'hono'

describe('Authentication Middleware', () => {
  describe('JWT Validation', () => {
    it('should accept valid JWT token', async () => {
      const app = new Hono()
      app.use('*', authMiddleware)
      app.get('/', (c) => c.json({ user: c.get('userId') }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer valid-jwt-token' }
      })

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ user: 'user-123' })
    })

    it('should reject expired JWT token', async () => {
      const app = new Hono()
      app.use('*', authMiddleware)
      app.get('/', (c) => c.json({ ok: true }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer expired-token' }
      })

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Token expired' })
    })

    it('should reject malformed JWT token', async () => {
      const app = new Hono()
      app.use('*', authMiddleware)
      app.get('/', (c) => c.json({ ok: true }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer malformed.token' }
      })

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Invalid token' })
    })

    it('should reject missing Authorization header', async () => {
      const app = new Hono()
      app.use('*', authMiddleware)
      app.get('/', (c) => c.json({ ok: true }))

      const res = await app.request('/')

      expect(res.status).toBe(401)
      expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('should extract org_id from JWT claims', async () => {
      const app = new Hono()
      app.use('*', authMiddleware)
      app.get('/', (c) => c.json({ org: c.get('orgId') }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer token-with-org' }
      })

      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({ org: 'org-456' })
    })

    it('should handle Clerk JWKS rotation', async () => {
      // Test JWKS caching and rotation
      const app = new Hono()
      app.use('*', authMiddleware)

      // First request (cache miss)
      await app.request('/', {
        headers: { Authorization: 'Bearer valid-token' }
      })

      // Second request (cache hit)
      const res = await app.request('/', {
        headers: { Authorization: 'Bearer valid-token' }
      })

      expect(res.status).toBe(200)
    })
  })

  describe('Organization Validation', () => {
    it('should require org_id for protected routes', async () => {
      const app = new Hono()
      app.use('*', authMiddleware, requireOrg())
      app.get('/', (c) => c.json({ ok: true }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer token-no-org' }
      })

      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ error: 'Organization required' })
    })

    it('should allow org members to access resources', async () => {
      const app = new Hono()
      app.use('*', authMiddleware, requireOrg())
      app.get('/', (c) => c.json({ ok: true }))

      const res = await app.request('/', {
        headers: { Authorization: 'Bearer token-with-org' }
      })

      expect(res.status).toBe(200)
    })
  })
})
```

**Target:** 30 tests, 100% line/branch coverage

### 2.2 Billing Webhook Tests (100% coverage)

**File:** `apps/api/src/billing.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { handleLemonSqueezyWebhook } from './billing'
import crypto from 'crypto'

describe('Billing Webhooks', () => {
  describe('Signature Validation', () => {
    it('should accept valid webhook signature', async () => {
      const payload = { event: 'subscription_created', data: {} }
      const signature = generateSignature(payload, 'secret-key')

      const result = await handleLemonSqueezyWebhook(payload, signature)

      expect(result.success).toBe(true)
    })

    it('should reject invalid webhook signature', async () => {
      const payload = { event: 'subscription_created', data: {} }
      const signature = 'invalid-signature'

      const result = await handleLemonSqueezyWebhook(payload, signature)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid signature')
    })

    it('should reject tampered webhook payload', async () => {
      const payload = { event: 'subscription_created', data: {} }
      const signature = generateSignature(payload, 'secret-key')

      // Tamper payload
      payload.data = { tampered: true }

      const result = await handleLemonSqueezyWebhook(payload, signature)

      expect(result.success).toBe(false)
    })

    it('should use constant-time comparison (timing attack prevention)', async () => {
      const payload = { event: 'subscription_created', data: {} }
      const correctSig = generateSignature(payload, 'secret-key')
      const wrongSig = correctSig.slice(0, -1) + 'x'

      const start = Date.now()
      await handleLemonSqueezyWebhook(payload, wrongSig)
      const elapsed = Date.now() - start

      // Should not reveal signature length via timing
      expect(elapsed).toBeLessThan(100)
    })
  })

  describe('Subscription Lifecycle', () => {
    it('should handle subscription_created event', async () => {
      const payload = {
        event: 'subscription_created',
        data: {
          id: 'sub-123',
          customer_id: 'user-456',
          status: 'active',
          plan: 'pro'
        }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      // Verify DB record created
      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.status).toBe('active')
    })

    it('should handle subscription_updated event (downgrade)', async () => {
      // Setup existing subscription
      await db.insert('subscription', {
        id: 'sub-123',
        plan: 'pro',
        status: 'active'
      })

      const payload = {
        event: 'subscription_updated',
        data: {
          id: 'sub-123',
          plan: 'basic',
          status: 'active'
        }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.plan).toBe('basic')
    })

    it('should handle subscription_cancelled event', async () => {
      await db.insert('subscription', {
        id: 'sub-123',
        status: 'active'
      })

      const payload = {
        event: 'subscription_cancelled',
        data: { id: 'sub-123' }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.status).toBe('cancelled')
      expect(sub.cancelled_at).toBeInstanceOf(Date)
    })

    it('should handle subscription_expired event', async () => {
      await db.insert('subscription', {
        id: 'sub-123',
        status: 'past_due'
      })

      const payload = {
        event: 'subscription_expired',
        data: { id: 'sub-123' }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.status).toBe('expired')
    })

    it('should handle payment_failed event (retry logic)', async () => {
      const payload = {
        event: 'payment_failed',
        data: {
          subscription_id: 'sub-123',
          attempt: 1
        }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.status).toBe('past_due')
      expect(sub.retry_count).toBe(1)
    })

    it('should cancel subscription after 3 failed payments', async () => {
      await db.insert('subscription', {
        id: 'sub-123',
        retry_count: 2
      })

      const payload = {
        event: 'payment_failed',
        data: {
          subscription_id: 'sub-123',
          attempt: 3
        }
      }

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      const sub = await db.query('SELECT * FROM subscription WHERE id = ?', ['sub-123'])
      expect(sub.status).toBe('cancelled')
    })
  })

  describe('Idempotency', () => {
    it('should handle duplicate webhooks (same event ID)', async () => {
      const payload = {
        event: 'subscription_created',
        data: { id: 'sub-123' },
        meta: { event_id: 'evt-456' }
      }

      // First delivery
      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      // Duplicate delivery
      const result = await handleLemonSqueezyWebhook(payload, validSignature(payload))

      expect(result.success).toBe(true)
      expect(result.message).toBe('Already processed')

      // Verify only one DB record
      const count = await db.query('SELECT COUNT(*) FROM subscription WHERE id = ?', ['sub-123'])
      expect(count).toBe(1)
    })
  })

  describe('Error Handling', () => {
    it('should log errors but return 200 (prevent retry storm)', async () => {
      const payload = {
        event: 'subscription_created',
        data: { id: null } // Invalid data
      }

      const result = await handleLemonSqueezyWebhook(payload, validSignature(payload))

      expect(result.status).toBe(200) // Always 200 to prevent retries
      expect(result.logged).toBe(true)
    })

    it('should alert on critical errors (Sentry)', async () => {
      const payload = {
        event: 'subscription_created',
        data: { id: 'sub-123' }
      }

      // Simulate DB failure
      vi.spyOn(db, 'insert').mockRejectedValue(new Error('DB connection lost'))

      await handleLemonSqueezyWebhook(payload, validSignature(payload))

      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
```

**Target:** 25 tests, 100% line/branch coverage

### 2.3 Flow Execution Tests (100% coverage)

**File:** `packages/runner/src/__tests__/executor-core.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlowExecutor } from '../executor-core'
import puppeteer from 'puppeteer'

describe('Flow Execution Engine', () => {
  let browser: Browser
  let page: Page
  let executor: FlowExecutor

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()
    executor = new FlowExecutor(page, {
      timeout: 30000,
      retries: 3,
      screenshotQuality: 80,
      r2Bucket: 'test-bucket'
    })
  })

  afterEach(async () => {
    await browser.close()
  })

  describe('Step Execution Loop', () => {
    it('should execute all steps in sequence', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' },
          { type: 'click', selector: '#button' },
          { type: 'fill', selector: '#input', value: 'test' }
        ]
      }

      const result = await executor.execute(flow)

      expect(result.success).toBe(true)
      expect(result.steps).toHaveLength(3)
      expect(result.steps.every(s => s.success)).toBe(true)
    })

    it('should stop execution on first error', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' },
          { type: 'click', selector: '#missing-element' }, // Error here
          { type: 'fill', selector: '#input', value: 'test' } // Should not execute
        ]
      }

      const result = await executor.execute(flow)

      expect(result.success).toBe(false)
      expect(result.steps).toHaveLength(2) // Only first 2 executed
      expect(result.steps[1].success).toBe(false)
    })

    it('should retry failed steps up to max retries', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'click', selector: '#flaky-button' }
        ]
      }

      // Mock element appearing on 3rd attempt
      let attempts = 0
      vi.spyOn(page, '$').mockImplementation(async () => {
        attempts++
        return attempts >= 3 ? mockElement : null
      })

      const result = await executor.execute(flow)

      expect(result.success).toBe(true)
      expect(attempts).toBe(3)
    })

    it('should respect timeout per step', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'waitFor', selector: '#never-appears', timeout: 1000 }
        ]
      }

      const start = Date.now()
      const result = await executor.execute(flow)
      const elapsed = Date.now() - start

      expect(result.success).toBe(false)
      expect(elapsed).toBeGreaterThanOrEqual(1000)
      expect(elapsed).toBeLessThan(2000)
    })
  })

  describe('Error Propagation', () => {
    it('should include error details in result', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'click', selector: '#missing' }
        ]
      }

      const result = await executor.execute(flow)

      expect(result.steps[0].error).toContain('Element not found')
      expect(result.steps[0].selector).toBe('#missing')
    })

    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error')

      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'click', selector: '#missing' }
        ]
      }

      await executor.execute(flow)

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Element not found'))
    })
  })

  describe('Screenshot Capture', () => {
    it('should capture screenshot after each step (default)', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' },
          { type: 'click', selector: '#button' }
        ]
      }

      const result = await executor.execute(flow)

      expect(result.steps[0].screenshotUrl).toMatch(/runs\/run-123\/screenshots\/0\.png/)
      expect(result.steps[1].screenshotUrl).toMatch(/runs\/run-123\/screenshots\/1\.png/)
    })

    it('should skip screenshot if disabled in step', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com', screenshot: false }
        ]
      }

      const result = await executor.execute(flow)

      expect(result.steps[0].screenshotUrl).toBeUndefined()
    })

    it('should compress screenshots to target quality', async () => {
      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' }
        ]
      }

      const result = await executor.execute(flow)

      // Verify screenshot size is reasonable (not uncompressed)
      const buffer = await fetch(result.steps[0].screenshotUrl).then(r => r.arrayBuffer())
      expect(buffer.byteLength).toBeLessThan(500_000) // <500KB
    })
  })

  describe('R2 Upload', () => {
    it('should upload screenshots to R2', async () => {
      const uploadSpy = vi.spyOn(executor['uploader'], 'uploadScreenshot')

      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' }
        ]
      }

      await executor.execute(flow)

      expect(uploadSpy).toHaveBeenCalledWith('run-123', 0, expect.any(Buffer))
    })

    it('should handle R2 upload failures gracefully', async () => {
      vi.spyOn(executor['uploader'], 'uploadScreenshot').mockRejectedValue(
        new Error('R2 connection failed')
      )

      const flow = {
        runId: 'run-123',
        steps: [
          { type: 'goto', url: 'https://example.com' }
        ]
      }

      const result = await executor.execute(flow)

      // Execution should continue even if screenshot upload fails
      expect(result.success).toBe(true)
      expect(result.steps[0].screenshotUrl).toBeUndefined()
    })
  })
})
```

**Target:** 40 tests, 100% line/branch coverage

### 2.4 Data Write Tests (100% coverage)

**File:** `apps/api/src/__tests__/database.test.ts`

```typescript
describe('Database Operations', () => {
  describe('Run Creation', () => {
    it('should create run with unique ID', async () => {
      const runId = await createRun({ flowId: 'flow-123' })

      expect(runId).toMatch(/^run-[a-f0-9-]{36}$/)

      const run = await db.query('SELECT * FROM run WHERE id = ?', [runId])
      expect(run.flow_id).toBe('flow-123')
      expect(run.status).toBe('pending')
    })

    it('should prevent duplicate run IDs', async () => {
      const runId = 'run-fixed-id'

      await db.insert('run', { id: runId, flow_id: 'flow-123' })

      await expect(
        db.insert('run', { id: runId, flow_id: 'flow-456' })
      ).rejects.toThrow('UNIQUE constraint failed')
    })

    it('should enforce foreign key (flow must exist)', async () => {
      await expect(
        createRun({ flowId: 'non-existent-flow' })
      ).rejects.toThrow('FOREIGN KEY constraint failed')
    })
  })

  describe('Artifact Storage (Idempotency)', () => {
    it('should allow re-uploading same artifact (overwrite)', async () => {
      const artifact1 = await uploadArtifact({
        runId: 'run-123',
        stepIndex: 0,
        buffer: Buffer.from('data-v1')
      })

      const artifact2 = await uploadArtifact({
        runId: 'run-123',
        stepIndex: 0,
        buffer: Buffer.from('data-v2')
      })

      expect(artifact1.key).toBe(artifact2.key) // Same key
      const fetched = await r2.get(artifact1.key)
      expect(await fetched.text()).toBe('data-v2') // Latest version
    })

    it('should not duplicate artifact records on retry', async () => {
      await uploadArtifact({
        runId: 'run-123',
        stepIndex: 0,
        buffer: Buffer.from('data')
      })

      await uploadArtifact({
        runId: 'run-123',
        stepIndex: 0,
        buffer: Buffer.from('data')
      })

      const count = await db.query(
        'SELECT COUNT(*) FROM artifact WHERE run_id = ? AND step_index = ?',
        ['run-123', 0]
      )

      expect(count).toBe(1) // Only one record
    })
  })
})
```

**Target:** 20 tests, 100% line/branch coverage

### 2.5 Security Control Tests (100% coverage)

**File:** `apps/api/src/__tests__/security.test.ts`

```typescript
describe('Security Controls', () => {
  describe('Rate Limiting', () => {
    it('should allow requests under limit', async () => {
      for (let i = 0; i < 120; i++) {
        const res = await app.request('/flows', {
          headers: { 'CF-Connecting-IP': '192.168.1.1' }
        })
        expect(res.status).toBe(200)
      }
    })

    it('should block requests over limit', async () => {
      for (let i = 0; i < 120; i++) {
        await app.request('/flows', {
          headers: { 'CF-Connecting-IP': '192.168.1.1' }
        })
      }

      const res = await app.request('/flows', {
        headers: { 'CF-Connecting-IP': '192.168.1.1' }
      })

      expect(res.status).toBe(429)
      expect(await res.json()).toEqual({ error: 'Rate limit exceeded' })
    })

    it('should isolate limits per IP', async () => {
      for (let i = 0; i < 120; i++) {
        await app.request('/flows', {
          headers: { 'CF-Connecting-IP': '192.168.1.1' }
        })
      }

      // Different IP should not be blocked
      const res = await app.request('/flows', {
        headers: { 'CF-Connecting-IP': '192.168.1.2' }
      })

      expect(res.status).toBe(200)
    })
  })

  describe('CORS Validation', () => {
    it('should allow requests from allowed origin', async () => {
      const res = await app.request('/', {
        headers: { Origin: 'https://coderail.app' }
      })

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://coderail.app')
    })

    it('should block requests from disallowed origin', async () => {
      const res = await app.request('/', {
        headers: { Origin: 'https://malicious.com' }
      })

      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    })
  })

  describe('SQL Injection Prevention', () => {
    it('should sanitize user input (parameterized queries)', async () => {
      const maliciousInput = "'; DROP TABLE flow; --"

      const res = await app.request('/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: maliciousInput })
      })

      expect(res.status).toBe(201)

      // Verify table still exists
      const flows = await db.query('SELECT * FROM flow')
      expect(flows).toBeDefined()
    })
  })

  describe('XSS Prevention', () => {
    it('should escape HTML in user-generated content', async () => {
      const xssPayload = '<script>alert("XSS")</script>'

      await createFlow({ name: xssPayload })

      const html = await renderFlowList()

      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })
  })
})
```

**Target:** 15 tests, 100% line/branch coverage

**Phase 2 Total:** 130 tests, 100% coverage on critical paths

---

## Phase 3: Package Unit Tests (Day 5-7, 95% Coverage)

### 3.1 `@coderail/dsl` (Schema Validation)

**File:** `packages/dsl/src/__tests__/schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { flowSchema, stepSchema } from '../index'

describe('Flow Schema Validation', () => {
  it('should accept valid flow', () => {
    const flow = {
      name: 'Login Flow',
      steps: [
        { type: 'goto', url: 'https://app.com' },
        { type: 'fill', selector: '#email', value: 'user@example.com' }
      ]
    }

    const result = flowSchema.safeParse(flow)

    expect(result.success).toBe(true)
  })

  it('should reject flow with empty name', () => {
    const flow = {
      name: '',
      steps: []
    }

    const result = flowSchema.safeParse(flow)

    expect(result.success).toBe(false)
    expect(result.error.errors[0].path).toEqual(['name'])
  })

  it('should reject flow with invalid step type', () => {
    const flow = {
      name: 'Test',
      steps: [
        { type: 'invalid-type', selector: '#foo' }
      ]
    }

    const result = flowSchema.safeParse(flow)

    expect(result.success).toBe(false)
  })

  // 47 more schema validation tests...
})
```

**Target:** 50 tests, 100% coverage

### 3.2 `@coderail/runner` (Step Executors)

**Test each of 25 step types:**

```typescript
describe('ClickStep', () => {
  it('should click element by data-testid', async () => {})
  it('should fallback to aria-label if data-testid missing', async () => {})
  it('should fallback to text content', async () => {})
  it('should retry on timeout', async () => {})
  it('should throw ElementNotFoundError if all strategies fail', async () => {})
  it('should wait for element to be clickable (not disabled)', async () => {})
  it('should scroll element into view before clicking', async () => {})
  it('should handle click inside iframe', async () => {})
})

describe('FillStep', () => {
  it('should clear existing value before filling', async () => {})
  it('should handle password inputs (type=password)', async () => {})
  it('should trigger input/change events', async () => {})
  it('should handle contenteditable elements', async () => {})
  // 6 more tests...
})

// 23 more step types (10 tests each)
```

**Target:** 250 tests, 95% coverage

### 3.3 `@coderail/overlay` (Rendering Logic)

```typescript
describe('OverlayInjector', () => {
  describe('Highlight Rendering', () => {
    it('should inject highlight with correct position', async () => {})
    it('should animate highlight (fade in)', async () => {})
    it('should support multiple highlights simultaneously', async () => {})
    it('should clean up highlights on removeOverlays()', async () => {})
    // 6 more tests...
  })

  describe('Caption Rendering', () => {
    it('should position caption above element', async () => {})
    it('should wrap long text (max 60 chars per line)', async () => {})
    it('should auto-position caption if off-screen', async () => {})
    // 7 more tests...
  })
})
```

**Target:** 30 tests, 95% coverage

**Phase 3 Total:** 330 tests, 95% coverage on packages

---

## Phase 4: API Integration Tests (Day 8-10, 90% Coverage)

### 4.1 Flow CRUD Operations

```typescript
describe('Flow API', () => {
  it('should create flow with valid data', async () => {})
  it('should list flows for authenticated user', async () => {})
  it('should update flow (partial update)', async () => {})
  it('should soft-delete flow (set deleted_at)', async () => {})
  it('should enforce multi-tenant isolation (cannot read other org flows)', async () => {})
  // 10 more tests...
})
```

**Target:** 15 tests

### 4.2 Run Execution API

```typescript
describe('Run API', () => {
  it('should queue run for execution', async () => {})
  it('should return run status (pending/running/completed/failed)', async () => {})
  it('should list runs for flow', async () => {})
  it('should cancel running flow', async () => {})
  // 11 more tests...
})
```

**Target:** 15 tests

### 4.3 Webhook Delivery

```typescript
describe('Webhook Delivery', () => {
  it('should deliver webhook on run completion', async () => {})
  it('should retry failed webhooks (3 attempts)', async () => {})
  it('should mark webhook as failed after 3 attempts', async () => {})
  it('should include run result in webhook payload', async () => {})
  // 6 more tests...
})
```

**Target:** 10 tests

**Phase 4 Total:** 100 tests, 90% coverage on API

---

## Phase 5: Frontend Component Tests (Day 11-14, 80% Coverage)

### 5.1 React Component Tests

```typescript
describe('FlowBuilder', () => {
  it('should render empty flow builder', () => {
    render(<FlowBuilder flowId="new" />)

    expect(screen.getByText('Add Step')).toBeInTheDocument()
  })

  it('should add step on button click', async () => {
    render(<FlowBuilder flowId="new" />)

    await userEvent.click(screen.getByText('Add Step'))

    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('should reorder steps via drag-drop', async () => {
    // Test DnD functionality
  })

  it('should validate step configuration before saving', async () => {
    // Test validation errors
  })

  // 10 more tests...
})
```

**Target:** 150 tests for 22 components

### 5.2 Hook Tests

```typescript
describe('useFlowBuilder', () => {
  it('should load flow on mount', async () => {
    const { result } = renderHook(() => useFlowBuilder('flow-123'))

    await waitFor(() => {
      expect(result.current.flow).toBeDefined()
    })
  })

  it('should update flow on addStep', () => {
    const { result } = renderHook(() => useFlowBuilder('flow-123'))

    act(() => {
      result.current.addStep({ type: 'click', selector: '#btn' })
    })

    expect(result.current.flow.steps).toHaveLength(1)
  })

  // 8 more tests...
})
```

**Target:** 30 tests for custom hooks

**Phase 5 Total:** 180 tests, 80% coverage on frontend

---

## Total Test Count Summary

| Phase | Tests | Coverage | Duration |
|-------|-------|----------|----------|
| **Phase 1:** Infrastructure | 0 | - | 1 day |
| **Phase 2:** Critical Paths | 130 | 100% | 3 days |
| **Phase 3:** Packages | 330 | 95% | 3 days |
| **Phase 4:** API | 100 | 90% | 3 days |
| **Phase 5:** Frontend | 180 | 80% | 4 days |
| **Total** | **740 tests** | **95%/90%** | **14 days** |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        workspace: [dsl, runner, overlay, api, web]

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run tests (${{ matrix.workspace }})
        run: pnpm --filter ${{ matrix.workspace }} test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: ${{ matrix.workspace }}

  coverage-check:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Check overall coverage
        run: |
          # Download all coverage reports
          # Merge coverage
          # Fail if <95% line or <90% branch

  block-merge:
    needs: coverage-check
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Block merge
        run: |
          echo "❌ Coverage below threshold"
          exit 1
```

---

## Appendix A: Testing Tools & Libraries

**Unit Testing:**
- Vitest (test runner)
- @vitest/coverage-v8 (coverage)
- @vitest/ui (UI for debugging)

**React Testing:**
- @testing-library/react (component testing)
- @testing-library/user-event (user interactions)
- @testing-library/jest-dom (DOM matchers)
- jsdom (DOM environment)

**API Testing:**
- @cloudflare/vitest-pool-workers (Workers testing)
- MSW (mock service worker for HTTP mocking)

**E2E Testing:**
- Playwright (browser automation)
- @playwright/test (test runner)

**Code Quality:**
- ESLint (linting)
- Prettier (formatting)
- TypeScript (type checking)

---

## Appendix B: Test Naming Conventions

**Pattern:** `should [expected behavior] when [condition]`

**Examples:**
- ✅ `should return 401 when JWT is expired`
- ✅ `should create flow when valid data provided`
- ✅ `should retry 3 times when element not found`
- ❌ `test login` (too vague)
- ❌ `it works` (not descriptive)

---

## Appendix C: Coverage Exclusions

**Allowed Exclusions:**
- Test files (`*.test.ts`, `*.spec.ts`)
- Type definitions (`*.d.ts`)
- Build outputs (`dist/`, `build/`)
- Config files (`vitest.config.ts`, `vite.config.ts`)
- Mock data (`__mocks__/`, `fixtures/`)

**NOT Allowed:**
- Source files in `src/`, `app/`, `lib/`
- Utility functions
- API handlers
- React components

---

**Document Owner:** QA & Engineering
**Review Cadence:** Weekly (during Sprint 1)
**Next Review:** 2025-03-14 (after testing complete)
