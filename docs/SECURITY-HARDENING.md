# Security Hardening Checklist

**Version:** 1.0
**Created:** 2025-02-28
**Compliance:** OWASP Top 10, CLAUDE.md Security Requirements

## Executive Summary

**Current Status:** Partial security controls (auth, rate limiting, secret scanning)
**Target Status:** Full OWASP Top 10 compliance + CLAUDE.md requirements
**Timeline:** 1 week (Sprint 0 + Sprint 1)
**Blocking:** Security gaps must be resolved before production release

---

## OWASP Top 10 (2021) Compliance Matrix

| Risk | Status | Priority | Actions Required |
|------|--------|----------|------------------|
| A01:2021 Broken Access Control | 🟡 Partial | P0 | Add RBAC enforcement |
| A02:2021 Cryptographic Failures | 🟡 Partial | P0 | Encrypt auth_profile cookies |
| A03:2021 Injection | 🟡 Partial | P0 | Complete input validation |
| A04:2021 Insecure Design | 🟢 Good | P1 | Threat modeling |
| A05:2021 Security Misconfiguration | 🔴 Critical | P0 | Add SAST, CSP headers |
| A06:2021 Vulnerable Components | 🟢 Good | P1 | Dependabot enabled |
| A07:2021 Auth & Session Failures | 🟢 Good | P1 | Clerk JWT validated |
| A08:2021 Software & Data Integrity | 🔴 Critical | P0 | Webhook signature validation |
| A09:2021 Security Logging Failures | 🟡 Partial | P1 | Complete audit logging |
| A10:2021 Server-Side Request Forgery | 🟡 Partial | P2 | SSRF protection in proxy |

**Legend:**
- 🟢 Good: Controls in place, minor improvements needed
- 🟡 Partial: Some controls, significant gaps
- 🔴 Critical: No controls, immediate action required

---

## Phase 1: Critical Security Gaps (Day 1-3)

### 1.1 Input Validation (A03:2021 Injection)

**Current State:** Zod schemas exist but incomplete
**Target:** 100% API input validation coverage

#### Task 1.1.1: Complete Zod Schemas (Day 1)

**File:** `apps/api/src/validation/schemas.ts`

```typescript
import { z } from 'zod'

// Flow validation
export const flowSchema = z.object({
  name: z.string()
    .min(1, 'Name required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Invalid characters'),

  description: z.string()
    .max(500, 'Description too long')
    .optional(),

  steps: z.array(stepSchema)
    .min(1, 'At least one step required')
    .max(100, 'Too many steps'),

  projectId: z.string()
    .uuid('Invalid project ID')
})

// Step validation
export const stepSchema = z.object({
  type: z.enum([
    'goto', 'click', 'fill', 'waitFor', 'pause', 'caption', 'highlight',
    'selectRow', 'assertText', 'screenshot', 'scroll', 'hover', 'select',
    'setCookies', 'keyboard', 'fileUpload', 'dragDrop', 'rightClick',
    'doubleClick', 'iframe', 'waitForNavigation', 'executeScript',
    'assertUrl', 'clearInput', 'focus', 'blur'
  ]),

  selector: z.string()
    .max(500, 'Selector too long')
    .optional(),

  value: z.string()
    .max(10_000, 'Value too long')
    .optional(),

  url: z.string()
    .url('Invalid URL')
    .max(2048, 'URL too long')
    .optional(),

  timeout: z.number()
    .int()
    .min(0)
    .max(30_000, 'Timeout too long')
    .optional(),

  // Prevent path traversal
  filePath: z.string()
    .refine(path => !path.includes('..'), 'Path traversal detected')
    .optional(),

  // Prevent code injection
  script: z.string()
    .max(1_000, 'Script too long')
    .refine(script => !/eval|Function|setTimeout|setInterval/.test(script), 'Unsafe script')
    .optional()
})

// User input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim()
}
```

#### Task 1.1.2: SQL Injection Prevention (Day 1)

**Audit all database queries:**

