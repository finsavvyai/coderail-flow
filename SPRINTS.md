# CoderailFlow — Sprint Plan

> **Read first:** `portfolio/QUALITY_STANDARDS.md`
> **Wave:** 1 · **Readiness:** 84% · **Stack:** TypeScript (Cloudflare Workers, Hono, React, Vite, Puppeteer, D1, R2, Clerk, LemonSqueezy)
> **Timeline:** 6 days · **Ship by:** Week 4

---

## Pre-Sprint: Migrate to @finsavvyai Shared Libraries

### Agent A: Migrate to @finsavvyai/cf-stack [PARALLEL]

**Prompt:**
CoderailFlow is built on Cloudflare Workers with custom patterns. Create `@finsavvyai/cf-stack` (npm): extract Hono routing, D1 migrations, R2 client setup, CORS middleware, rate limiting. Move from `/apps/api/src/` to module exports. Install package in CoderailFlow, replace manual Hono setup with: `import { createApp, D1Client, R2Bucket } from '@finsavvyai/cf-stack'`. Update `/apps/api/wrangler.toml` to use shared middleware. Migrate D1 migrations from `/apps/api/migrations/` to shared module. Test locally: `wrangler dev`, verify all endpoints respond. Run `vitest --coverage --fail-under=95`. Acceptance: @finsavvyai/cf-stack published to npm, CoderailFlow uses it, endpoints work locally + on staging.

### Agent B: Create 5-10 flow templates [PARALLEL]

**Prompt:**
CoderailFlow automation platform needs pre-built templates. Create `/apps/web/src/templates/` with 5-10 workflow JSON schemas: (1) "Send Email on GitHub PR" — trigger: PR opened, action: send email via SendGrid. (2) "Slack Notification on Deploy" — trigger: deployment.success, action: post to Slack. (3) "Auto-Rebase PR" — trigger: PR conflicts, action: git rebase. (4) "Archive Old Issues" — trigger: cron daily, action: mark issues inactive >90 days. (5) "Sync Docs to Notion" — trigger: repository.updated, action: push to Notion. Each template has icon, description, required fields, example config. Store templates in DB (D1 table: id, name, icon, description, schema). Expose via GET `/api/templates`. Test template creation (create new flow from template). Acceptance: 5-10 templates in DB, templates render in UI, users can create workflows from templates.

---

## Sprint Tasks

### Agent C: Landing page + docs [PARALLEL]

**Prompt:**
CoderailFlow needs production landing page. Create `/apps/web/pages/index.tsx` with: (1) Hero section (headline, subheadline, CTA "Start Automating"), (2) Features grid: 6 cards (easy setup, 100+ integrations, visual editor, secure, scalable, support), (3) How it works: 3-step diagram, (4) Pricing: free, pro, enterprise tiers with feature comparison table, (5) FAQ accordion, (6) CTA footer. Follow Apple HIG: SF Pro typography, 8pt grid, system colors (#007AFF primary), dark mode adaptive, ARIA labels on all buttons, focus states 2px outline, keyboard Tab navigation. Create `/docs/GETTING_STARTED.md`: installation, first workflow, SDK reference. Create `/docs/TEMPLATES.md`: list all 5-10 templates with examples. Acceptance: Landing page renders correctly, all Apple HIG guidelines met, docs are complete and clear.

### Agent D: Product Hunt prep + QA [SEQUENTIAL]

**Prompt:**
CoderailFlow targets Product Hunt launch Week 4. Prepare: (1) Product Hunt posting: headline (~60 chars), tagline, gallery (3-5 screenshots showing hero/templates/editor), description. (2) Media kit: `/marketing/media/` with logos, screenshots. (3) Maker profile: complete bio, Twitter handle, website. (4) Email outreach: draft launch day email to waitlist. (5) Run full QA: `vitest --coverage --fail-under=95` across all packages. (6) Security: `npm audit` zero high/critical. (7) Apple HIG final check: fonts, grid, colors, dark mode, ARIA, keyboard nav all pass. (8) Browser personas: guest sees landing page + sign-up CTA, free-tier user can create 1 template-based workflow, pro user unlimited workflows, admin sees analytics dashboard, expired user sees upgrade CTA. Acceptance: Product Hunt post ready, media assets complete, all QA gates pass, zero blockers.

---

## Quality Verification

### Agent QA: Full Quality Gate [SEQUENTIAL — after all above]

**Prompt:**
CoderailFlow final QA gate: (1) `vitest --coverage --fail-under=95` across `/apps/api` + `/apps/web` + `/packages/*` — show all coverage reports. (2) Max 200 lines: `find src -name '*.ts' -o -name '*.tsx' | xargs awk 'END{if(NR>200) print FILENAME": "NR" lines"}'`. (3) SOLID: auth service, workflow service, template factory all injected; no hardcoded DB clients. (4) Security: `npm audit` + `eslint-plugin-security` zero high/critical, no secrets in code. (5) Zod validation on: POST `/workflows` (template schema), POST `/execute` (input data). (6) Apple HIG: SF Pro fonts, 8pt grid, system colors (light/dark), ARIA labels 100%, focus states 2px blue, keyboard Tab/Enter/Space work throughout. (7) Browser personas: guest, free, pro, admin, expired — all work correctly. (8) Product Hunt materials ready (post, media, bio). Acceptance: All gates pass, Product Hunt launch ready.

---

## Quality Gate Checklist

□ 95%+ test coverage (`vitest --coverage --fail-under=95`)
□ ≤200 lines per source file
□ SOLID principles (services, DI, factory pattern for workflows)
□ Security scan clean (`npm audit` + `eslint-plugin-security` zero high/critical)
□ No secrets in code (env vars only)
□ Input validation (Zod on workflow + template schemas)
□ Apple HIG (SF Pro, 8pt grid, system colors, dark mode, ARIA, keyboard nav)
□ @finsavvyai/cf-stack integrated (Hono, D1, R2)
□ 5-10 flow templates created and tested
□ Landing page complete (hero, features, pricing, FAQ)
□ Product Hunt materials ready (post, media, outreach)
□ Browser test personas: guest, free, pro, admin, expired — all pass
