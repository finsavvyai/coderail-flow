# CodeRail Flow - Requirements Document

**Project**: CodeRail Flow
**Version**: 1.0.0
**Last Updated**: 2026-03-02
**Status**: Active Development (Phase 1 Complete)

---

## Executive Summary

CodeRail Flow is a browser automation platform that makes workflow creation as simple as screen recording. It enables product teams, QA engineers, and customer success teams to create, share, and monetize automated workflows without writing code.

### Product Vision
Make browser automation as simple as screen recording. Enable anyone to create, share, and monetize automated workflows while providing developers a powerful DSL for complex automation.

### Target Users
1. **Primary**: Product teams, QA engineers, customer success teams
2. **Secondary**: No-code automation enthusiasts, tutorial creators, SaaS founders
3. **Tertiary**: Enterprise IT teams needing workflow documentation

### Core Value Proposition
- **Record Once, Replay Anywhere**: Turn manual clicks into reusable automated workflows
- **Generate Documentation Automatically**: Create step-by-step guides with screenshots and subtitles
- **Test Continuously**: Automate regression testing for web applications
- **Onboard Faster**: Share interactive demos with embedded automation
- **Monetize Workflows**: Package and sell automation templates to communities

---

## 1. Functional Requirements

### 1.1 Flow Recording & Execution

#### FR-1.1: Visual Flow Builder
**Priority**: P0 (Must Have)

**Description**: Users must be able to create workflows visually without writing code.

**Acceptance Criteria**:
- [x] Drag-and-drop interface for adding steps to workflows
- [x] Support for 14+ step types (see FR-1.2)
- [x] Visual step reordering (move up/down)
- [x] Step editing and deletion
- [x] Flow validation before saving
- [x] Parameter definition with types (string, number, boolean, json)
- [x] Auto-save functionality for draft flows
- [x] Flow versioning with immutable historical versions

**User Story**: As a PM, I want to visually build workflows by dragging and dropping steps, so I can create automation without writing code.

**Technical Constraints**:
- Maximum file size: 200 lines per component
- Use React + TypeScript
- Zod schema validation for all step types

---

#### FR-1.2: Step Types
**Priority**: P0 (Must Have)

**Description**: System must support comprehensive step types for browser automation.

**Basic Steps (P0)**:
- [x] **goto**: Navigate to URL or screen reference
- [x] **caption**: Show text overlay (top/center/bottom)
- [x] **click**: Click element with optional narration
- [x] **fill**: Type into input field
- [x] **highlight**: Highlight element (box/pulse style)
- [x] **waitFor**: Wait for element state (visible/attached/hidden)
- [x] **pause**: Wait for specified duration (ms)

**Advanced Steps (P0)**:
- [x] **selectRow**: Select table row by matching text
- [x] **assertText**: Verify text exists on page
- [x] **screenshot**: Take labeled screenshot
- [x] **scroll**: Scroll page or element (up/down/top/bottom)
- [x] **hover**: Hover over element
- [x] **select**: Select dropdown option
- [x] **setCookies**: Set authentication cookies

**Enhanced Steps (P1)**:
- [x] **keyboard**: Send keyboard input
- [x] **fileUpload**: Upload file to input
- [x] **dragDrop**: Drag element to target
- [x] **rightClick**: Right-click element
- [x] **doubleClick**: Double-click element
- [x] **iframe**: Execute steps within iframe
- [x] **waitForNavigation**: Wait for page navigation
- [x] **waitForNetwork**: Wait for network request
- [x] **executeScript**: Execute custom JavaScript
- [x] **assertUrl**: Assert URL pattern matches
- [x] **assertElement**: Assert element state
- [x] **clearInput**: Clear input field
- [x] **focus**: Focus element
- [x] **blur**: Blur element
- [x] **setViewport**: Set viewport dimensions
- [x] **emulateDevice**: Emulate mobile device
- [x] **pdf**: Generate PDF
- [x] **loop**: Repeat steps N times
- [x] **conditional**: Conditional logic (if/else)
- [x] **extractData**: Extract data to variable
- [x] **setVariable**: Set variable value