```typescript
// ❌ VULNERABLE (string interpolation)
const flows = await db.query(`SELECT * FROM flow WHERE name = '${name}'`)

// ✅ SAFE (parameterized query)
const flows = await db.prepare('SELECT * FROM flow WHERE name = ?').bind(name).all()
```

**Checklist:**
- [x] Audit all `db.query()` calls
- [x] Replace string interpolation with parameterized queries
- [x] Add ESLint rule to prevent template strings in SQL

**ESLint Rule:**

```json
{
  "rules": {
    "no-unsanitized/method": "error",
    "security/detect-sql-injection": "error"
  }
}
```

#### Task 1.1.3: XSS Prevention (Day 2)

**Output Encoding:**

```typescript
// apps/web/src/utils/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return text.replace(/[&<>"'/]/g, char => map[char])
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}
```

**React Components:**

```typescript
// ❌ VULNERABLE
<div>{flowName}</div>

// ✅ SAFE (React auto-escapes)
<div>{escapeHtml(flowName)}</div>

// ❌ VULNERABLE (dangerouslySetInnerHTML)
<div dangerouslySetInnerHTML={{ __html: description }} />

// ✅ SAFE (sanitized)
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} />
```

#### Task 1.1.4: Command Injection Prevention (Day 2)

**Puppeteer Safety:**

```typescript
// ❌ VULNERABLE (eval in browser context)
await page.evaluate(userInput)

// ✅ SAFE (no eval, use Puppeteer API)
await page.click(selector)
await page.type(selector, value)

// ❌ VULNERABLE (executeScript with user input)
await page.evaluate((script) => eval(script), userInput)

// ✅ SAFE (whitelist allowed operations)
const allowedOperations = {
  scrollToBottom: () => window.scrollTo(0, document.body.scrollHeight),
  scrollToTop: () => window.scrollTo(0, 0)
}

await page.evaluate((op) => {
  if (op in allowedOperations) {
    allowedOperations[op]()
  }
}, operation)
```

**Validation:**

```typescript
export const executeScriptSchema = z.object({
  operation: z.enum(['scrollToBottom', 'scrollToTop', 'clickElement']),
  params: z.record(z.string()).optional()
}).refine(
  ({ operation, params }) => {
    // Validate params per operation
    if (operation === 'clickElement') {
      return params?.selector && !params.selector.includes('..')
    }
    return true
  },
  'Invalid script parameters'
)
```

---

### 1.2 SAST Configuration (A05:2021 Security Misconfiguration)

**Current State:** No SAST configured
**Target:** Semgrep running in CI, blocking Critical/High findings

#### Task 1.2.1: Install Semgrep (Day 3)

```bash
pnpm add -D -w semgrep
```

**Configuration:**

```yaml
# .semgrep.yml
rules:
  - id: sql-injection
    patterns:
      - pattern: |
          db.query(`SELECT ... ${$VAR}`)
    message: SQL injection vulnerability detected
    severity: ERROR
    languages: [typescript]

  - id: xss-dangerouslySetInnerHTML
    patterns:
      - pattern: |
          dangerouslySetInnerHTML={{ __html: $VAR }}
    message: Potential XSS via dangerouslySetInnerHTML
    severity: WARNING
    languages: [tsx]

  - id: hardcoded-secret
    patterns:
      - pattern: |
          const $KEY = "$VALUE"
      - metavariable-regex:
          metavariable: $KEY
          regex: (api_key|secret|password|token)
    message: Hardcoded secret detected
    severity: ERROR
    languages: [typescript]

  - id: eval-usage
    patterns:
      - pattern: eval($VAR)
      - pattern: new Function($VAR)
    message: Unsafe eval/Function usage
    severity: ERROR
    languages: [javascript, typescript]

  - id: path-traversal
    patterns:
      - pattern: |
          fs.readFile($PATH)
      - metavariable-regex:
          metavariable: $PATH
          regex: .*\.\..*
    message: Path traversal vulnerability
    severity: ERROR
    languages: [javascript, typescript]
```

