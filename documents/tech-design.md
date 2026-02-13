# CodeRail Flow – Full Technical Design (Cloudflare-first)

## 0. Scope

This is the technical design for **CodeRail Flow**, the CodeRail product that turns explicit workflows into **deterministic, narrated, visual evidence**.

CodeRail Flow targets **PM/Ops/Compliance** users, while keeping execution deterministic and auditable.

This design assumes a **Cloudflare-first backend** (Workers, Pages, D1/Hyperdrive, R2, Queues, Workflows, Browser Rendering).

---

## 1. Goals

### Product Goals

* Let non-developers create and run **Flows** (versioned workflows) against any web app.
* Produce artifacts per run:

  * video (WebM/MP4)
  * subtitles (SRT/VTT)
  * optional narration audio
  * run report (JSON)
* Provide deterministic, explainable behavior:

  * explicit selectors/locators (no “AI guessing”)
  * reproducible runs tied to flow version and runner version
* Provide enterprise-friendly controls:

  * RBAC
  * audit logs
  * retention
  * redaction/masking

### System Goals

* Cloudflare-native deployment for MVP (minimal ops).
* Scalable execution with retries and durable state.
* Strong security boundaries for credentials and artifacts.

---

## 2. Non-Goals (MVP)

* AI agent that decides what to click or highlight.
* Capturing arbitrary end-user sessions (session replay).
* Supporting every edge-case table/grid component on day one.
* MFA automation beyond simple OTP input (defer).
* Full self-hosted deployment (can be a later SKU).

---

## 3. User Personas & Primary Use Cases

### Personas

* **PM**: creates flows, runs flows, shares artifacts.
* **Ops/Support**: runs flows for incidents, attaches evidence to tickets.
* **Compliance**: needs auditable proof.
* **Engineer/Admin**: sets up auth and mapping reliability contracts.

### Use Cases

* Explain failures (payments, onboarding, KYC, etc.).
* Create release walkthroughs.
* Produce audit evidence (controls demonstrated visually).
* Train teams (runbook as executable flow).

---

## 4. High-Level Architecture

### Components

1. **Web UI** (Cloudflare Pages)

   * Projects
   * Screens & Elements
   * Flow Builder
   * Run Center (history, status, artifacts)

2. **API** (Cloudflare Workers)

   * Auth/RBAC
   * CRUD: projects/screens/elements/flows
   * Run orchestration (start run → queue/workflow)
   * Artifact signing (download/upload)

3. **Execution Orchestrator** (Cloudflare Workflows)

   * One workflow instance per run
   * Durable retries
   * Step-by-step progress updates

4. **Execution Runtime** (Cloudflare Browser Rendering)

   * Playwright-driven browser
   * Overlay injection
   * Video capture

5. **Async Queue** (Cloudflare Queues)

   * Buffer run requests
   * Smooth spikes

6. **Storage**

   * Metadata: **D1** (MVP) or Postgres via **Hyperdrive** (scale)
   * Artifacts: **R2**
   * Edge cache: KV (optional)

---

## 5. Data Model (D1/Postgres)

> Use D1 for MVP. If/when concurrency and query complexity grow, migrate to Postgres behind Hyperdrive. Design schemas as if Postgres from day one.

### 5.1 Core Tables

#### `org`

* `id` uuid pk
* `name` text
* `plan` text
* `created_at` timestamptz

#### `user`

* `id` uuid pk
* `org_id` uuid fk
* `email` text
* `role` text  // owner, admin, pm, ops, compliance, viewer
* `created_at`

#### `project`

* `id` uuid pk
* `org_id` uuid fk
* `name` text
* `base_url` text
* `env` text  // dev/stage/prod labels
* `created_at`

#### `screen`

* `id` uuid pk
* `project_id` uuid fk
* `name` text
* `url_path` text
* `created_at`

#### `element`

* `id` uuid pk
* `screen_id` uuid fk
* `name` text // PM-facing label
* `locator_primary` json  // {type,value}
* `locator_fallbacks` json
* `reliability_score` real
* `created_by` uuid
* `created_at`

#### `flow`

* `id` uuid pk
* `project_id` uuid fk
* `name` text
* `description` text
* `status` text // draft, active, archived
* `current_version` int
* `created_by` uuid
* `created_at`

#### `flow_version`

* `id` uuid pk
* `flow_id` uuid fk
* `version` int
* `definition` json  // Flow DSL
* `changelog` text
* `created_by` uuid
* `created_at`

#### `auth_profile`

* `id` uuid pk
* `project_id` uuid fk
* `type` text // cookies, login_recipe
* `encrypted_payload` blob/text
* `created_at`

