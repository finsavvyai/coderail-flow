# CoderailFlow — CLAUDE.md

> **Portfolio Tracker**: Platform Launch Q2 2026 | **Readiness**: 84% | **Category**: SHIP

## Mission
Record workflows once, automate anywhere—no-code browser automation with visual editor, GIF/video export, and template marketplace for developers, QA, and automation enthusiasts.

## Code Map & Index

### Directory Structure
```
coderail-flow/
├── apps/
│   ├── api/              # Cloudflare Workers + Hono — 40 API routes
│   │   ├── src/
│   │   │   ├── index.ts          # Hono app setup, route mounting
│   │   │   ├── routes/           # API endpoints
│   │   │   │   ├── flows.ts      # Flow CRUD, versioning
│   │   │   │   ├── runs.ts       # Execution, logs, results
│   │   │   │   ├── billing.ts    # LemonSqueezy webhooks
│   │   │   │   ├── marketplace.ts # Template listing, installation
│   │   │   │   └── auth.ts       # Clerk JWT, session
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts       # Clerk JWT validation
│   │   │   │   ├── ratelimit.ts  # KV sliding window
│   │   │   │   └── validation.ts # Zod schema checking
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── flows.ts      # Flow CRUD operations
│   │   │   │   ├── runs.ts       # Execution orchestration
│   │   │   │   ├── artifacts.ts  # R2 storage, screenshot processing
│   │   │   │   └── browser.ts    # Puppeteer invocation
│   │   │   ├── lib/
│   │   │   │   ├── db.ts         # D1 query helpers
│   │   │   │   ├── crypto.ts     # Encryption for stored cookies
│   │   │   │   └── validation.ts # Zod schemas
│   │   │   └── test/             # Unit tests
│   │   └── wrangler.toml
│   └── web/              # Next.js 16 — frontend dashboard + editor
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/       # Login, signup pages
│       │   │   ├── dashboard/    # Flow list, recent runs
│       │   │   ├── flows/        # Individual flow editor
│       │   │   ├── run/          # Run details, logs, artifacts
│       │   │   ├── marketplace/  # Template discovery
│       │   │   ├── settings/     # API keys, billing
│       │   │   └── onboarding/   # Signup wizard
│       │   ├── components/       # React components
│       │   │   ├── Editor/       # Flow builder UI
│       │   │   ├── Canvas/       # Step visualization
│       │   │   ├── Inspector/    # Step properties panel
│       │   │   ├── PlaybackControls/ # Play, pause, speed
│       │   │   └── ExportMenu/   # GIF, video, markdown
│       │   ├── lib/
│       │   │   ├── api.ts        # HTTP client with auth
│       │   │   ├── hooks/        # useFlowBuilder, useRecording, etc.
│       │   │   ├── store.ts      # Zustand state (flows, UI)
│       │   │   └── utils/        # Formatting, validation
│       │   ├── styles/           # CSS modules, Tailwind
│       │   └── __tests__/        # Component tests
│       └── next.config.js
├── packages/
│   ├── dsl/              # Domain-specific language for flows
│   │   ├── src/
│   │   │   ├── schema.ts         # Zod schema for flow definition
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   ├── compiler.ts       # Compile flow to step sequence
│   │   │   └── validators.ts     # Flow validation rules
│   │   └── package.json
│   ├── runner/           # Flow execution engine
│   │   ├── src/
│   │   │   ├── executor-core.ts # Orchestration, step loop
│   │   │   ├── executor-steps.ts # Step type registry (click, type, etc.)
│   │   │   ├── executor-locators.ts # Element finding (testid → css → xpath)
│   │   │   ├── executor-screenshots.ts # Screenshot + compression
│   │   │   ├── executor-artifacts.ts # R2 upload, manifest
│   │   │   ├── executor-errors.ts # Error handling, retry logic
│   │   │   ├── executor-subtitles.ts # SRT generation
│   │   │   ├── executor-overlay.ts # Highlight/caption rendering
│   │   │   └── executor-types.ts # Type definitions
│   │   ├── src/steps/   # Step implementations
│   │   │   ├── click.ts
│   │   │   ├── type.ts
│   │   │   ├── wait.ts
│   │   │   ├── screenshot.ts
│   │   │   ├── http-request.ts
│   │   │   ├── js-evaluate.ts
│   │   │   ├── condition.ts
│   │   │   └── loop.ts
│   │   └── package.json
│   ├── overlay/          # Annotation injection library
│   │   ├── src/
│   │   │   ├── index.ts         # Main overlay controller
│   │   │   ├── highlight.ts     # Element highlight rendering
│   │   │   ├── caption.ts       # Step caption rendering
│   │   │   ├── styles.ts        # CSS injection
│   │   │   └── timing.ts        # Synchronization with playback
│   │   └── package.json
│   ├── shared/           # Types, constants, utilities
│   │   ├── src/
│   │   │   ├── types.ts         # Flow, Run, Step, Artifact types
│   │   │   ├── constants.ts     # Status enums, error codes
│   │   │   ├── errors.ts        # Typed error classes
│   │   │   └── utils.ts         # Shared helpers
│   │   └── package.json
│   └── ui/               # React component library
│       ├── src/
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── Modal.tsx
│       │   ├── Input.tsx
│       │   ├── Toast.tsx
│       │   ├── Badge.tsx
│       │   ├── Loading.tsx
│       │   └── index.ts
│       └── package.json
├── tests/
│   ├── unit/             # Jest tests
│   ├── integration/      # API + DB tests
│   └── e2e/             # Playwright tests
├── docker/
│   ├── Dockerfile        # Multi-stage build
│   └── docker-compose.yml # Local dev
└── docs/
    ├── API.md            # Route documentation
    ├── DSL.md            # Flow language spec
    ├── DEPLOYMENT.md     # CF Workers, Pages
    └── examples/         # Workflow templates
```

