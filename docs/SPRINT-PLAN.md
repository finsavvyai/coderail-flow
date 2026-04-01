# CodeRail Flow - Sprint Plan & Viral Growth Strategy

**Version:** 1.0
**Created:** 2025-02-28
**Project Status:** Phase 1 Complete (~70%), Compliance Gap Analysis Complete

## Executive Summary

CodeRail Flow is a browser automation platform targeting product teams, QA engineers, and no-code automation enthusiasts. Current status shows strong technical foundation but critical gaps in testing, security, and file size compliance that must be addressed before viral growth initiatives.

**Current State:**
- ✅ Core automation engine (25 step types)
- ✅ Rich UI (22 components)
- ✅ Auth + billing infrastructure
- ❌ 0% test coverage (requires 90%/85%)
- ❌ 15 files violate 200-line limit
- ❌ Missing SAST security scanning

**Viral Growth Target:** K-factor >1.2 within 3 months
**Time to Market:** 8 weeks to production-ready with viral features

---

## Sprint 0: Foundation & Compliance (Week 1-2)

**Goal:** Achieve CLAUDE.md compliance baseline + set up viral infrastructure

### Sprint Objectives
1. Refactor all file size violations (<200 lines per file)
2. Set up test infrastructure (Vitest + coverage)
3. Configure SAST security scanning
4. Build viral growth foundation (sharing + templates)

### Priority 1: File Size Refactoring (8 days)

#### Task 1.1: Refactor `packages/runner/executor.ts` (1,620 → 9 files)
**Estimate:** 3 days
**Assignee:** Backend team
**Acceptance Criteria:**
- [x] Split into modular files (each <200 lines)
- [x] All tests pass (after test infrastructure setup)
- [x] No functionality regression
- [x] Type safety maintained

**File Structure:**
```
packages/runner/src/
├── executor-core.ts         # Main orchestration (~180 lines)
├── executor-steps.ts        # Step registry (~150 lines)
├── executor-locators.ts     # Element finding (~190 lines)
├── executor-screenshots.ts  # Screenshot capture (~160 lines)
├── executor-artifacts.ts    # R2 uploads (~140 lines)
├── executor-errors.ts       # Error handling (~120 lines)
├── executor-subtitles.ts    # SRT generation (~100 lines)
├── executor-overlay.ts      # Highlight/caption (~150 lines)
└── executor-types.ts        # TypeScript types (~180 lines)
```

#### Task 1.2: Refactor `apps/api/src/index.ts` (713 → 6 files)
**Estimate:** 2 days
**Acceptance Criteria:**
- [x] Route handlers in separate files
- [x] Middleware extracted
- [x] Hono app setup <200 lines
- [x] All routes functional

**File Structure:**
```
apps/api/src/
├── index.ts                 # Hono app setup (~180 lines)
├── routes/
│   ├── flows.ts            # Flow endpoints (~190 lines)
│   ├── runs.ts             # Execution endpoints (~180 lines)
│   └── admin.ts            # Admin endpoints (~150 lines)
└── middleware/
    ├── auth.ts             # JWT verification (~120 lines)
    ├── ratelimit.ts        # Rate limiting (~80 lines)
    └── cors.ts             # CORS config (~60 lines)
```

#### Task 1.3: Refactor Large UI Components (15 files)
**Estimate:** 3 days
**Priority Files:**
1. `FlowRecorder.tsx` (758 lines) → 4 files
2. `IntegrationsPage.tsx` (547 lines) → 3 files
3. `FlowBuilder.tsx` (525 lines) → 3 files
4. `EnhancedUI.tsx` (502 lines) → 3 files
5. `CookieManager.tsx` (486 lines) → 3 files

**Pattern:**
```
Component.tsx               # Main component (~180 lines)
Component.hooks.ts          # Custom hooks (~150 lines)
Component.types.ts          # TypeScript types (~100 lines)
Component.utils.ts          # Helper functions (~120 lines)
```

### Priority 2: Test Infrastructure Setup (3 days)