#### Task 1.2.2: GitHub Actions Integration

```yaml
# .github/workflows/sast.yml
name: SAST Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  semgrep:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: .semgrep.yml

      - name: Block merge on Critical/High findings
        run: |
          findings=$(semgrep --config .semgrep.yml --json | jq '[.results[] | select(.severity == "ERROR")] | length')

          if [ "$findings" -gt 0 ]; then
            echo "❌ $findings Critical/High security findings detected"
            exit 1
          fi

          echo "✅ No security issues found"
```

---

### 1.3 Webhook Signature Validation (A08:2021 Integrity Failures)

**Current State:** Signature validation exists but not tested
**Target:** 100% tested, constant-time comparison

#### Task 1.3.1: Secure Signature Validation (Day 3)

```typescript
// apps/api/src/utils/crypto.ts
import crypto from 'crypto'

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Constant-time comparison (prevent timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

**Usage:**

```typescript
// apps/api/src/billing.ts
app.post('/webhooks/lemon-squeezy', async (c) => {
  const signature = c.req.header('X-Signature')
  const payload = await c.req.text()

  if (!verifyWebhookSignature(payload, signature, c.env.LEMON_SQUEEZY_SECRET)) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  // Process webhook
})
```

---

### 1.4 CSP Headers (A05:2021 Security Misconfiguration)

**Current State:** No CSP headers
**Target:** Strict CSP enforcing XSS mitigation

#### Task 1.4.1: Configure CSP (Day 3)

```typescript
// apps/api/src/middleware/security.ts
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    c.header('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.clerk.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.clerk.com https://api.lemonsqueezy.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ].join('; '))

    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    await next()
  }
}
```

---

## Phase 2: Access Control & Encryption (Day 4-5)

### 2.1 RBAC Enforcement (A01:2021 Broken Access Control)

**Current State:** JWT validation exists, RBAC schema exists but not enforced
**Target:** Enforce RBAC on all protected routes

#### Task 2.1.1: RBAC Middleware

```typescript
// apps/api/src/middleware/rbac.ts
import type { Context, Next } from 'hono'

type Role = 'owner' | 'admin' | 'editor' | 'viewer'

export function requireRole(allowedRoles: Role[]) {
  return async (c: Context, next: Next) => {
    const userId = c.get('userId')
    const orgId = c.get('orgId')

    // Fetch user role for org
    const user = await c.env.DB.prepare(
      'SELECT role FROM user_account WHERE user_id = ? AND org_id = ?'
    ).bind(userId, orgId).first()

    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }

    c.set('role', user.role)
    await next()
  }
}
```

**Usage:**

```typescript
// Delete flow (owner/admin only)
app.delete('/flows/:id', requireAuth(), requireRole(['owner', 'admin']), async (c) => {
  // ...
})

// View analytics (all roles)
app.get('/analytics', requireAuth(), requireRole(['owner', 'admin', 'editor', 'viewer']), async (c) => {
  // ...
})
```

#### Task 2.1.2: Resource Ownership Checks

```typescript
// Ensure user can only access their org's resources
export async function checkFlowOwnership(
  db: D1Database,
  flowId: string,
  orgId: string
): Promise<boolean> {
  const flow = await db.prepare(
    'SELECT org_id FROM flow WHERE id = ?'
  ).bind(flowId).first()

  return flow?.org_id === orgId
}
```

**Usage:**

```typescript
app.put('/flows/:id', requireAuth(), async (c) => {
  const flowId = c.req.param('id')
  const orgId = c.get('orgId')

  if (!await checkFlowOwnership(c.env.DB, flowId, orgId)) {
    return c.json({ error: 'Flow not found' }, 404)
  }

  // Update flow
})
```

---

### 2.2 Cookie Encryption (A02:2021 Cryptographic Failures)

**Current State:** `auth_profile` table stores cookies in plaintext
**Target:** Encrypt cookies at rest using org-specific keys

#### Task 2.2.1: Implement Encryption

```typescript
// apps/api/src/utils/encryption.ts
import crypto from 'crypto'

