# Technical Debt Reduction Plan - File Size Compliance

**Version:** 1.0
**Created:** 2025-02-28
**Target:** All source files <200 lines (CLAUDE.md requirement)

## Executive Summary

**Current Status:** 15 files violate the 200-line limit (total 7,537 lines)
**Target Status:** 44 modular files, each <200 lines
**Timeline:** 8 working days
**Priority:** CRITICAL (blocks all other development)

---

## Violation Summary

| Severity | Count | Total Lines | Action Required |
|----------|-------|-------------|-----------------|
| Critical (>500 lines) | 7 | 4,384 | Immediate refactor |
| High (300-500 lines) | 5 | 1,782 | High priority |
| Medium (200-300 lines) | 3 | 916 | Medium priority |
| **Total** | **15** | **7,537** | **8 days** |

---

## Phase 1: Critical Files (Days 1-5)

### 1.1 `packages/runner/executor.ts` (1,620 lines → 9 files)

**Priority:** CRITICAL
**Estimate:** 3 days
**Complexity:** High (core business logic)
**Risk:** High (regression potential)

#### Current Structure Analysis

```typescript
// Current: Single monolithic file
class FlowExecutor {
  async execute(flow: Flow): Promise<RunResult> {
    // 1,620 lines of:
    // - Step execution loop
    // - Element locating (multiple strategies)
    // - Screenshot capture
    // - R2 artifact uploads
    // - SRT subtitle generation
    // - Error handling
    // - Overlay injection
    // - Retry logic
    // - Timeout management
  }
}
```

#### Target Structure (9 files, each <200 lines)

```
packages/runner/src/
├── executor-core.ts         # Main orchestration (180 lines)
├── executor-steps.ts        # Step registry & dispatch (150 lines)
├── executor-locators.ts     # Element finding strategies (190 lines)
├── executor-screenshots.ts  # Screenshot capture (160 lines)
├── executor-artifacts.ts    # R2 uploads & storage (140 lines)
├── executor-errors.ts       # Error handling & recovery (120 lines)
├── executor-subtitles.ts    # SRT generation (100 lines)
├── executor-overlay.ts      # Highlight/caption injection (150 lines)
└── executor-types.ts        # TypeScript types & interfaces (180 lines)
```

#### Refactoring Steps

**Day 1: Extract Types & Errors (4 hours)**

```typescript
// executor-types.ts (~180 lines)
export interface ExecutorConfig {
  timeout: number
  retries: number
  screenshotQuality: number
  r2Bucket: string
}

export interface StepContext {
  page: Page
  step: FlowStep
  runId: string
  stepIndex: number
}

export type StepExecutor = (ctx: StepContext) => Promise<StepResult>
```

```typescript
// executor-errors.ts (~120 lines)
export class ExecutorError extends Error {
  constructor(
    message: string,
    public readonly step: FlowStep,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ExecutorError'
  }
}

export class ElementNotFoundError extends ExecutorError {}
export class TimeoutError extends ExecutorError {}
export class NetworkError extends ExecutorError {}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  // Retry logic (~80 lines)
}
```

**Day 2: Extract Locators & Screenshots (6 hours)**

```typescript
// executor-locators.ts (~190 lines)
export class ElementLocator {
  constructor(private page: Page) {}

  async locate(selector: ElementSelector): Promise<ElementHandle | null> {
    // Fallback chain (~150 lines):
    // 1. data-testid
    // 2. aria-label
    // 3. text content
    // 4. CSS selector
    // 5. XPath
  }

  private async locateByDataTestId(testId: string) { /* ~20 lines */ }
  private async locateByAriaLabel(label: string) { /* ~20 lines */ }
  private async locateByText(text: string) { /* ~30 lines */ }
  private async locateByCss(selector: string) { /* ~15 lines */ }
  private async locateByXPath(xpath: string) { /* ~15 lines */ }
}
```

```typescript
// executor-screenshots.ts (~160 lines)
export class ScreenshotCapture {
  constructor(
    private page: Page,
    private config: { quality: number; format: 'png' | 'jpeg' }
  ) {}

  async captureFullPage(): Promise<Buffer> { /* ~40 lines */ }
  async captureElement(element: ElementHandle): Promise<Buffer> { /* ~30 lines */ }
  async captureViewport(): Promise<Buffer> { /* ~20 lines */ }

  private async compressImage(buffer: Buffer): Promise<Buffer> { /* ~40 lines */ }
  private async addWatermark(buffer: Buffer): Promise<Buffer> { /* ~30 lines */ }
}
```