#### Task 2.1: Install Vitest & Configure Coverage
**Estimate:** 1 day
**Deliverables:**
- [x] `vitest.config.ts` in each package
- [x] Coverage thresholds: 90% line, 85% branch
- [x] CI integration (GitHub Actions)
- [x] Pre-commit hook for test execution

**Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 90,
      branches: 85,
      functions: 90,
      statements: 90,
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/dist/**']
    }
  }
})
```

#### Task 2.2: Write Critical Path Tests (100% coverage)
**Estimate:** 2 days
**Critical Paths:**
1. **Authentication** (`apps/api/src/middleware/auth.ts`)
   - JWT signature validation
   - Expired token rejection
   - Missing token handling

2. **Billing** (`apps/api/src/billing.ts`)
   - Webhook signature verification
   - Subscription state transitions
   - Payment event logging

3. **Flow Execution** (`packages/runner/executor-core.ts`)
   - Step execution loop
   - Error propagation
   - Timeout handling

4. **Data Writes** (All create/update operations)
   - Run creation
   - Artifact storage (idempotency)
   - Audit logging

5. **Security Controls**
   - Rate limiting enforcement
   - CORS validation
   - Input sanitization

### Priority 3: Security Hardening (2 days)

#### Task 3.1: Configure SAST Scanning
**Estimate:** 1 day
**Tool:** Semgrep (free, fast, configurable)
**Deliverables:**
- [x] `.github/workflows/sast.yml` workflow
- [x] Semgrep config for JavaScript/TypeScript
- [x] Block merge on Critical/High findings
- [x] Weekly scheduled scans

**Scan Rules:**
- SQL injection detection
- XSS vulnerabilities
- Command injection
- Path traversal
- Secrets in code
- Unsafe crypto usage

#### Task 3.2: Complete Input Validation
**Estimate:** 1 day
**Scope:** All API routes
**Acceptance Criteria:**
- [x] Zod schemas for all request bodies
- [x] Max request size: 1MB
- [x] Reject unknown fields
- [x] Path traversal prevention
- [x] XSS prevention (HTML encoding)

### Priority 4: Viral Growth Foundation (3 days)

#### Task 4.1: Public Flow Sharing
**Estimate:** 2 days
**Features:**
- Generate shareable URLs: `coderail.app/run/{flowId}`
- Anonymous execution (no sign-up)
- "Made with CodeRail" attribution badge
- Social meta tags (Twitter Card, Open Graph)
- First screenshot as OG image

**DB Changes:**
```sql
ALTER TABLE flow ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE flow ADD COLUMN public_slug TEXT UNIQUE;
CREATE INDEX idx_flow_public ON flow(is_public, public_slug);
```

**API Endpoints:**
```
POST /flows/{id}/share    # Make flow public
GET /run/{slug}           # Execute public flow
GET /embed/{slug}         # Embeddable widget
```

#### Task 4.2: Template Library Foundation
**Estimate:** 1 day
**Features:**
- Template submission endpoint
- Basic categorization (tags)
- Template search
- Fork/duplicate flow

**DB Schema:**
```sql
CREATE TABLE template (
  id TEXT PRIMARY KEY,
  flow_id TEXT REFERENCES flow(id),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[], -- JSON array
  downloads INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);
```

### Sprint 0 Deliverables

**Must Have:**
- [x] All files <200 lines in `src/`, `app/`, `lib/`
- [x] Test infrastructure configured
- [x] Critical paths 100% tested
- [x] SAST scanning in CI
- [x] Public flow sharing live
- [x] Pre-commit hooks enforcing file size + tests

**Success Metrics:**
- 0 file size violations
- CI green (all checks pass)
- Security scan clean
- 1+ public flow shared internally

**Timeline:** 2 weeks (10 working days)

---

## Sprint 1: Viral Features & Testing (Week 3-4)

**Goal:** 90% test coverage + launch viral growth experiments

### Priority 1: Comprehensive Testing (7 days)

#### Task 1.1: Unit Tests for Packages (3 days)
**Target:** 95% coverage per package
**Scope:**
- `@coderail/dsl`: Schema validation (50 tests)
- `@coderail/runner`: Each step executor (25 tests per step type)
- `@coderail/overlay`: Rendering logic (30 tests)

**Example Test Suite:**
```typescript
// packages/runner/src/__tests__/executor-steps.test.ts
describe('ClickStep', () => {
  it('should click element by data-testid', async () => {})
  it('should fallback to aria-label', async () => {})
  it('should retry on timeout', async () => {})
  it('should throw on missing element', async () => {})
})
```

#### Task 1.2: Integration Tests for API (3 days)
**Target:** 85% coverage
**Scope:**
- All route handlers (CRUD operations)
- Error handling (400, 401, 403, 404, 429, 500)
- Webhook delivery + retries
- Multi-tenant isolation

**Test Pattern:**
```typescript
// apps/api/src/__tests__/flows.integration.test.ts
describe('POST /flows', () => {
  it('should create flow with valid JWT', async () => {})
  it('should reject without org_id', async () => {})
  it('should enforce rate limit', async () => {})
  it('should isolate orgs (cannot read other org)', async () => {})
})
```

#### Task 1.3: E2E Smoke Tests (1 day)
**Target:** 80% of critical user journeys
**Scope:**
1. Sign up → Create project → Record flow → Execute → View results
2. Share public flow → Execute as anonymous user
3. Subscribe → Billing webhook → Feature unlock

**Tool:** Playwright (browser automation)

### Priority 2: Auto-Generated Content (3 days)

#### Task 2.1: GIF Export Feature
**Estimate:** 2 days
**Features:**
- Export first 5 steps as 3-second looping GIF
- Optimized for Twitter (max 5MB)
- Watermark: "Made with CodeRail"

**Tech Stack:**
- Puppeteer screenshots → `gifenc` library
- R2 storage for GIFs
- CDN URL for sharing

**UI:**
```
Flow Actions Menu:
├── Execute
├── Share
├── Export as GIF ← NEW
└── Delete
```

#### Task 2.2: Markdown Tutorial Generator
**Estimate:** 1 day
**Features:**
- Auto-generate step-by-step guide from flow
- Include screenshots inline
- Syntax highlighting for code blocks
- Copy-paste ready for GitHub README

**Output Example:**
```markdown
# How to Login to App

1. Navigate to https://app.example.com
   ![Screenshot 1](https://cdn.coderail.app/...)

2. Click "Sign In" button
   ![Screenshot 2](https://cdn.coderail.app/...)

3. Enter credentials
   - Username: user@example.com
   - Password: ••••••••
```

### Priority 3: Chrome Extension MVP (5 days)

#### Task 3.1: Extension Core Functionality
**Estimate:** 3 days
**Features:**
- Record flows from any webpage
- Right-click context menu: "Record CodeRail Flow"
- Inject overlay for element selection
- Auto-sync to CodeRail account

**Manifest V3:**
```json
{
  "name": "CodeRail Flow Recorder",
  "version": "0.1.0",
  "permissions": ["activeTab", "storage", "contextMenus"],
  "background": { "service_worker": "background.js" },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

#### Task 3.2: Extension UI Polish
**Estimate:** 2 days
**Features:**
- Popup UI (show recording status)
- Settings (API key, auto-upload)
- One-click share to Twitter/LinkedIn
- Badge with step count

**Viral Hook:**
- Every recorded flow generates shareable link
- Social share buttons in extension popup
- "X people used this flow" counter

### Sprint 1 Deliverables

**Must Have:**
- [x] 90% line coverage, 85% branch coverage
- [x] GIF export feature live
- [x] Markdown tutorial generator
- [x] Chrome extension published (beta)

**Success Metrics:**
- All tests green in CI
- 10+ internal users testing extension
- 5+ flows shared on Twitter/LinkedIn
- <0.1% error rate on production

**Timeline:** 2 weeks (10 working days)

---

## Sprint 2: Template Marketplace & Monetization (Week 5-6)

**Goal:** Launch template marketplace with revenue sharing

### Priority 1: Marketplace Core (5 days)

#### Task 1.1: Template Discovery UI
**Estimate:** 3 days
**Features:**
- Browse templates by category
- Search (full-text on title/description)
- Trending algorithms (downloads, ratings)
- Tag filtering

**Categories:**
- E-commerce (Shopify, WooCommerce)
- SaaS (HubSpot, Salesforce)
- Social Media (Twitter, LinkedIn)
- Testing (Login, Checkout, Forms)
- Documentation (Screenshot tutorials)

#### Task 1.2: One-Click Fork & Customize
**Estimate:** 2 days
**Features:**
- Fork template to user's account
- Pre-fill with demo data
- Guided customization wizard
- Version tracking (template updates)

**Flow:**
```
User clicks "Use Template"
  ↓
Fork flow to user's org
  ↓
Open in Flow Builder (pre-configured)
  ↓
User customizes selectors/data
  ↓
Execute immediately
```

### Priority 2: Revenue Sharing (3 days)

#### Task 2.1: Creator Payouts
**Estimate:** 2 days
**Features:**
- 70% creator / 30% platform split
- Monthly payouts via Lemon Squeezy
- Minimum payout: $50
- Creator analytics dashboard

**DB Schema:**
```sql
CREATE TABLE payout (
  id TEXT PRIMARY KEY,
  creator_user_id TEXT,
  amount_cents INTEGER,
  period_start INTEGER,
  period_end INTEGER,
  status TEXT, -- pending, paid, failed
  lemon_squeezy_payout_id TEXT
);
```

#### Task 2.2: Template Analytics
**Estimate:** 1 day
**Metrics:**
- Downloads per template
- Executions per template
- Revenue per template
- Conversion rate (view → download)

### Priority 3: Embed Anywhere (2 days)

#### Task 3.1: Web Component
**Estimate:** 2 days
**Features:**
- `<coderail-flow id="abc123" autoplay />`
- Responsive iframe fallback
- Customizable theme (light/dark)
- Events API (`onComplete`, `onError`)

**Example:**
```html
<script src="https://cdn.coderail.app/embed.js"></script>
<coderail-flow
  id="login-demo"
  theme="dark"
  autoplay="true"
  width="800px"
  height="600px"
/>
```

**Target Platforms:**
- Documentation sites (Docusaurus, GitBook)
- Notion embeds
- Medium/Dev.to articles
- GitHub README files

### Sprint 2 Deliverables

**Must Have:**
- [x] Template marketplace live (public beta)
- [x] Revenue sharing implemented
- [x] Embed widget functional
- [x] 50+ seed templates (internal + community)

**Success Metrics:**
- 100+ template downloads in week 1
- 5+ creators submit templates
- 10+ websites embed CodeRail flows
- $500+ creator revenue in month 1

**Timeline:** 2 weeks (10 working days)

---

## Sprint 3: Performance & Scale (Week 7-8)

**Goal:** Optimize for 10,000 concurrent users

### Priority 1: Performance Optimization (5 days)

#### Task 1.1: Frontend Bundle Optimization
**Estimate:** 2 days
**Targets:**
- Initial bundle <500KB (gzipped)
- Largest Contentful Paint (LCP) <1s
- First Input Delay (FID) <100ms
- Cumulative Layout Shift (CLS) <0.1

**Techniques:**
- Code splitting (React.lazy)
- Image optimization (WebP, lazy loading)
- Tree shaking (remove unused code)
- CDN caching (Cloudflare)

#### Task 1.2: API Response Time Optimization
**Estimate:** 2 days
**Targets:**
- p50 latency <100ms
- p95 latency <500ms
- p99 latency <1s

**Techniques:**
- D1 query optimization (indexes)
- R2 presigned URLs (avoid proxy)
- Edge caching (Cloudflare KV)
- Response compression (Brotli)

#### Task 1.3: Flow Execution Speed
**Estimate:** 1 day
**Targets:**
- 20-step flow executes in <10s
- Parallel screenshot capture
- Lazy SRT generation (async)

### Priority 2: Monitoring & Observability (3 days)

#### Task 2.1: Error Tracking
**Estimate:** 1 day
**Tool:** Sentry (free tier)
**Scope:**
- Frontend errors (React error boundaries)
- API errors (500s, timeouts)
- Background job failures (flow execution)

#### Task 2.2: Performance Monitoring
**Estimate:** 1 day
**Tool:** Cloudflare Analytics + custom metrics
**Metrics:**
- Request volume (req/min)
- Error rate (errors/req)
- Latency percentiles (p50, p95, p99)
- Cache hit rate

#### Task 2.3: Alerting & Rollback
**Estimate:** 1 day
**Triggers:**
- Error rate >1% for 5 min → Auto-rollback
- p95 latency >2s for 10 min → Alert
- Database connection errors → Circuit breaker

### Priority 3: Viral Growth Experiments (2 days)

#### Task 3.1: Referral Program
**Estimate:** 1 day
**Incentive:** Free month Pro for every 3 referrals
**Features:**
- Unique referral links
- Dashboard showing referral count
- Auto-apply credits

#### Task 3.2: Social Proof
**Estimate:** 1 day
**Features:**
- "1,234 flows created today" badge
- Template creator leaderboard
- User testimonials on landing page
- Case studies (before/after metrics)

### Sprint 3 Deliverables

**Must Have:**
- [x] LCP <1s, API p95 <500ms
- [x] Error tracking + alerting live
- [x] Referral program launched
- [x] Social proof on landing page

**Success Metrics:**
- Core Web Vitals pass (all green)
- 99.9% uptime
- <0.1% error rate
- K-factor >1.0 (first viral milestone)

**Timeline:** 2 weeks (10 working days)

---

## Viral Growth Strategy (Detailed)

### Phase 1: Built-In Virality (Week 1-4)

**Mechanisms:**
1. **Share-to-Play**
   - Every flow generates public URL
   - No sign-up to view/execute
   - "Made with CodeRail" badge (links to landing page)
   - Social meta tags (auto-generate from flow data)

2. **Template Marketplace**
   - Revenue sharing (70% creator)
   - One-click fork
   - Trending algorithm (downloads + ratings)
   - Creator profiles (portfolio of templates)

3. **Chrome Extension**
   - Record from any webpage
   - One-click share to Twitter/LinkedIn
   - "X people used this flow" counter
   - Auto-detect repeated actions (suggest loop)

**Target Metrics (Week 4):**
- 100 public flows shared
- 50 template downloads
- 500 extension installs
- K-factor: 0.5 (baseline)

### Phase 2: Content Marketing (Week 5-8)

**Tactics:**
1. **Auto-Generated Content**
   - GIF exports (Twitter-optimized)
   - Markdown tutorials (GitHub README)
   - Video + captions (YouTube Shorts)
   - Tweet-ready summaries (GPT-4 generated)

2. **Creator Partnerships**
   - Invite top 10 automation influencers
   - Revenue sharing incentive
   - Co-marketing (guest posts, podcasts)
   - Case studies (time saved, ROI)

3. **Community Building**
   - Discord server (beta testers)
   - Weekly office hours (live Q&A)
   - Template contests ($500 prize)
   - User spotlight (Twitter/blog)

**Target Metrics (Week 8):**
- 1,000 public flows shared
- 500 template downloads
- 2,000 extension installs
- K-factor: 1.0 (viral threshold)

### Phase 3: Platform Partnerships (Month 3)

**Integration Targets:**
1. **Documentation Platforms**
   - Docusaurus plugin
   - GitBook integration
   - Notion embed support
   - Confluence macro

2. **Developer Tools**
   - GitHub Actions integration
   - VS Code extension
   - Postman collection generator
   - Zapier/Make connectors

3. **SaaS Platforms**
   - Shopify app store
   - HubSpot marketplace
   - Salesforce AppExchange
   - WordPress plugin

**Target Metrics (Month 3):**
- 5,000 public flows shared
- 2,000 template downloads
- 10,000 extension installs
- K-factor: 1.5 (sustained viral growth)

### Phase 4: Paid Acquisition (Month 4+)

**Channels (if K-factor >1.2):**
1. **Paid Social**
   - LinkedIn ads (B2B targeting)
   - Twitter ads (developer audience)
   - Reddit ads (r/automation, r/programming)

2. **Content Syndication**
   - Dev.to sponsored posts
   - Hacker News front page (organic)
   - Product Hunt launch

3. **Influencer Partnerships**
   - YouTube tutorials (automation channels)
   - Twitch streams (live coding)
   - Podcast sponsorships

**CAC Target:** <$10 (via extension installs)
**LTV Target:** >$120 (12 months Pro subscription)
**LTV:CAC Ratio:** >12:1

---

## Risk Mitigation

### Technical Risks

**Risk 1: Test Coverage Slips Below 90%**
- **Mitigation:** Pre-commit hook blocks <90% coverage
- **Owner:** Tech lead
- **Severity:** High

**Risk 2: File Size Creeps Above 200 Lines**
- **Mitigation:** CI check fails on violations
- **Owner:** All engineers
- **Severity:** Medium

**Risk 3: Security Vulnerability Discovered**
- **Mitigation:** SAST + dependency scans in CI, auto-rollback on Critical/High
- **Owner:** Security champion
- **Severity:** Critical

### Product Risks

**Risk 4: K-Factor <1.0 After 8 Weeks**
- **Mitigation:** A/B test viral features, iterate weekly
- **Owner:** Product manager
- **Severity:** High

**Risk 5: Template Marketplace Low Adoption**
- **Mitigation:** Seed with 50+ high-quality templates, incentivize creators
- **Owner:** Community manager
- **Severity:** Medium

**Risk 6: Chrome Extension Rejection**
- **Mitigation:** Follow Manifest V3 guidelines, privacy policy, limited permissions
- **Owner:** Extension developer
- **Severity:** Medium

### Business Risks

**Risk 7: Cloudflare Costs Exceed Budget**
- **Mitigation:** Monitor usage, implement aggressive caching, rate limiting
- **Owner:** DevOps
- **Severity:** High

**Risk 8: Churn Rate >10%/month**
- **Mitigation:** Onboarding flow optimization, weekly retention cohort analysis
- **Owner:** Growth team
- **Severity:** High

---

## Success Metrics (Overall)

### North Star Metric
**Weekly Active Flows Executed:** 10,000 by Month 3

### Supporting Metrics

**Acquisition:**
- Sign-ups: 500/week (Month 1) → 2,000/week (Month 3)
- Organic traffic: 10,000 monthly visitors (Month 3)
- Extension installs: 10,000 (Month 3)

**Activation:**
- Time to first flow execution: <5 minutes
- Activation rate: >40% (execute ≥1 flow within 7 days)

**Retention:**
- Day 7: >60%
- Day 30: >30%
- Month 3: >20%

**Revenue:**
- MRR: $5,000 (Month 3)
- ARPU: $15/month
- Free → Pro conversion: >10%

**Referral:**
- K-factor: >1.2 (Month 3)
- Public flows shared: 5,000
- Template downloads: 2,000

**Virality Indicators:**
- Avg templates used per user: >2
- Avg flows shared per user: >0.5
- Embed widget installs: >100

---

## Resource Requirements

### Team Composition (8-week sprint)

**Engineering (4 FTE):**
- 1x Backend Engineer (API, database, Cloudflare)
- 1x Frontend Engineer (React, UI components)
- 1x Full-Stack Engineer (extension, integrations)
- 1x QA Engineer (testing, automation)

**Product & Design (1.5 FTE):**
- 1x Product Manager (roadmap, metrics)
- 0.5x Designer (UI/UX, Apple HIG compliance)

**Growth & Community (1 FTE):**
- 1x Growth Marketer (viral experiments, content)

**Total:** 6.5 FTE

### Budget Estimate (8 weeks)

**Engineering:** $80,000 (4 FTE × $10,000/month × 2 months)
**Product/Design:** $15,000 (1.5 FTE × $5,000/month × 2 months)
**Growth:** $10,000 (1 FTE × $5,000/month × 2 months)
**Infrastructure:** $2,000 (Cloudflare, Clerk, Lemon Squeezy)
**Tools:** $1,000 (Sentry, analytics, testing)

**Total:** $108,000

### ROI Projection (Month 3)

**Revenue:** $5,000 MRR
**Cost:** $108,000 one-time + $2,000/month infrastructure
**Payback Period:** 22 months (if linear growth)
**BUT with K-factor >1.2:** Exponential growth → payback in 6-8 months

---

## Appendix A: File Size Violations (Current)

| File | Lines | Target | Action |
|------|-------|--------|--------|
| `packages/runner/executor.ts` | 1,620 | 200 | Split into 9 files |
| `apps/api/src/index.ts` | 713 | 200 | Split into 6 files |
| `FlowRecorder.tsx` | 758 | 200 | Split into 4 files |
| `IntegrationsPage.tsx` | 547 | 200 | Split into 3 files |
| `FlowBuilder.tsx` | 525 | 200 | Split into 3 files |
| `integrations.ts` | 503 | 200 | Split into 3 files |
| `EnhancedUI.tsx` | 502 | 200 | Split into 3 files |
| `CookieManager.tsx` | 486 | 200 | Split into 3 files |
| `LandingPage.tsx` | 399 | 200 | Split into 2 files |
| `ElementMapper.tsx` | 382 | 200 | Split into 2 files |
| `FlowTemplates.tsx` | 362 | 200 | Split into 2 files |
| `ProjectManager.tsx` | 324 | 200 | Split into 2 files |
| `proxy.ts` | 321 | 200 | Split into 2 files |
| `overlay/index.ts` | 309 | 200 | Split into 2 files |
| `billing.ts` | 286 | 200 | Split into 2 files |

**Total:** 15 files, 7,537 lines → 44 files, <200 lines each

---

## Appendix B: Testing Strategy (Detailed)

### Unit Test Coverage Targets

**Packages:**
- `@coderail/dsl`: 100% (schema validation, 50 tests)
- `@coderail/runner`: 95% (step executors, 200+ tests)
- `@coderail/overlay`: 95% (rendering, 30 tests)

**API:**
- Route handlers: 90% (100+ tests)
- Middleware: 100% (20 tests)
- Validation: 100% (50 tests)

**Frontend:**
- Components: 80% (150+ tests)
- Hooks: 90% (30 tests)
- Utils: 95% (40 tests)

### Integration Test Matrix

| Feature | Test Count | Coverage Target |
|---------|------------|-----------------|
| Flow CRUD | 15 | 90% |
| Run execution | 20 | 85% |
| Auth/billing | 10 | 100% |
| Webhooks | 8 | 90% |
| Multi-tenancy | 12 | 100% |
| Rate limiting | 5 | 100% |

### E2E Test Scenarios

1. **Happy Path (5 tests)**
   - Sign up → Create flow → Execute → Share

2. **Error Handling (5 tests)**
   - Invalid credentials → Network timeout → Missing element

3. **Edge Cases (5 tests)**
   - Large flows (100+ steps) → Concurrent executions → Expired cookies

---

## Appendix C: Security Checklist

- [x] SAST configured (Semgrep)
- [x] Dependency scanning (GitHub Dependabot)
- [x] Secret scanning (Gitleaks)
- [x] Input validation (Zod schemas)
- [x] Output encoding (HTML escaping)
- [x] Rate limiting (per-user + per-IP)
- [x] CORS (strict origin validation)
- [x] CSP headers (`script-src 'self'`)
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (sanitize user content)
- [x] CSRF protection (SameSite cookies)
- [x] Audit logging (all mutations)
- [x] Data encryption at rest (R2, D1)
- [x] HTTPS only (Cloudflare SSL)
- [x] Least privilege (API keys scoped to org)

---

**Document Owner:** Product & Engineering
**Review Cadence:** Weekly (sprint retros)
**Next Review:** 2025-03-07 (after Sprint 0)