**Acceptance Criteria**:
- [x] All steps support optional narration text
- [x] All steps validate required parameters
- [x] Step definitions follow Zod schema
- [x] Each step has clear documentation and examples

---

#### FR-1.3: Flow Execution Engine
**Priority**: P0 (Must Have)

**Description**: Execute flows using real browser automation with Cloudflare Browser Rendering + Puppeteer.

**Acceptance Criteria**:
- [x] Execute steps sequentially with error handling
- [x] Support parameter substitution ({{paramName}})
- [x] Generate per-step screenshots
- [x] Inject visual overlays (highlights + captions)
- [x] Generate SRT subtitles from narration
- [x] Capture video (WebM/MP4)
- [x] Handle element locator fallback chain
- [x] Support timeout configuration per step
- [x] Provide real-time progress updates
- [x] Capture detailed error context on failure

**Technical Constraints**:
- Cloudflare Browser Rendering API
- Puppeteer for browser control
- Maximum execution time: 30s (Cloudflare limit)
- Maximum video size: 100MB

**Performance Requirements**:
- Flow execution <10s for 20-step workflow
- Step execution <2s per step (excluding waits)
- Screenshot capture <500ms

---

#### FR-1.4: Element Mapping
**Priority**: P0 (Must Have)

**Description**: Visual element picker for creating element locators without DOM knowledge.

**Acceptance Criteria**:
- [x] Inspect mode: hover highlights elements
- [x] Click element to capture locators
- [x] Generate multiple locator strategies (testid, aria-label, CSS, XPath)
- [x] Display reliability score for each locator
- [x] Allow element naming and screen assignment
- [x] Save primary + fallback locators
- [x] Support element remapping without breaking historical runs

**Locator Priority Order**:
1. **data-testid** (reliability: 1.0) - Preferred
2. **ARIA role + label** (reliability: 0.8)
3. **CSS selector** (reliability: 0.4)
4. **XPath** (reliability: 0.2) - Last resort

**User Story**: As a PM, I want to click on elements to map them, so I can build workflows without understanding CSS selectors or XPath.

---

#### FR-1.5: Artifact Generation
**Priority**: P0 (Must Have)

**Description**: Generate comprehensive artifacts for each flow execution.

**Artifact Types**:
- [x] **Screenshots** (PNG): One per step with labels
- [x] **SRT Subtitles**: Timed narration text for video
- [x] **JSON Report**: Detailed execution log with timings
- [x] **Video** (WebM/MP4): Full execution recording
- [ ] **Audio** (MP3): Text-to-speech narration (P1)

**Acceptance Criteria**:
- [x] Screenshots captured before/after each step
- [x] SRT timeline synchronized with video
- [x] JSON report includes step timings, errors, metadata
- [x] Artifacts stored in Cloudflare R2
- [x] Signed URLs for secure artifact access
- [x] Artifact retention based on plan (Free: 7d, Pro: 90d, Enterprise: 1y)

**Storage Structure**:
```
org/{orgId}/project/{projectId}/run/{runId}/
├── video.webm
├── subtitles.srt
├── report.json
├── step-001.png
├── step-002.png
└── ...
```

---

### 1.2 User Authentication & Authorization

#### FR-2.1: Authentication
**Priority**: P0 (Must Have)

**Description**: Secure authentication using Clerk JWT.

**Acceptance Criteria**:
- [x] Clerk integration for user authentication
- [x] JWT verification (RS256) via JWKS
- [x] Session management (1h access token, 30d refresh)
- [x] Protected routes require valid JWT
- [x] Logout functionality
- [x] Password reset flow (via Clerk)

**Technical Constraints**:
- Clerk JWT validation
- RS256 signature verification
- JWKS endpoint caching
- Session storage: HttpOnly cookies