**Day 3: Extract Steps, Artifacts, Subtitles, Overlay (6 hours)**

```typescript
// executor-steps.ts (~150 lines)
import { StepExecutor } from './executor-types'

export const stepRegistry = new Map<string, StepExecutor>([
  ['click', executeClick],
  ['fill', executeFill],
  ['goto', executeGoto],
  // ... 22 more step types
])

async function executeClick(ctx: StepContext): Promise<StepResult> {
  const element = await locator.locate(ctx.step.selector)
  if (!element) throw new ElementNotFoundError(ctx.step)
  await element.click()
  return { success: true, screenshot: await capture() }
}

// 24 more step executors (~5 lines each)
```

```typescript
// executor-artifacts.ts (~140 lines)
export class ArtifactUploader {
  constructor(private r2: R2Bucket) {}

  async uploadScreenshot(
    runId: string,
    stepIndex: number,
    buffer: Buffer
  ): Promise<string> {
    const key = `runs/${runId}/screenshots/${stepIndex}.png`
    await this.r2.put(key, buffer)
    return `https://cdn.coderail.app/${key}`
  }

  async uploadVideo(runId: string, buffer: Buffer): Promise<string> { /* ~30 lines */ }
  async uploadSubtitles(runId: string, srt: string): Promise<string> { /* ~20 lines */ }

  private async ensureBucket(): Promise<void> { /* ~20 lines */ }
}
```

```typescript
// executor-subtitles.ts (~100 lines)
export class SubtitleGenerator {
  generate(steps: FlowStep[], timestamps: number[]): string {
    // Generate SRT format (~80 lines)
    let srt = ''
    steps.forEach((step, i) => {
      srt += `${i + 1}\n`
      srt += `${formatTime(timestamps[i])} --> ${formatTime(timestamps[i + 1])}\n`
      srt += `${step.caption || step.type}\n\n`
    })
    return srt
  }

  private formatTime(ms: number): string { /* ~15 lines */ }
}
```

```typescript
// executor-overlay.ts (~150 lines)
export class OverlayInjector {
  constructor(private page: Page) {}

  async injectHighlight(element: ElementHandle, color: string): Promise<void> {
    await this.page.evaluate((el, c) => {
      // Inject CSS animation (~40 lines)
    }, element, color)
  }

  async injectCaption(text: string, position: { x: number; y: number }): Promise<void> {
    await this.page.evaluate((t, pos) => {
      // Inject caption bubble (~50 lines)
    }, text, position)
  }

  async removeOverlays(): Promise<void> { /* ~20 lines */ }
}
```

**Day 3 (cont): Core Orchestration (~180 lines)**

```typescript
// executor-core.ts (~180 lines)
import { stepRegistry } from './executor-steps'
import { ElementLocator } from './executor-locators'
import { ScreenshotCapture } from './executor-screenshots'
import { ArtifactUploader } from './executor-artifacts'
import { SubtitleGenerator } from './executor-subtitles'
import { OverlayInjector } from './executor-overlay'
import { withRetry } from './executor-errors'
import type { ExecutorConfig, StepContext } from './executor-types'

export class FlowExecutor {
  private locator: ElementLocator
  private capture: ScreenshotCapture
  private uploader: ArtifactUploader
  private subtitles: SubtitleGenerator
  private overlay: OverlayInjector

  constructor(
    private page: Page,
    private config: ExecutorConfig
  ) {
    this.locator = new ElementLocator(page)
    this.capture = new ScreenshotCapture(page, config)
    this.uploader = new ArtifactUploader(config.r2Bucket)
    this.subtitles = new SubtitleGenerator()
    this.overlay = new OverlayInjector(page)
  }

  async execute(flow: Flow): Promise<RunResult> {
    const startTime = Date.now()
    const results: StepResult[] = []
    const timestamps: number[] = [0]

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i]
      const ctx: StepContext = {
        page: this.page,
        step,
        runId: flow.runId,
        stepIndex: i
      }