#### `run`

* `id` uuid pk
* `flow_id` uuid fk
* `flow_version` int
* `status` text // queued,running,succeeded,failed,canceled
* `params` json
* `runner_version` text
* `started_at` timestamptz
* `finished_at` timestamptz
* `error_code` text null
* `error_message` text null

#### `run_step`

* `id` uuid pk
* `run_id` uuid fk
* `idx` int
* `type` text
* `status` text // ok,failed,skipped
* `started_at`
* `finished_at`
* `detail` json

#### `artifact`

* `id` uuid pk
* `run_id` uuid fk
* `kind` text // video,subtitles,audio,report,screenshot
* `r2_key` text
* `content_type` text
* `bytes` bigint
* `sha256` text
* `created_at`

#### `audit_log`

* `id` uuid pk
* `org_id` uuid
* `actor_user_id` uuid
* `action` text
* `target_type` text
* `target_id` uuid
* `detail` json
* `created_at`

### 5.2 Indexes (baseline)

* `run(flow_id, started_at desc)`
* `artifact(run_id, kind)`
* `element(screen_id, name)`
* `flow(project_id, name)`

---

## 6. Flow DSL

### 6.1 Design Principles

* Declarative steps
* Explicit targets (element references)
* Deterministic waits and assertions
* Narrative annotations as first-class data

### 6.2 DSL Schema (conceptual)

```json
{
  "params": [{"name":"cardId","type":"string","required":true}],
  "steps": [
    {"type":"goto","screenId":"...","narrate":"Open card transactions."},
    {"type":"fill","elementId":"...","value":"{{cardId}}","narrate":"Search by card id."},
    {"type":"click","elementId":"..."},
    {"type":"waitFor","elementId":"...","state":"visible"},
    {"type":"selectRow","tableElementId":"...","where":{"Status":"FAILED"},"orderBy":{"Created":"desc"},"take":1,
     "narrate":"Open the latest failed transaction."},
    {"type":"highlight","elementId":"...","style":"box","narrate":"This is the error code returned from the operator."},
    {"type":"pause","ms":2000}
  ]
}
```

### 6.3 Step Catalog (MVP)

* `goto(screenId|url)`
* `click(elementId)`
* `fill(elementId, value)`
* `select(elementId, option)`
* `waitFor(elementId, state=visible|attached|hidden)`
* `assertText(elementId, contains|equals)`
* `highlight(elementId, style=box|pulse)`
* `caption(text, placement)`
* `pause(ms)`
* `screenshot(name)` (optional)
* `selectRow(tableElementId, where, orderBy, take)` (limited adapters)

### 6.4 Deterministic Timing

* Each step can define `minMs` and `timeoutMs`.
* Narration segments are produced from:

  * `narrate` text on steps
  * explicit `caption` steps
  * `pause` extends segment visibility

---

## 7. Locator Strategy (No DOM for PM)

### 7.1 Locator Types

Priority order:

1. `testid` (preferred)
2. `role` + accessible name
3. `label` association
4. `css` (last resort)
5. `xpath` (avoid)

### 7.2 Locator Storage

`locator_primary`: `{ type, value, meta }`
`locator_fallbacks`: list of locators

### 7.3 Reliability Scoring

* testid: 1.0
* role+name: 0.8
* label: 0.7
* css: 0.4
* xpath: 0.2

UI shows a warning if < 0.6.

---

## 8. Mapping Mode (PM UX)

### 8.1 Behavior

* Launch a controlled browser to `base_url + screen.url_path`.
* Inject a “picker” overlay:

  * hover outline
  * click selects element
  * show preview card with captured locator(s) and reliability
* PM assigns:

  * element name
  * optional constraints (mustBeVisible, mustHaveText)

### 8.2 Output

Creates an `element` record with primary+fallback locators.

### 8.3 Guardrails

* Require testid for “critical elements” (configurable).
* Offer “request testid from engineering” message.

---

## 9. Overlay Rendering (Highlights + Captions)

### 9.1 Overlay Library

Inject a small JS library into the page during execution:

* `window.coderail.highlight(locator, options)`
* `window.coderail.caption(text, options)`
* `window.coderail.clear()`

Constraints:

* `pointer-events: none`
* very high z-index
* no layout shifts

### 9.2 Styles (MVP)

* Highlight box with pulse animation
* Caption banner bottom-center
* Optional arrow (v1)

---

## 10. Execution Pipeline

### 10.1 Run Lifecycle