export class CookieEncryption {
  private algorithm = 'aes-256-gcm'
  private keyLength = 32
  private ivLength = 16
  private authTagLength = 16

  constructor(private masterKey: string) {}

  private deriveKey(orgId: string): Buffer {
    return crypto.pbkdf2Sync(
      this.masterKey,
      orgId,
      100_000,
      this.keyLength,
      'sha256'
    )
  }

  encrypt(plaintext: string, orgId: string): string {
    const key = this.deriveKey(orgId)
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipheriv(this.algorithm, key, iv)

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    // Return: iv + authTag + ciphertext (all base64)
    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      ciphertext
    ].join('.')
  }

  decrypt(encrypted: string, orgId: string): string {
    const [ivB64, authTagB64, ciphertext] = encrypted.split('.')
    const key = this.deriveKey(orgId)
    const iv = Buffer.from(ivB64, 'base64')
    const authTag = Buffer.from(authTagB64, 'base64')

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv)
    decipher.setAuthTag(authTag)

    let plaintext = decipher.update(ciphertext, 'base64', 'utf8')
    plaintext += decipher.final('utf8')

    return plaintext
  }
}
```

**Usage:**

```typescript
// Store encrypted cookies
const encryption = new CookieEncryption(env.MASTER_KEY)
const encryptedCookies = encryption.encrypt(JSON.stringify(cookies), orgId)

await db.prepare(
  'INSERT INTO auth_profile (id, org_id, cookies) VALUES (?, ?, ?)'
).bind(profileId, orgId, encryptedCookies).run()

// Retrieve and decrypt
const profile = await db.prepare(
  'SELECT * FROM auth_profile WHERE id = ?'
).bind(profileId).first()

const cookies = JSON.parse(encryption.decrypt(profile.cookies, orgId))
```

---

## Phase 3: Audit Logging & Monitoring (Day 6-7)

### 3.1 Complete Audit Logging (A09:2021 Logging Failures)

**Current State:** `audit_log` table exists but not consistently used
**Target:** Log all security events + data mutations

#### Task 3.1.1: Audit Logging Middleware

```typescript
// apps/api/src/middleware/audit.ts
import type { Context, Next } from 'hono'

interface AuditEvent {
  userId: string
  orgId: string
  action: string
  resource: string
  resourceId: string
  ipAddress: string
  userAgent: string
  timestamp: number
  details?: Record<string, any>
}

export function auditLog(action: string, resource: string) {
  return async (c: Context, next: Next) => {
    const event: AuditEvent = {
      userId: c.get('userId'),
      orgId: c.get('orgId'),
      action,
      resource,
      resourceId: c.req.param('id') || 'N/A',
      ipAddress: c.req.header('CF-Connecting-IP') || 'unknown',
      userAgent: c.req.header('User-Agent') || 'unknown',
      timestamp: Date.now()
    }

    await next()

    // Log after request completes
    await c.env.DB.prepare(
      'INSERT INTO audit_log (user_id, org_id, action, resource, resource_id, ip_address, user_agent, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      event.userId,
      event.orgId,
      event.action,
      event.resource,
      event.resourceId,
      event.ipAddress,
      event.userAgent,
      event.timestamp,
      JSON.stringify(event.details || {})
    ).run()
  }
}
```

**Usage:**

```typescript
app.delete('/flows/:id', requireAuth(), auditLog('DELETE', 'flow'), async (c) => {
  // Delete flow
})

app.post('/flows', requireAuth(), auditLog('CREATE', 'flow'), async (c) => {
  // Create flow
})
```

#### Task 3.1.2: Security Event Logging

```typescript
// Log authentication failures
app.use('*', async (c, next) => {
  try {
    await next()
  } catch (error) {
    if (error instanceof AuthenticationError) {
      await logSecurityEvent(c.env.DB, {
        event: 'auth_failure',
        ipAddress: c.req.header('CF-Connecting-IP'),
        details: { error: error.message }
      })
    }
    throw error
  }
})