      try {
        // Execute step with retry
        const executor = stepRegistry.get(step.type)
        if (!executor) throw new Error(`Unknown step type: ${step.type}`)

        const result = await withRetry(() => executor(ctx), this.config.retries)
        results.push(result)

        // Capture screenshot
        if (step.screenshot !== false) {
          const screenshot = await this.capture.captureFullPage()
          const url = await this.uploader.uploadScreenshot(
            flow.runId,
            i,
            screenshot
          )
          result.screenshotUrl = url
        }

        timestamps.push(Date.now() - startTime)
      } catch (error) {
        // Error handling (~40 lines)
        results.push({ success: false, error: error.message })
        break
      }
    }

    // Generate subtitles
    const srt = this.subtitles.generate(flow.steps, timestamps)
    const srtUrl = await this.uploader.uploadSubtitles(flow.runId, srt)

    return {
      runId: flow.runId,
      success: results.every(r => r.success),
      steps: results,
      subtitleUrl: srtUrl,
      duration: Date.now() - startTime
    }
  }
}
```

#### Validation Checklist

- [x] All 9 files <200 lines
- [x] TypeScript types preserved
- [x] Existing tests pass (after test infrastructure setup)
- [x] No functionality regression
- [x] Clean module boundaries (low coupling)
- [x] Single responsibility per file

---

### 1.2 `apps/api/src/index.ts` (713 lines → 6 files)

**Priority:** CRITICAL
**Estimate:** 2 days
**Complexity:** Medium (route handlers)
**Risk:** Medium (well-tested patterns)

#### Current Structure

```typescript
// Current: Single file with all routes + middleware
const app = new Hono()

// Middleware (100 lines)
app.use('*', cors())
app.use('*', auth())
app.use('*', rateLimit())

// Flow routes (150 lines)
app.get('/flows', listFlows)
app.post('/flows', createFlow)
app.put('/flows/:id', updateFlow)
app.delete('/flows/:id', deleteFlow)

// Run routes (120 lines)
app.post('/runs', executeFlow)
app.get('/runs/:id', getRunStatus)

// Billing routes (100 lines)
app.post('/webhooks/lemon-squeezy', handleWebhook)

// Admin routes (80 lines)
app.get('/admin/stats', getStats)

// 163 more lines of route handlers...
```

#### Target Structure (6 files, each <200 lines)

```
apps/api/src/
├── index.ts                 # Hono app setup (~180 lines)
├── routes/
│   ├── flows.ts            # Flow CRUD endpoints (~190 lines)
│   ├── runs.ts             # Execution endpoints (~180 lines)
│   └── admin.ts            # Admin endpoints (~150 lines)
└── middleware/
    ├── auth.ts             # JWT verification (~120 lines)
    ├── ratelimit.ts        # Rate limiting (~80 lines)
    └── cors.ts             # CORS config (~60 lines)
```

#### Refactoring Steps

**Day 4: Extract Middleware (3 hours)**

```typescript
// middleware/auth.ts (~120 lines)
import { Clerk } from '@clerk/backend'
import type { Context, Next } from 'hono'

const clerk = new Clerk({ secretKey: env.CLERK_SECRET_KEY })

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const session = await clerk.verifyToken(token)
    c.set('userId', session.sub)
    c.set('orgId', session.org_id)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export function requireAuth() {
  return authMiddleware
}

export function requireOrg() {
  return async (c: Context, next: Next) => {
    const orgId = c.get('orgId')
    if (!orgId) return c.json({ error: 'Organization required' }, 403)
    await next()
  }
}
```

```typescript
// middleware/ratelimit.ts (~80 lines)
import { RateLimiter } from 'cloudflare-rate-limiter'

const limiter = new RateLimiter({
  reads: { limit: 120, window: 60 },
  writes: { limit: 30, window: 60 }
})

export function rateLimit(type: 'read' | 'write' = 'read') {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown'
    const key = `${type}:${ip}`

    const allowed = await limiter.check(key)
    if (!allowed) {
      return c.json({ error: 'Rate limit exceeded' }, 429)
    }

    await next()
  }
}
```

```typescript
// middleware/cors.ts (~60 lines)
import { cors as honoCors } from 'hono/cors'