### Key Files Index
| File | Purpose | Lines |
|------|---------|-------|
| `packages/runner/src/executor-core.ts` | Orchestration, step loop, error handling | ~180 |
| `packages/runner/src/executor-locators.ts` | Element finding with fallback chain | ~150 |
| `packages/runner/src/executor-screenshots.ts` | Capture, compress, upload | ~140 |
| `apps/api/src/routes/flows.ts` | Flow CRUD, versioning, sharing | ~160 |
| `apps/api/src/routes/runs.ts` | Execution API, log streaming | ~140 |
| `apps/api/src/services/browser.ts` | Puppeteer invocation, session mgmt | ~130 |
| `apps/web/src/components/Editor/Canvas.tsx` | Flow visualization | ~180 |
| `apps/web/src/components/Inspector.tsx` | Step properties panel | ~140 |
| `packages/dsl/src/schema.ts` | Zod flow definition schema | ~120 |

### Flow Definition Example
```typescript
// Flow DSL (Zod-validated)
{
  id: "flow_123",
  name: "Signup to Newsletter",
  steps: [
    {
      id: "step_1",
      type: "navigate",
      url: "https://example.com"
    },
    {
      id: "step_2",
      type: "click",
      selector: { testId: "email-input" },
      fallback: [{ xpath: "//input[@name='email']" }]
    },
    {
      id: "step_3",
      type: "type",
      text: "user@example.com"
    },
    {
      id: "step_4",
      type: "click",
      selector: { text: "Subscribe" }
    },
    {
      id: "step_5",
      type: "wait",
      ms: 2000
    },
    {
      id: "step_6",
      type: "screenshot"
    }
  ],
  config: {
    timeout: 30000,
    viewport: { width: 1440, height: 900 },
    headless: true,
    stealth: true,
    captureVideo: true,
    captureArtifacts: true
  }
}
```

### Database Tables (D1)
```
Core:
- users (id, email, clerk_id, tier, created_at)
- organizations (id, owner_id, name)
- org_members (org_id, user_id, role)

Flows:
- flows (id, org_id, name, definition_json, published)
- flow_versions (id, flow_id, version, definition_json)
- flow_shares (id, flow_id, is_public, share_token)

Execution:
- runs (id, flow_id, triggered_by, status, started_at, completed_at)
- run_steps (id, run_id, step_id, status, output_json, duration_ms)
- run_artifacts (id, run_id, type, key_in_r2, metadata_json)

Marketplace:
- templates (id, flow_id, author_id, name, description, tags)
- template_stats (template_id, installs, stars, rating)

Billing:
- subscriptions (id, user_id, plan, status, renewal_date)
- usage (id, user_id, metric, value, period)

Integration:
- auth_profiles (id, user_id, name, cookies_encrypted, expires_at)
- webhooks (id, org_id, url, events)

Audit:
- audit_log (id, org_id, actor_id, action, resource, timestamp)
```