---

#### FR-2.2: Multi-Tenant RBAC
**Priority**: P0 (Must Have)

**Description**: Role-based access control with organization-level isolation.

**Roles**:
- **Owner**: Full access, billing, user management
- **Admin**: Manage projects, flows, runs
- **PM/Ops**: Create and run flows
- **Compliance**: View artifacts and reports
- **Viewer**: Read-only access

**Acceptance Criteria**:
- [x] Organization-level data isolation
- [x] User role assignment
- [x] Permission checks on all API endpoints
- [x] Audit logging for permission changes
- [x] UI reflects user permissions

**Data Isolation**:
- All queries filtered by org_id
- No cross-org data access
- Foreign key constraints enforced

---

#### FR-2.3: API Keys
**Priority**: P1 (Should Have)

**Description**: API keys for external access (CI/CD, CLI, webhooks).

**Acceptance Criteria**:
- [x] API key creation with scopes
- [x] SHA-256 hashing of keys
- [x] Key prefix for display (first 8 chars)
- [x] Optional expiration date
- [x] Last used tracking
- [x] Revocation functionality
- [x] Audit logging for key usage

**Scopes**:
- `flows:read`: Read flows
- `flows:write`: Create/update flows
- `runs:write`: Execute flows
- `runs:read`: View run results
- `projects:read`: View projects
- `artifacts:read`: Download artifacts

---

### 1.3 Billing & Subscriptions

#### FR-3.1: Subscription Plans
**Priority**: P0 (Must Have)

**Description**: Tiered subscription plans with usage limits.

**Plans**:
- **Free**: $0/month, 10 runs/day, 1 project
- **Pro**: $29/month, 1,000 runs/month, 10 projects
- **Team**: $99/month, 5,000 runs/month, unlimited projects
- **Enterprise**: Custom, unlimited runs, custom SLA

**Acceptance Criteria**:
- [x] Plan creation via Lemon Squeezy
- [x] Usage tracking (runs per month)
- [x] Usage reset on billing cycle
- [x] Graceful overage handling (block or charge)
- [x] Plan upgrade/downgrade
- [x] Prorated billing for changes

---

#### FR-3.2: Payment Processing
**Priority**: P0 (Must Have)

**Description**: Lemon Squeezy integration for payment processing.

