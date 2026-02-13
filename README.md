# CodeRail Flow – Cloudflare-first Workflow Automation Platform

**🎉 Phase 1 Complete!** This repo is now a **fully functional** browser automation platform powered by Cloudflare.

**Features**:
- ✅ Cloudflare **Workers API** (Hono) + **D1** database + **R2** storage
- ✅ Cloudflare **Pages UI** (React + Vite)
- ✅ **Real browser automation** via Cloudflare Browser Rendering + Puppeteer
- ✅ **Visual overlays** (highlights & captions) during execution
- ✅ **Screenshot capture** for every step
- ✅ **SRT subtitle generation** from narrations
- ✅ **Element locator resolution** with fallback chain
- ✅ **Demo flow** ready to run: "Explain a Failed Card Transaction"

> **Status**: Phase 1 (Browser Automation Core) is **COMPLETE** and ready for testing.
> See [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) for full implementation details.

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
- `GET /flows` - List flows
- `POST /runs` - Execute flow (real browser automation!)
- `GET /runs` - List runs
- `GET /runs/:id` - Get run details
- `GET /artifacts/:id/download` - Download artifacts
- `POST /projects` - Create project
- `POST /screens` - Create screen mapping
- `POST /elements` - Create element locator

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