## Development Guidelines

### Code Design Standards
- **Max 200 lines per file** — enforced in pre-commit hook
- **Single Responsibility** — one component, one route, one step type per file
- **Type Safety** — TypeScript strict mode, Zod for all input validation
- **Error Handling** — structured errors with correlation IDs, typed Result patterns
- **Naming** — descriptive (e.g., `findElementByTestId` not `findElem`)
- **No Magic Values** — all constants in `packages/shared/src/constants.ts`
- **Dependency Injection** — pass config, clients, loggers as constructor params
- **Pure Functions** — side effects only at API/component boundaries

### Architecture Patterns
**Flow Execution Pipeline**:
```
POST /api/runs (trigger)
↓
Create Run record in D1
↓
Call Puppeteer at Cloudflare Browser Rendering
↓
For each step in flow:
  - Resolve element (locator chain: testid → aria → text → css → xpath)
  - Execute step action (click, type, screenshot, etc.)
  - Capture screenshot + overlay
  - Record step output + timing
  - Handle errors (retry, skip, abort)
↓
Emit run.completed event
↓
Post-process artifacts:
  - Compress screenshots to WebP
  - Generate video (MP4 with captions)
  - Generate SRT subtitle file
  - Upload to R2
↓
Response: { runId, status, artifacts, duration }
```

**Element Locator Chain** (fallback):
```
1. data-testid (most reliable)
2. aria-label (accessible fallback)
3. visible text content (user-facing)
4. CSS selector (fragile, last resort)
5. XPath (very fragile, emergency)
```

### Code Review Checklist
- [ ] No file exceeds 200 lines
- [ ] All functions have JSDoc with `@param`, `@returns`
- [ ] No `any` types; use typed params
- [ ] Zod schema validation on all API inputs
- [ ] Error messages include correlation ID
- [ ] No hardcoded URLs, secrets, or configuration
- [ ] Tests written (unit + integration)
- [ ] Dark mode supported (CSS variables)
- [ ] Touch targets ≥44px (mobile)
- [ ] Keyboard navigation on all interactive elements

## Testing Strategy

### Unit Tests — 95% Coverage
- **Framework**: Vitest (React) + Pytest (Python, if any)
- **Naming**: `describe('Click Step', () => { it('should find element by testid') })`
- **Structure**: Arrange → Act → Assert
- **Mocking**: Mock Puppeteer, R2, D1, Clerk
- **Run**: `npm run test`

### Integration Tests
- Test API endpoints with miniflare + D1 test database
- Test flow execution against demo-target app (headless chrome)
- Test screenshot comparison (visual regression)
- Test artifact upload to R2 (with test bucket)
- Test Clerk webhook payloads (subscription lifecycle)

### E2E/Browser Tests — Critical Flows
- **Tool**: Playwright + Claude Chrome MCP
- **Test these flows**:
  1. Signup (Clerk) → onboarding → create first flow → save
  2. Record: navigate → click element → type → screenshot → save flow
  3. Editor: drag click → set selector → test locator → view results
  4. Execute: trigger run → watch progress → view logs → download artifacts
  5. Export: generate GIF (first 5 steps, 3s loop) → download
  6. Video: generate MP4 with captions (SRT embedded) → download
  7. Markdown: auto-generate tutorial from steps + screenshots
  8. Marketplace: browse templates → install → customize → use in workflow
  9. Share: public flow URL → execute as anon user → view results
  10. Team: invite member → accept → view shared flows → read-only access
  11. Billing: free tier (10 runs/day) → upgrade Pro (1K/month) → verify gate
  12. Webhook: integrate with Slack → successful flow → notification posted
- **Personas**:
  - QA engineer (record tests, schedule runs, share with team)
  - Product manager (create demos, share via link, embed in docs)
  - No-code user (visual editor, templates, no code)
  - Developer (DSL, API, custom steps)