**Acceptance Criteria**:
- [x] Webhook signature verification
- [x] Subscription lifecycle events:
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_expired`
  - `subscription_paused`
  - `subscription_resumed`
- [x] Payment failure handling
- [x] Invoice generation
- [x] Tax calculation (via Lemon Squeezy)

**Technical Constraints**:
- Webhook signature validation (HMAC)
- Idempotent event processing
- Retry logic for failed webhooks

---

#### FR-3.3: Billing Dashboard
**Priority**: P1 (Should Have)

**Description**: User-facing billing management interface.

**Acceptance Criteria**:
- [ ] Current plan display
- [ ] Usage metrics (runs this month)
- [ ] Usage charts/visualizations
- [ ] Upgrade/downgrade buttons
- [ ] Payment method update
- [ ] Invoice history
- [ ] Billing email update

---

### 1.4 Workflow Scheduling

#### FR-4.1: Cron Scheduling
**Priority**: P0 (Must Have)

**Description**: Schedule flows to run automatically using cron expressions.

**Acceptance Criteria**:
- [x] Create schedule with cron expression
- [x] Link schedule to flow
- [x] Pass parameters to scheduled runs
- [x] Enable/disable schedules
- [x] Schedule execution logs
- [x] Timezone support

**Cron Examples**:
- `0 9 * * 1-5` - Weekdays at 9am
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Weekly on Sunday

**Technical Constraints**:
- Cloudflare Queues for scheduling
- Cloudflare Workflows for execution
- Maximum schedule interval: 30 days

---

#### FR-4.2: Scheduled Run Management
**Priority**: P1 (Should Have)

**Description**: Manage and monitor scheduled runs.

**Acceptance Criteria**:
- [x] List all schedules
- [x] View schedule history
- [x] Pause/resume schedules
- [x] Delete schedules
- [x] Edit schedule configuration
- [x] View next run time

---

### 1.5 Integrations

#### FR-5.1: Webhooks
**Priority**: P0 (Must Have)

**Description**: Send notifications to external systems on flow events.

**Events**:
- `run.completed`: Flow finished successfully
- `run.failed`: Flow execution failed
- `flow.created`: New flow created
- `flow.updated`: Flow modified

**Acceptance Criteria**:
- [x] Configure webhook URL per project
- [x] Define which events trigger webhook
- [x] Retry failed deliveries (exponential backoff)
- [x] Webhook delivery logs
- [x] Custom headers support
- [x] Payload templates

**Webhook Payload**:
```json
{
  "event": "run.completed",
  "timestamp": "2026-03-02T10:00:00Z",
  "data": {
    "runId": "uuid",
    "flowId": "uuid",
    "flowName": "My Flow",
    "status": "succeeded",
    "artifacts": ["video.webm", "report.json"]
  }
}
```

---

#### FR-5.2: Third-Party Integrations
**Priority**: P1 (Should Have)

**Description**: Pre-built integrations with common services.

**Supported Integrations**:
- [x] **Slack**: Send run notifications to channels
- [ ] **GitHub**: Trigger flows from repository events
- [ ] **GitLab**: Trigger flows from pipeline events
- [ ] **Email**: Send run reports via email
- [ ] **Zapier**: Webhook integration for Zapier
- [ ] **Make**: Webhook integration for Make

**Acceptance Criteria**:
- [x] OAuth flow for authentication
- [x] Configuration UI per integration
- [x] Enable/disable per project
- [x] Customizable message templates

---

### 1.6 Template Marketplace

#### FR-6.1: Community Templates
**Priority**: P2 (Nice to Have)

**Description**: Share and discover workflow templates.

**Acceptance Criteria**:
- [ ] Publish flow as template
- [ ] Template metadata (name, description, tags)
- [ ] Template preview (screenshots/video)
- [ ] Search and browse templates
- [ ] Fork template to customize
- [ ] Rate and review templates
- [ ] Revenue sharing (70% creator, 30% platform)

---

#### FR-6.2: Template Management
**Priority**: P2 (Nice to Have)

**Description**: Manage template library.

**Acceptance Criteria**:
- [ ] Template approval workflow
- [ ] Template versioning
- [ ] Template analytics (views, forks, revenue)
- [ ] Featured templates
- [ ] Category filtering
- [ ] Trending templates

---

### 1.7 Security & Compliance

#### FR-7.1: Audit Logging
**Priority**: P0 (Must Have)

**Description**: Comprehensive audit trail for all actions.

**Logged Events**:
- [x] User authentication (login, logout)
- [x] Flow CRUD operations
- [x] Run executions
- [x] API key creation/revocation
- [x] Permission changes
- [x] Billing events
- [x] Integration changes

**Acceptance Criteria**:
- [x] All mutations logged
- [x] Actor identification (user_id)
- [x] Timestamp (ISO 8601)
- [x] Target type and ID
- [x] Event detail (JSON)
- [x] 90-day hot retention
- [x] 7-year cold retention (compliance)

---

#### FR-7.2: PII Redaction
**Priority**: P1 (Should Have)

**Description**: Redact sensitive data from artifacts.

**Acceptance Criteria**:
- [ ] Define redaction rules per project
- [ ] Blur elements by selector
- [ ] Redact text patterns (emails, SSNs, credit cards)
- [ ] Redaction preview before saving
- [ ] Audit log for redaction rules

---

#### FR-7.3: Input Validation
**Priority**: P0 (Must Have)

**Description**: Validate all inputs to prevent security vulnerabilities.

**Acceptance Criteria**:
- [x] Zod schema validation on all API endpoints
- [x] SQL injection prevention (parameterized queries)
- [x] XSS prevention (output encoding)
- [x] Path traversal prevention
- [x] Command injection prevention (no eval/Function)
- [x] Maximum payload size: 1MB

---

#### FR-7.4: Rate Limiting
**Priority**: P0 (Must Have)

**Description**: Prevent abuse and ensure fair usage.

**Acceptance Criteria**:
- [x] Per-org rate limits
- [x] Per-endpoint limits
- [x] Burst allowance
- [x] Rate limit headers in response
- [ ] Plan-based limits (Free: 10/day, Pro: 1000/month)

**Limits**:
- API requests: 100/minute per org
- Flow executions: Per plan limits
- Webhook deliveries: 10/second per integration

---

### 1.8 Analytics & Reporting

#### FR-8.1: Usage Analytics
**Priority**: P1 (Should Have)

**Description**: Track platform usage metrics.

**Metrics**:
- [x] Total runs per day/week/month
- [x] Success/failure rate
- [x] Average execution time
- [x] Most used flows
- [x] Active projects
- [x] Storage usage

**Acceptance Criteria**:
- [x] Aggregate queries for performance
- [x] Date range filtering
- [x] Export to CSV
- [ ] Visualization charts

---

#### FR-8.2: Run Analytics
**Priority**: P1 (Should Have)

**Description**: Detailed analytics for flow runs.

**Metrics**:
- [x] Execution time per step
- [x] Error frequency by step
- [x] Locator failure rates
- [x] Browser performance metrics
- [x] Artifact sizes

**Acceptance Criteria**:
- [x] Per-run statistics
- [x] Aggregated by flow
- [x] Trend analysis
- [ ] Performance recommendations

---

## 2. Non-Functional Requirements

### 2.1 Performance

#### NFR-1.1: Response Times
- API endpoints: p95 <500ms
- Page load (LCP): <2s
- Flow execution: <10s for 20 steps
- Screenshot capture: <500ms

#### NFR-1.2: Throughput
- Support 100 concurrent runs
- 1,000 API requests/second
- 10,000 reads/second from D1

#### NFR-1.3: Scalability
- Horizontal scaling via Cloudflare Workers
- Auto-scaling based on load
- No single points of failure

---

### 2.2 Availability

#### NFR-2.1: Uptime
- **Free/Pro**: 99.5% uptime SLA (3.65d downtime/year)
- **Team**: 99.9% uptime SLA (8.76h downtime/year)
- **Enterprise**: 99.95% uptime SLA (4.38h downtime/year)

#### NFR-2.2: Disaster Recovery
- Daily database backups
- R2 replication (multi-region)
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 24 hours

---

### 2.3 Security

#### NFR-3.1: Encryption
- Data at rest: Encrypted (Cloudflare R2/D1)
- Data in transit: TLS 1.3
- Auth profiles: Encrypted with org-specific key
- API keys: SHA-256 hashed

#### NFR-3.2: Compliance
- GDPR compliant (data export, deletion)
- SOC 2 Type II (future)
- HIPAA optional (Enterprise)

#### NFR-3.3: Vulnerability Management
- SAST scan on every PR
- Dependency vulnerability scan
- Secret scanning (Gitleaks)
- License compliance scan
- Critical/High vulnerabilities block release

---

### 2.4 Maintainability

#### NFR-4.1: Code Quality
- Maximum file size: 200 lines (src/, app/, lib/)
- TypeScript strict mode
- No `any` types allowed
- All exports typed
- ESLint + Prettier configured

#### NFR-4.2: Testing Coverage
- **Critical paths**: 100% coverage (auth, payments, data writes)
- **Overall**: ≥90% line coverage
- **Branch**: ≥85% branch coverage
- Test types: Unit, Integration, E2E

#### NFR-4.3: Documentation
- API documentation (OpenAPI)
- Component documentation (Storybook)
- Runbook for operations
- Onboarding guide for developers

---

### 2.5 Usability

#### NFR-5.1: Accessibility
- WCAG AA compliance
- Keyboard navigation for all actions
- Screen reader labels on interactive elements
- Focus indicators (2px outline, 4px offset)
- Touch targets ≥44x44px
- Contrast ratio ≥4.5:1

#### NFR-5.2: Internationalization
- Support for English (initial)
- Framework for future languages
- Timezone support
- Date/time localization

#### NFR-5.3: Responsive Design
- Mobile-friendly (320px breakpoint)
- Tablet support (768px breakpoint)
- Desktop support (1024px+)
- Touch gestures on mobile

---

## 3. User Stories

### US-1: First-Time User Onboarding
**As** a new user
**I want** to be guided through creating my first flow
**So that** I can quickly see value in the product

**Acceptance Criteria**:
- [ ] Welcome screen with value proposition
- [ ] Step-by-step tutorial
- [ ] Create first project
- [ ] Map first element
- [ ] Create first flow
- [ ] Execute first flow
- [ ] View results

**Success Metric**: >40% of sign-ups execute ≥1 flow within 24 hours

---

### US-2: Explaining an Incident
**As** a customer support agent
**I want** to run a flow to reproduce a customer's issue
**So that** I can explain what went wrong with visual evidence

**Acceptance Criteria**:
- [ ] Select flow from library
- [ ] Enter incident-specific parameters
- [ ] Execute flow
- [ ] Share video + subtitles with customer
- [ ] Attach to support ticket

**Success Metric**: Reduce incident investigation time by 50%

---

### US-3: Compliance Audit
**As** a compliance officer
**I want** to run flows that demonstrate controls
**So that** I can provide auditable evidence

**Acceptance Criteria**:
- [ ] Run control demonstration flow
- [ ] Generate audit report
- [ ] Export artifacts for auditors
- [ ] Verify immutability (timestamps, signatures)

**Success Metric**: Reduce audit preparation time by 70%

---

### US-4: Automated Regression Testing
**As** a QA engineer
**I want** to schedule flows to run after deployments
**So that** I can catch regressions automatically

**Acceptance Criteria**:
- [ ] Create regression test flow
- [ ] Schedule to run post-deployment
- [ ] Configure failure notifications
- [ ] Integrate with CI/CD pipeline

**Success Metric**: Detect 80% of regressions before production

---

### US-5: Monetizing Workflows
**As** a workflow creator
**I want** to publish templates to the marketplace
**So that** I can earn revenue from my expertise

**Acceptance Criteria**:
- [ ] Publish flow as template
- [ ] Set price (free/paid)
- [ ] Track sales and revenue
- [ ] Receive payouts (70% share)

**Success Metric**: $1,000/month avg earnings for top 10 creators

---

## 4. Technical Architecture

### 4.1 Tech Stack

#### Backend
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Framework**: Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Queue**: Cloudflare Queues
- **Workflows**: Cloudflare Workflows (durable execution)
- **Browser**: Cloudflare Browser Rendering + Puppeteer

#### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Routing**: React Router v7
- **UI**: Custom components (Apple HIG compliant)
- **Deployment**: Cloudflare Pages

#### Authentication
- **Provider**: Clerk
- **Protocol**: JWT (RS256)
- **Session**: HttpOnly cookies

#### Billing
- **Provider**: Lemon Squeezy
- **Webhooks**: HMAC signature verification

---

### 4.2 Data Model

#### Core Entities
```
org
├── user (RBAC)
├── project
│   ├── screen
│   │   └── element (locators)
│   ├── auth_profile (credentials)
│   └── flow
│       ├── flow_version (immutable)
│       └── schedule
├── run
│   ├── run_step (execution log)
│   └── artifact (R2 references)
├── integration (webhooks, Slack, etc.)
├── api_key (external access)
└── audit_log (compliance)
```

#### Key Indexes
- `run(flow_id, created_at DESC)`
- `artifact(run_id, kind)`
- `element(screen_id, name)`
- `flow(project_id, name)`
- `audit_log(org_id, created_at DESC)`

---

### 4.3 API Design

#### REST Endpoints
```
GET  /health                    - Health check
GET  /flows                     - List flows
POST /flows                     - Create flow
GET  /flows/:id                 - Get flow details
PUT  /flows/:id                 - Update flow
GET  /runs                      - List runs
POST /runs                      - Execute flow
GET  /runs/:id                  - Get run details
POST /runs/:id/retry            - Retry failed run
GET  /projects                  - List projects
POST /projects                  - Create project
GET  /screens?projectId=        - List screens
POST /screens                   - Create screen
GET  /elements?screenId=        - List elements
POST /elements                  - Create element
GET  /auth-profiles?projectId=  - List auth profiles
POST /auth-profiles             - Create auth profile
GET  /artifacts/:id/download    - Download artifact
GET  /schedules                 - List schedules
POST /schedules                 - Create schedule
GET  /analytics                 - Get usage metrics
POST /integrations              - Create integration
GET  /api-keys                  - List API keys
POST /api-keys                  - Create API key
```

#### Authentication
- Protected routes: `Authorization: Bearer <JWT>`
- API key auth: `Authorization: Bearer <api_key>`
- Public flows: Execute-only (no auth required)

---

### 4.4 Deployment Architecture

```
┌─────────────────┐
│   Cloudflare    │
│      Pages      │
│   (React UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Cloudflare    │
│     Workers     │
│   (Hono API)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌──────┐
│  D1  │  │  R2  │
│  DB  │  │Storage│
└──────┘  └──────┘
    │
    ▼
┌──────────────────┐
│   Cloudflare     │
│  Workflows +     │
│   Queues +       │
│ Browser Rendering│
└──────────────────┘
```

---

## 5. Constraints & Dependencies

### 5.1 Cloudflare Platform Limits
- Workers CPU time: 30s max
- Workers memory: 128MB
- D1 database size: 25GB (MVP)
- D1 query timeout: 5ms p50
- R2 storage: Unlimited (paid)
- Browser Rendering: 30s timeout

### 5.2 External Dependencies
- **Clerk**: Authentication (SLA: 99.9%)
- **Lemon Squeezy**: Billing (SLA: 99.5%)
- **Puppeteer**: Browser automation (maintained by Google)

### 5.3 Browser Compatibility
- **Primary**: Chrome/Chromium (via Puppeteer)
- **Secondary**: Firefox, Safari (future)

---

## 6. Risk Analysis

### 6.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cloudflare service outage | High | Low | Multi-region deployment, status page monitoring |
| Browser Rendering API changes | High | Medium | Version pinning, fallback to local Puppeteer |
| D1 performance degradation | High | Medium | Query optimization, migration to Postgres/Hyperdrive |
| Puppeteer memory leaks | Medium | Medium | Resource limits, process isolation |
| Webhook delivery failures | Low | High | Retry logic, dead letter queue |

### 6.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Viral mechanics (share-to-play), template marketplace |
| Competitor imitation | High | High | Strong brand, network effects, switching costs |
| Payment processing issues | Medium | Low | Multiple providers, grace periods |
| Security breach | Critical | Low | Security audits, bug bounty program, encryption |

---

## 7. Success Metrics

### 7.1 Product Metrics
- **Activation Rate**: >40% (sign-ups who execute ≥1 flow)
- **Retention**: >60% Day 7, >30% Day 30
- **Viral Coefficient**: >1.2 (invites per user)
- **Time to Value**: <5 minutes (sign-up to first execution)

### 7.2 Business Metrics
- **MRR**: $10k by month 6, $50k by month 12
- **CAC**: <$10 (via viral growth)
- **LTV**: >$300 (annual Pro subscription)
- **Churn**: <5% monthly

### 7.3 Technical Metrics
- **Error Rate**: <0.1%
- **p95 Latency**: API <500ms, UI <2s
- **Uptime**: 99.5% (Free/Pro), 99.95% (Enterprise)
- **Test Coverage**: ≥90% line, ≥85% branch

---

## 8. Implementation Phases

### Phase 0: Foundation ✅ COMPLETE
- [x] Project setup (monorepo, CI/CD)
- [x] Database schema (migrations 0001-0009)
- [x] Core API endpoints
- [x] Basic UI components
- [x] Authentication (Clerk)
- [x] Flow execution engine (Puppeteer)
- [x] Artifact generation (screenshots, SRT, video)

### Phase 1: Quick Wins ✅ COMPLETE
- [x] Real-time execution progress
- [x] Screenshot gallery
- [x] Error handling and display
- [x] Flow templates

### Phase 2: Production Ready (Current)
- [ ] File size compliance (200 lines max)
- [ ] Test coverage (90% line, 85% branch)
- [ ] Security scans (SAST, dependency, secret)
- [ ] RBAC implementation
- [ ] Billing webhooks
- [ ] API keys
- [ ] Integrations (Slack, webhooks)

### Phase 3: Growth
- [ ] Template marketplace
- [ ] Share-to-play functionality
- [ ] Chrome extension
- [ ] Auto-generated content (GIF, MP4, markdown)
- [ ] Embed widget

### Phase 4: Scale
- [ ] Postgres/Hyperdrive migration
- [ ] Multi-region deployment
- [ ] Enterprise SSO
- [ ] Voice narration (TTS)
- [ ] Advanced redaction

---

## 9. Acceptance Criteria Summary

### MVP (Must Have)
- [x] User can create project and map elements
- [x] User can build flow visually (14+ step types)
- [x] User can execute flow with real browser
- [x] System generates artifacts (video, screenshots, SRT, report)
- [x] User can view and download artifacts
- [x] User can retry failed runs
- [x] System authenticates users (Clerk)
- [x] System enforces RBAC (org-level isolation)
- [x] System processes payments (Lemon Squeezy)
- [x] System logs all actions (audit trail)

### Production Ready
- [ ] All files <200 lines
- [ ] ≥90% test coverage
- [ ] Security scans pass
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Onboarding flow exists
- [ ] Error monitoring integrated
- [ ] Analytics dashboard available

### Growth Features
- [ ] Template marketplace
- [ ] Public flow sharing
- [ ] Chrome extension
- [ ] Social sharing (Twitter, LinkedIn)
- [ ] Embed widget

---

## 10. Open Questions

1. **Authentication Strategy**
   - [ ] Cookie import vs login recipe vs SSO (decision: Cookie import for MVP)

2. **Table Selection**
   - [ ] Which table/grid components to support first (decision: Custom selectRow step)

3. **Video Format**
   - [ ] WebM vs MP4 (decision: WebM for MVP, MP4 for v1)

4. **Voice Narration**
   - [ ] TTS provider selection (decision: Deferred to v1)

5. **Data Residency**
   - [ ] Regional requirements (decision: US-only for MVP)

---

## Appendix

### A. Glossary
- **Flow**: Versioned workflow definition with steps
- **Run**: Single execution of a flow with specific parameters
- **Artifact**: Output from a run (video, screenshot, report)
- **Element**: Mapped UI component with locators
- **Screen**: Page or view in target application
- **Project**: Collection of screens, elements, and flows
- **Org**: Organization with users and billing

### B. References
- [Technical Design](documents/tech-design.md)
- [User Stories](documents/user-stories.md)
- [Feature Documentation](FEATURES.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Policy](SECURITY.md)

### C. Change Log
- 2026-03-02: Initial requirements document created
- Based on Phase 1 completion (2026-01-07)
- Aligned with CLAUDE.md product policy

---

**Document Status**: Draft
**Next Review**: 2026-03-15 (after Sprint 2)
**Owner**: Product Team