1. UI calls `POST /runs` with `flow_id` + params.
2. API validates params and creates `run` (queued) + `run_step` skeleton.
3. API enqueues message to **Queues** OR starts **Workflow**.
4. Workflow updates status to running.
5. Workflow starts Browser Rendering session.
6. Apply auth profile.
7. Execute steps:

   * before/after screenshots optional
   * overlays injected
   * subtitle timeline built
   * per-step run_step updates
8. Capture raw video.
9. Generate SRT/VTT.
10. Optional TTS → audio.
11. Optional mux to MP4.
12. Upload artifacts to R2.
13. Mark run succeeded/failed.

### 10.2 Failure Modes

* Selector not found
* Timeout
* Navigation blocked
* Auth expired
* App error screen

All failures must:

* mark step failed
* store error message
* store screenshot (optional)

---

## 11. Cloudflare Implementation Details

### 11.1 Workers API

Suggested stack: **Hono** + zod validation.

Bindings:

* D1 DB
* R2 bucket
* Queue
* Workflows

Endpoints:

* `POST /auth/login` (optional)
* `GET/POST /projects`
* `GET/POST /screens`
* `GET/POST /elements`
* `GET/POST /flows`
* `POST /runs`
* `GET /runs/:id`
* `GET /runs/:id/artifacts`
* `POST /artifacts/sign-upload`
* `GET /artifacts/:id/signed-url`

### 11.2 Workflows

* Durable orchestration
* Retries on transient failures
* Step state persisted as workflow state + DB updates

### 11.3 Browser Rendering

* Use Playwright to drive flows.
* Prefer headed/controlled mode for rendering overlays.
* Standardize viewport.

### 11.4 Queues

* Rate-limit runs per org.
* Concurrency controls.

### 11.5 Storage (R2)

Key structure:

* `org/{orgId}/project/{projectId}/run/{runId}/video.webm`
* `.../subtitles.srt`
* `.../report.json`

Artifacts are private; access via signed URLs.

---

## 12. Audio & Narration

### 12.1 MVP Recommendation

* Ship **subtitles first** (fast, deterministic).
* Add voice in v1.

### 12.2 Voice Generation Options

* Offline TTS (Piper) in a separate worker/container service
* External TTS provider (only if customers accept)

### 12.3 Synchronization

* Subtitle timeline is source of truth.
* Voice is generated from the same segments.

---

## 13. Security & Compliance

### 13.1 Secrets

* Auth payload encrypted at rest.
* Never include secrets in artifacts.

### 13.2 Artifact Redaction

Per-project rules:

* mask selectors (blur element rect)
* hide PII fields

### 13.3 RBAC

Roles:

* owner/admin: everything
* pm/ops: manage flows + run
* compliance: view artifacts + reports
* viewer: view

### 13.4 Audit Logs

Log actions:

* create/update flow
* mapping changes
* run execution
* artifact access

---

## 14. Observability

* Structured logs per run
* Per-step timings
* Failure rate per locator
* Queue depth metrics

---

## 15. MVP Milestones

### Milestone 1 – End-to-end Run

* Hardcode one flow
* Cookie auth
* Produce WebM + SRT
* Store in R2
* View in UI

### Milestone 2 – Mapping + Element Registry

* Picker overlay
* Save elements
* Flow builder uses saved elements

### Milestone 3 – Flow Versioning + Run Center

* versioned flow definitions
* run history
* artifact viewer

### Milestone 4 – Workflows + Retries

* migrate runner into Workflows
* robust timeouts + retries

### Milestone 5 – Voice + MP4

* optional audio
* mux output

---

## 16. Repo Structure (recommended)

Keep CodeRail Flow separate from Analyze.

```
coderail-flow/
  apps/
    web/          # Pages UI
    api/          # Workers API
  packages/
    dsl/          # Flow schema + validators
    overlay/      # injected overlay library
    runner/       # execution logic for Browser Rendering
  infra/
    wrangler/     # configs
    migrations/   # D1 migrations
```

Shared platform contracts (separate repo):

* org/user/project schema
* artifact schema
* audit schema

---

## 17. Open Questions (Decide Early)

* Authentication: cookie import vs login recipe vs SSO.
* Table selection: which table/grid components to support first.
* Subtitle burn-in requirement for customers.
* Data residency / region requirements.

---

## 18. Acceptance Criteria (MVP)

* PM can map 5 elements and build a simple flow.
* PM can run a flow with a parameter.
* Run produces:

  * WebM video with visible overlay highlights/captions
  * SRT subtitles matching narration text
  * Run report with step timings
* Artifacts are stored in R2 and accessible via signed URL.
* Runs are traceable to flow version and runner version.

---

**CodeRail Flow**
Deterministic execution. Explainable evidence.