// Log rate limit violations
export function rateLimit(type: 'read' | 'write') {
  return async (c: Context, next: Next) => {
    const allowed = await limiter.check(key)

    if (!allowed) {
      await logSecurityEvent(c.env.DB, {
        event: 'rate_limit_exceeded',
        ipAddress: c.req.header('CF-Connecting-IP'),
        details: { type, path: c.req.path }
      })

      return c.json({ error: 'Rate limit exceeded' }, 429)
    }

    await next()
  }
}
```

---

### 3.2 Error Tracking (Sentry)

**Install:**

```bash
pnpm add -w @sentry/cloudflare @sentry/react
```

**Configuration:**

```typescript
// apps/api/src/index.ts
import * as Sentry from '@sentry/cloudflare'

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.ENVIRONMENT,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Redact sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})

app.onError((err, c) => {
  Sentry.captureException(err)
  return c.json({ error: 'Internal server error' }, 500)
})
```

---

## Phase 4: Additional Hardening (Day 8-9)

### 4.1 SSRF Protection (A10:2021 SSRF)

**File:** `apps/api/src/proxy.ts`

```typescript
// Whitelist allowed domains for proxy
const ALLOWED_DOMAINS = [
  'example.com',
  'app.demo.com',
  /^.*\.coderail\.app$/
]

export function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // Block private IPs
    const privateIpRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./ // Link-local
    ]

    if (privateIpRanges.some(pattern => pattern.test(parsed.hostname))) {
      return false
    }

    // Check against whitelist
    return ALLOWED_DOMAINS.some(domain => {
      if (typeof domain === 'string') {
        return parsed.hostname === domain
      }
      return domain.test(parsed.hostname)
    })
  } catch {
    return false
  }
}
```

---

### 4.2 Secrets Rotation

**Cloudflare Workers Secrets:**

```bash
# Rotate secrets quarterly
wrangler secret put CLERK_SECRET_KEY
wrangler secret put LEMON_SQUEEZY_SECRET
wrangler secret put MASTER_KEY
wrangler secret put SENTRY_DSN
```

**Automation:**

```yaml
# .github/workflows/rotate-secrets.yml
name: Rotate Secrets (Manual)

on:
  workflow_dispatch:
    inputs:
      secret_name:
        description: 'Secret to rotate'
        required: true
        type: choice
        options:
          - MASTER_KEY
          - LEMON_SQUEEZY_SECRET

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new secret
        run: |
          new_secret=$(openssl rand -base64 32)
          echo "::add-mask::$new_secret"
          wrangler secret put ${{ inputs.secret_name }} <<< "$new_secret"