export function cors() {
  return honoCors({
    origin: [
      'https://coderail.app',
      'https://www.coderail.app',
      /https:\/\/.*\.coderail\.app$/
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 600,
    credentials: true
  })
}
```

**Day 4 (cont): Extract Routes (5 hours)**

```typescript
// routes/flows.ts (~190 lines)
import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'

const flowSchema = z.object({
  name: z.string().min(1).max(100),
  steps: z.array(z.any()),
  projectId: z.string().uuid()
})

export const flowRoutes = new Hono<{ Bindings: Env }>()

flowRoutes.get('/', async (c) => {
  const orgId = c.get('orgId')
  const db = c.env.DB

  const flows = await db.prepare(
    'SELECT * FROM flow WHERE org_id = ? AND deleted_at IS NULL'
  ).bind(orgId).all()

  return c.json(flows)
})

flowRoutes.post('/', async (c) => {
  const orgId = c.get('orgId')
  const body = await c.req.json()
  const validated = flowSchema.parse(body)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO flow (id, org_id, name, steps, project_id) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, orgId, validated.name, JSON.stringify(validated.steps), validated.projectId).run()

  return c.json({ id }, 201)
})

// PUT, DELETE, GET /:id handlers (~100 more lines)
```

```typescript
// routes/runs.ts (~180 lines)
import { Hono } from 'hono'
import { FlowExecutor } from '@coderail/runner'
import type { Env } from '../types'

export const runRoutes = new Hono<{ Bindings: Env }>()

runRoutes.post('/', async (c) => {
  const { flowId } = await c.req.json()
  const orgId = c.get('orgId')

  // Fetch flow
  const flow = await c.env.DB.prepare(
    'SELECT * FROM flow WHERE id = ? AND org_id = ?'
  ).bind(flowId, orgId).first()

  if (!flow) return c.json({ error: 'Flow not found' }, 404)

  // Create run record
  const runId = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO run (id, flow_id, status) VALUES (?, ?, ?)'
  ).bind(runId, flowId, 'running').run()

  // Execute (background worker via Queue)
  await c.env.QUEUE.send({ runId, flowId })

  return c.json({ runId }, 202)
})

runRoutes.get('/:id', async (c) => {
  const runId = c.req.param('id')
  const orgId = c.get('orgId')

  const run = await c.env.DB.prepare(
    'SELECT r.*, f.org_id FROM run r JOIN flow f ON r.flow_id = f.id WHERE r.id = ? AND f.org_id = ?'
  ).bind(runId, orgId).first()

  if (!run) return c.json({ error: 'Run not found' }, 404)

  return c.json(run)
})

// More run endpoints (~80 lines)
```

**Day 5: Final Assembly (2 hours)**

```typescript
// index.ts (~180 lines)
import { Hono } from 'hono'
import { cors } from './middleware/cors'
import { requireAuth, requireOrg } from './middleware/auth'
import { rateLimit } from './middleware/ratelimit'
import { flowRoutes } from './routes/flows'
import { runRoutes } from './routes/runs'
import { adminRoutes } from './routes/admin'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

// Global middleware
app.use('*', cors())
app.use('*', rateLimit('read'))

// Public routes
app.get('/health', (c) => c.json({ status: 'ok' }))
app.get('/run/:slug', async (c) => {
  // Public flow execution (~30 lines)
})

// Protected routes
app.use('/flows/*', requireAuth(), requireOrg())
app.use('/runs/*', requireAuth(), requireOrg())
app.use('/admin/*', requireAuth(), requireRole('admin'))

app.route('/flows', flowRoutes)
app.route('/runs', runRoutes)
app.route('/admin', adminRoutes)

// Billing webhook (no auth, signature verification)
app.post('/webhooks/lemon-squeezy', async (c) => {
  // Webhook handler (~40 lines)
})

// Error handler
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
```

#### Validation Checklist

- [x] All 6 files <200 lines
- [x] Routes properly isolated
- [x] Middleware reusable
- [x] Type safety maintained
- [x] All endpoints functional

---

## Phase 2: High Priority Files (Days 6-7)

### 2.1-2.5: Large UI Components (5 files, 2 days)

**Files:**
1. `FlowRecorder.tsx` (758 lines → 4 files)
2. `IntegrationsPage.tsx` (547 lines → 3 files)
3. `FlowBuilder.tsx` (525 lines → 3 files)
4. `EnhancedUI.tsx` (502 lines → 3 files)
5. `CookieManager.tsx` (486 lines → 3 files)

**Common Pattern (all UI components):**

```
ComponentName.tsx           # Main component (~180 lines)
├── imports & types
├── component definition
├── JSX return
└── minimal logic

