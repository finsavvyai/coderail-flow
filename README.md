# CodeRail Flow – Cloudflare-first Workflow Automation Platform

**🎉 Production Ready!** A fully functional browser automation platform powered by Cloudflare.

## Features

### Core Platform
- ✅ Cloudflare **Workers API** (Hono) + **D1** database + **R2** storage
- ✅ Cloudflare **Pages UI** (React + Vite)
- ✅ **Real browser automation** via Cloudflare Browser Rendering + Puppeteer
- ✅ **Visual overlays** (highlights & captions) during execution
- ✅ **Screenshot capture** for every step
- ✅ **SRT subtitle generation** from narrations
- ✅ **Element locator resolution** with fallback chain
- ✅ **Clerk authentication** with JWT verification
- ✅ **Lemon Squeezy billing** integration

### UI Features
- ✅ **Flow Builder** - Visual drag-and-drop flow creation
- ✅ **Element Mapper** - Click-to-select element picker with auto-locator generation
- ✅ **Project Manager** - Organize projects, screens, and elements
- ✅ **Cookie Manager** - Auth profiles for protected applications
- ✅ **Live Progress** - Real-time step-by-step execution updates
- ✅ **Screenshot Gallery** - View and download captured screenshots
- ✅ **Error Display** - Detailed error information with retry

### Step Types (14 total)
- **Basic**: goto, caption, click, fill, highlight, waitFor, pause
- **Advanced**: selectRow, assertText, screenshot, scroll, hover, select, setCookies

> **Documentation**: See [FEATURES.md](FEATURES.md) for complete feature docs and [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## Repo layout

```
coderail-flow/
├─ apps/
│  ├─ api/                 # Cloudflare Worker (Hono) + D1 + R2
│  │  ├─ src/
│  │  │  ├─ runner.ts      # 🆕 Real execution engine
│  │  │  └─ index.ts       # API routes
│  │  ├─ migrations/       # D1 SQL migrations
│  │  └─ wrangler.toml     # 🆕 Browser Rendering configured
│  └─ web/                 # Cloudflare Pages UI (React + Vite)
├─ packages/
│  ├─ dsl/                 # Flow DSL schema + validation (Zod)
│  ├─ overlay/             # Browser overlay library (built)
│  └─ runner/              # 🆕 Execution engine (Puppeteer)
│     └─ src/
│        ├─ executor.ts    # Main flow executor
│        ├─ locator.ts     # Element resolution
│        ├─ subtitle.ts    # SRT generation
│        └─ r2.ts          # R2 artifact upload
├─ pnpm-workspace.yaml     # 🆕 Workspace configuration
├─ PHASE1_COMPLETE.md      # 🆕 Implementation summary
└─ QUICKSTART.md           # 🆕 Quick start guide
```

## Quick Start

**See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.**

### Prerequisites
- Node.js 20+
- `npm i -g pnpm wrangler`
- Cloudflare account (free tier works)

### Install
```bash
pnpm install
cd packages/overlay && pnpm run build && cd ../..
```

### Setup Cloudflare Resources
```bash
wrangler login
wrangler d1 create coderail-flow-db
# Copy database_id to apps/api/wrangler.toml

cd apps/api
pnpm run migrate  # Apply migrations
cd ../..

wrangler r2 bucket create coderail-flow-artifacts  # Optional
```

### Run Locally
```bash
# Terminal 1: API
cd apps/api && pnpm run dev

# Terminal 2: Web UI
cd apps/web && pnpm run dev
```

Open **http://localhost:5173** and run the demo flow!

## Demo Flow

**"Explain a Failed Card Transaction"** (13 steps)
- Navigates through admin dashboard
- Searches for card ID
- Highlights error codes
- Shows explanatory captions
- Generates SRT subtitles
- Captures per-step screenshots

Migration `0004_demo_flow.sql` creates the full demo with screens, elements, and flow definition.

### API Endpoints
- `GET /health` - Liveness endpoint with readiness summary
- `GET /health/ready` - Readiness endpoint for load balancers / deploy checks
- `GET /flows` - List flows
- `POST /runs` - Execute flow (real browser automation!)
- `GET /runs` - List runs
- `GET /runs/:id` - Get run details
- `GET /artifacts/:id/download` - Download artifacts
- `POST /projects` - Create project
- `POST /screens` - Create screen mapping
- `POST /elements` - Create element locator

## Testing

### Unit & Integration Tests (Vitest)
```bash
# Run all unit tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Watch mode
pnpm test -- --watch
```

**What's covered** (171+ tests):
- API routes: `flows`, `runs`, `resources`, `analytics`
- Security: `pii-redaction`, `encryption`, `encryption-keys`

### E2E Tests (Playwright)

The web dev server is automatically started before tests run. The API server is **not** required — API health tests skip gracefully when the API is unreachable.

```bash
# Run all E2E tests (headless, starts web server automatically)
pnpm test:e2e

# Run with browser UI visible
pnpm test:e2e:headed

# Interactive Playwright UI
pnpm test:e2e:ui

# Open the HTML report from the last run
pnpm test:e2e:report
```

**E2E test files:**
| File | What it tests |
|------|--------------|
| `e2e/landing.spec.ts` | Landing page renders, CTA links, no JS errors |
| `e2e/app.spec.ts` | `/app` page — app content or Clerk sign-in gate |
| `e2e/auth.spec.ts` | Protected routes accessible, unknown routes |
| `e2e/projects.spec.ts` | `/projects` and `/billing` pages |
| `e2e/api-health.spec.ts` | Local API health + security headers (skipped if API not running) |
| `e2e/api-health-auth.spec.ts` | Production API health + performance (skipped if unreachable) |

**Auth-protected tests:** When `VITE_CLERK_PUBLISHABLE_KEY` is set, all tests accept either the real app content **or** Clerk's sign-in gate, making them resilient to unauthenticated state. Set `E2E_TEST_EMAIL` + `E2E_TEST_PASSWORD` to run authenticated flows.

### Run Everything
```bash
pnpm test:all
```

### Production Validation
```bash
pnpm run validate:production
```

---

## ✅ Phase 1 Complete

All core browser automation features are implemented:
- ✅ Puppeteer integration with Cloudflare Browser Rendering
- ✅ Locator resolution with fallback chain
- ✅ Visual overlay injection (highlights + captions)
- ✅ Per-step screenshot capture
- ✅ SRT subtitle generation
- ✅ R2 artifact upload pipeline
- ✅ All 7 step types: goto, caption, pause, fill, click, waitFor, highlight

**Total**: ~1,180 lines of production code replacing a 32-line stub.

## Next Steps (Phase 2+)

1. **Test End-to-End** - Run demo flow against real applications
2. **Mapping Mode** - Visual element picker UI
3. **Authentication** - Cookie import/export for protected apps
4. **Workflows** - Durable execution with Cloudflare Workflows
5. **Video Recording** - Full video capture (CDP screencast)
6. **Advanced Steps** - selectRow, assertText, screenshot
7. **Flow Builder UI** - Visual flow creation interface
8. **RBAC** - User management and access control

See [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) for detailed implementation notes.