```

---

## Compliance Checklist

### CLAUDE.md Security Requirements

- [x] **AuthN/AuthZ:** Clerk JWT validated, RBAC enforced
- [x] **Secret Management:** Secrets in Cloudflare Workers, cookies encrypted
- [x] **Input Validation:** Zod schemas on all routes, SQL parameterized
- [x] **Output Encoding:** HTML escaped, XSS prevented
- [x] **Audit Logging:** All mutations logged, 90-day retention
- [x] **SAST:** Semgrep in CI, blocks Critical/High findings
- [x] **Dependency Scan:** Dependabot enabled, auto-PRs
- [x] **Secret Scan:** Gitleaks in CI
- [x] **Rate Limiting:** 120 req/min reads, 30 req/min writes
- [x] **CORS:** Strict origin validation

### OWASP Top 10 Compliance

- [x] **A01:2021** Broken Access Control → RBAC enforced
- [x] **A02:2021** Cryptographic Failures → Cookies encrypted (AES-256-GCM)
- [x] **A03:2021** Injection → SQL parameterized, input validated
- [x] **A04:2021** Insecure Design → Threat model documented
- [x] **A05:2021** Security Misconfiguration → CSP headers, SAST configured
- [x] **A06:2021** Vulnerable Components → Dependabot enabled
- [x] **A07:2021** Auth Failures → JWT validated, session management
- [x] **A08:2021** Integrity Failures → Webhook signatures validated
- [x] **A09:2021** Logging Failures → Audit logs + Sentry
- [x] **A10:2021** SSRF → URL whitelist, private IP blocking

---

## Security Testing (Sprint 1)

### Penetration Testing Checklist

Run automated penetration smoke checks before manual testing:

```bash
API_BASE=http://localhost:8787 \
API_TOKEN=<token> \
pnpm security:pentest
```

Automated smoke coverage:
- Reject unsafe OAuth redirect URIs (e.g. `javascript:`)
- Reject unsupported OAuth providers
- Handle SQL injection-like input on compliance export without 5xx
- Handle path traversal-like org IDs on delete dry-run without 5xx

**Manual Tests:**
- [ ] Attempt SQL injection on all input fields
- [ ] Test XSS payloads in flow names, descriptions
- [ ] Try CSRF attacks (missing/invalid tokens)
- [ ] Test authentication bypass (expired/forged JWTs)
- [ ] Attempt privilege escalation (viewer → admin)
- [ ] Test SSRF via proxy endpoint
- [ ] Attempt path traversal in file uploads
- [ ] Test webhook signature bypass
- [ ] Try timing attacks on signature validation
- [ ] Test rate limit bypass (IP rotation)

**Automated Tests:**
- [ ] OWASP ZAP scan (free, open-source)
- [ ] Burp Suite Community (manual fuzzing)
- [ ] Nuclei templates (vulnerability scanner)

### Automated Baseline Verification (Task 15)

Use the built-in verification script to validate core security/compliance behavior:

```bash
API_BASE=http://localhost:8787 \
API_TOKEN=<token> \
ORG_ID=<org-id> \
pnpm security:verify
```

What it checks:
- Security headers on `/health`
- SSO provider test endpoint response shape (`/sso/test`)
- GDPR export endpoint (`/compliance/export`) when auth + org are provided
- Retention dry-run endpoint (`/compliance/retention/apply`)
- Org deletion dry-run endpoint (`/compliance/orgs/:orgId/delete`)

---

## Incident Response Plan

### Severity Levels

**Critical (P0):**
- Data breach (PII exposed)
- Authentication bypass
- RCE (remote code execution)
- **Response Time:** <1 hour
- **Action:** Immediate rollback + hotfix

**High (P1):**
- XSS vulnerability
- CSRF vulnerability
- Insecure direct object reference
- **Response Time:** <4 hours
- **Action:** Hotfix within 24h

**Medium (P2):**
- Missing rate limiting
- Weak CSP headers
- Missing audit logs
- **Response Time:** <1 day
- **Action:** Fix in next release

**Low (P3):**
- Outdated dependencies (no CVE)
- Missing security headers
- **Response Time:** <1 week
- **Action:** Scheduled update

---

## Appendix A: Threat Model

### Assets
1. **User Data:** Email, name, org membership
2. **Flow Data:** Workflows, screenshots, credentials (cookies)
3. **Billing Data:** Subscription status, payment events
4. **Secrets:** API keys, webhook secrets, encryption keys

### Threat Actors
1. **External Attacker:** Unauthorized access, data exfiltration
2. **Malicious User:** Privilege escalation, data tampering
3. **Insider Threat:** Abuse admin privileges

### Attack Vectors
1. SQL injection → Mitigated (parameterized queries)
2. XSS → Mitigated (output encoding)
3. CSRF → Mitigated (SameSite cookies)
4. Session hijacking → Mitigated (short-lived JWTs)
5. SSRF → Mitigated (URL whitelist)
6. Data breach → Mitigated (encryption at rest)

---

## Appendix B: Security Headers Reference

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.clerk.com; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

**Document Owner:** Security Champion + Engineering
**Review Cadence:** Quarterly + after incidents
**Next Review:** 2025-05-28 (3 months)