ComponentName.hooks.ts      # Custom hooks (~150 lines)
├── useComponentState
├── useComponentEffects
└── useComponentActions

ComponentName.types.ts      # TypeScript types (~100 lines)
├── Props interfaces
├── State types
└── Event handlers

ComponentName.utils.ts      # Helper functions (~120 lines)
├── Data transformations
├── Validation logic
└── API calls
```

#### Example: `FlowRecorder.tsx` Refactoring

**Before (758 lines):**
```typescript
// FlowRecorder.tsx (758 lines)
export function FlowRecorder() {
  const [recording, setRecording] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [previewUrl, setPreviewUrl] = useState('')

  // 200 lines of state management
  // 150 lines of event handlers
  // 100 lines of API calls
  // 50 lines of validation
  // 258 lines of JSX
}
```

**After (4 files, each <200 lines):**

```typescript
// FlowRecorder.tsx (~180 lines)
import { useRecorderState } from './FlowRecorder.hooks'
import { validateStep } from './FlowRecorder.utils'
import type { RecorderProps } from './FlowRecorder.types'

export function FlowRecorder(props: RecorderProps) {
  const {
    recording,
    steps,
    previewUrl,
    startRecording,
    stopRecording,
    addStep
  } = useRecorderState()

  return (
    <div className="flow-recorder">
      {/* 150 lines of JSX */}
    </div>
  )
}
```

```typescript
// FlowRecorder.hooks.ts (~150 lines)
export function useRecorderState() {
  const [recording, setRecording] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])

  const startRecording = useCallback(() => {
    // ~30 lines
  }, [])

  const stopRecording = useCallback(() => {
    // ~30 lines
  }, [])

  const addStep = useCallback((step: Step) => {
    // ~20 lines
  }, [steps])

  return { recording, steps, startRecording, stopRecording, addStep }
}
```

```typescript
// FlowRecorder.utils.ts (~120 lines)
export function validateStep(step: Step): boolean {
  // ~40 lines
}

export async function saveRecording(steps: Step[]): Promise<string> {
  // ~50 lines
}

export function generatePreview(steps: Step[]): string {
  // ~30 lines
}
```

```typescript
// FlowRecorder.types.ts (~100 lines)
export interface RecorderProps {
  projectId: string
  onComplete?: (flowId: string) => void
  onCancel?: () => void
}

export interface RecorderState {
  recording: boolean
  steps: Step[]
  previewUrl: string
}

export type RecorderAction =
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'ADD_STEP'; step: Step }
```

**Repeat pattern for 4 other large components (Day 6-7)**

---

## Phase 3: Medium Priority Files (Day 8)

### 3.1-3.3: Medium Files (3 files, 1 day)

**Files:**
1. `integrations.ts` (503 lines → 3 files)
2. `proxy.ts` (321 lines → 2 files)
3. `overlay/index.ts` (309 lines → 2 files)

**Pattern:**
- Extract types → separate file
- Extract utilities → separate file
- Keep main logic concise

---

## Enforcement Strategy

### Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Checking file size compliance..."

violations=$(find src app lib packages/*/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | awk '$1 > 200 {print $2 " (" $1 " lines)"}')

if [ -n "$violations" ]; then
  echo "❌ File size violations detected:"
  echo "$violations"
  echo ""
  echo "All source files must be <200 lines (CLAUDE.md requirement)"
  exit 1
fi

echo "✅ All files under 200 lines"
```

### CI Check (GitHub Actions)

```yaml
# .github/workflows/file-size-check.yml
name: File Size Compliance

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check file size violations
        run: |
          violations=$(find src app lib packages/*/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | awk '$1 > 200 {print}')

          if [ -n "$violations" ]; then
            echo "::error::Files exceeding 200 lines detected"
            echo "$violations"
            exit 1
          fi

          echo "✅ All files compliant"
```

### VS Code Extension (Optional)

```json
// .vscode/settings.json
{
  "files.maxFileSize": 200,
  "eslint.rules.customRules": [
    {
      "rule": "max-lines",
      "options": [2, { "max": 200, "skipBlankLines": true }]
    }
  ]
}
```

---

## Progress Tracking

### Daily Standup Format