- **Run**: `npx playwright test` from repo root
- **Coverage**: All main flows, all personas, error scenarios, visual regression

### Test File Naming
- Unit: `src/executor-steps.test.ts`, `src/components/Editor.test.tsx`
- Integration: `src/services/browser.integration.test.ts`
- E2E: `e2e/flow-record.e2e.test.ts`, `e2e/team-share.e2e.test.ts`
- Browser: `e2e/visual-regression.browser.test.ts`

## Commands
```bash
# Development
npm install                     # Install all deps
npm run dev                     # Start all services

# API (Cloudflare Workers)
cd apps/api && npm run dev      # Wrangler dev server
cd apps/api && npm run deploy   # Deploy to production

# Web (Next.js)
cd apps/web && npm run dev      # Dev server (localhost:3000)
cd apps/web && npm run build    # Build for Cloudflare
npm run deploy:web              # Deploy to Cloudflare Pages

# Testing
npm run test                    # All unit tests
npm run test:watch              # Watch mode
npx playwright test             # E2E tests
npx playwright test --headed    # E2E with browser visible
npx playwright test --debug     # E2E with debugger

# Linting & Type-check
npm run lint                    # ESLint + Prettier
npm run typecheck               # TypeScript strict

# Build
npm run build                   # Build all packages
npm run package                 # Create npm packages

# Docker (local dev)
docker-compose up -d            # Start all services locally
docker-compose logs -f api      # Watch logs
curl http://localhost:8787/health # Test API

# Database
npm run db:generate             # Create migration
npm run db:migrate              # Apply migration
npx wrangler d1 shell prod-db   # Interactive SQL shell

# Deployment
npm run deploy:all              # Deploy API + Web to production
npm run deploy:api              # Deploy API only
npm run deploy:web              # Deploy Web only
```

## What's Done vs What's Left

**Done**:
- Core flow execution engine (click, type, wait, screenshot, etc.)
- Visual editor with Canvas + Inspector
- API (CRUD flows, runs, executions)
- Dashboard (flow list, recent runs, settings)
- Screenshot capture + compression
- Video export with captions (SRT)
- GIF export (first 5 steps)
- Markdown tutorial generation
- Public flow sharing (shareable URLs)
- Marketplace (template discovery, install, fork)
- Billing integration (LemonSqueezy)
- Team collaboration (invites, roles)
- Clerk authentication
- Webhook integrations

**Left** — **PRIORITIES**:
1. **Visual Regression Testing** (enterprise feature)
   - Compare screenshots against baseline
   - Detect UI changes automatically
   - Report diffs in run results

2. **Advanced Element Locators**
   - Image-based element finding (OCR)
   - Accessibility tree navigation
   - Semantic HTML targeting

3. **Skill Marketplace Launch**
   - Community skill submissions (custom steps)
   - Revenue sharing (70/30 creator/platform)
   - Discovery, ratings, versioning

4. **Chrome Extension** (viral growth)
   - Record from any webpage
   - Auto-detect repeated actions (suggest loop)
   - Direct share to Twitter/LinkedIn
   - Converts users → features

5. **Performance Optimization**
   - Sub-10s flow execution (target: <5s for 20 steps)
   - Screenshot compression (WebP, <100KB)
   - Video encoding (fast codec)
   - Database query optimization

## Key Infrastructure

| Resource | Technology | Purpose |
|---|---|---|
| API | Cloudflare Workers + Hono | REST API (40 routes) |
| Database | Cloudflare D1 (SQLite) | Flows, runs, artifacts, users |
| Storage | Cloudflare R2 | Screenshots, videos, exports |
| Cache | Cloudflare KV | API keys, rate limit counters, session data |
| Browser | Cloudflare Browser Rendering | Puppeteer execution (30s timeout) |
| Pages | Cloudflare Pages | Web frontend deployment |
| Auth | Clerk | User identity, JWT, webhooks |
| Payments | LemonSqueezy | Subscriptions, revenue sharing |
| Notifications | Email (Resend), Slack | Alerts, digests |
| Analytics | Cloudflare Analytics | Request metrics, performance |

## Competitors & Market Context
**Competitors**: Zapier, Make, RPA Tools (UIPath, Automation Anywhere)
**Differentiator**: Visual recording (no code) + GIF/video export + developer DSL