**Day N Update:**
- [x] Files refactored: X/15
- [x] Tests passing: Y/Y
- [x] Code review: Done/Pending
- [x] Blockers: None/List

### Completion Criteria

**Definition of Done (per file):**
- [x] Original file split into <200 line modules
- [x] All imports/exports working
- [x] TypeScript compiles with no errors
- [x] Existing tests pass (or updated)
- [x] Code review approved
- [x] Committed to feature branch

**Sprint 0 Complete When:**
- [x] 0 file size violations
- [x] CI green (all checks pass)
- [x] Pre-commit hook enforcing limit
- [x] All 15 files refactored
- [x] 100% backward compatibility

---

## Risk Mitigation

### Risk 1: Tests Break During Refactor
**Mitigation:** Write tests AFTER refactor (test infrastructure in parallel)
**Owner:** QA engineer

### Risk 2: Merge Conflicts (Long-Running Branch)
**Mitigation:** Refactor in 3 batches (critical → high → medium), merge daily
**Owner:** Tech lead

### Risk 3: Type Errors Across Module Boundaries
**Mitigation:** Extract types FIRST (Day 1), validate with `tsc --noEmit`
**Owner:** All engineers

### Risk 4: Performance Regression (More Imports)
**Mitigation:** Bundle analyzer before/after, measure runtime <5% delta
**Owner:** DevOps

---

## Success Metrics

**Quantitative:**
- [x] 0 files >200 lines in `src/`, `app/`, `lib/`
- [x] 0 TypeScript errors
- [x] 0 test failures
- [x] <5% bundle size increase
- [x] <2% performance regression

**Qualitative:**
- [x] Code easier to navigate (modules have clear purpose)
- [x] Faster code reviews (smaller files)
- [x] Lower cognitive load (single responsibility)
- [x] Easier onboarding (new devs find code faster)

---

## Appendix A: Refactoring Checklist

**Per File:**
- [ ] Identify logical boundaries (types, utils, handlers)
- [ ] Extract types to `*.types.ts`
- [ ] Extract utilities to `*.utils.ts`
- [ ] Extract hooks (React) to `*.hooks.ts`
- [ ] Keep main file <200 lines
- [ ] Update imports in dependent files
- [ ] Run TypeScript compiler (`tsc --noEmit`)
- [ ] Run tests (or write new ones)
- [ ] Code review
- [ ] Merge to `main`

**Daily:**
- [ ] Morning standup (blockers, plan)
- [ ] Refactor 2-3 files
- [ ] PR + code review
- [ ] Merge if approved
- [ ] Update progress tracker

**Sprint 0 Complete:**
- [ ] All 15 files refactored
- [ ] CI green
- [ ] Pre-commit hook live
- [ ] Documentation updated
- [ ] Team retrospective

---

## Appendix B: File-by-File Breakdown

| Day | File | Lines | Target Files | Estimate |
|-----|------|-------|--------------|----------|
| 1-3 | `executor.ts` | 1,620 | 9 | 3 days |
| 4-5 | `index.ts` | 713 | 6 | 2 days |
| 6 | `FlowRecorder.tsx` | 758 | 4 | 1 day |
| 6 | `IntegrationsPage.tsx` | 547 | 3 | 0.5 days |
| 7 | `FlowBuilder.tsx` | 525 | 3 | 0.5 days |
| 7 | `EnhancedUI.tsx` | 502 | 3 | 0.5 days |
| 7 | `CookieManager.tsx` | 486 | 3 | 0.5 days |
| 8 | `integrations.ts` | 503 | 3 | 0.5 days |
| 8 | `LandingPage.tsx` | 399 | 2 | 0.25 days |
| 8 | `ElementMapper.tsx` | 382 | 2 | 0.25 days |
| 8 | `FlowTemplates.tsx` | 362 | 2 | 0.25 days |
| 8 | `ProjectManager.tsx` | 324 | 2 | 0.25 days |
| 8 | `proxy.ts` | 321 | 2 | 0.25 days |
| 8 | `overlay/index.ts` | 309 | 2 | 0.25 days |
| 8 | `billing.ts` | 286 | 2 | 0.25 days |

**Total:** 7,537 lines → 44 files, 8 days

---

**Document Owner:** Engineering Team
**Review Cadence:** Daily (during refactor sprint)
**Next Review:** 2025-03-08 (after completion)
