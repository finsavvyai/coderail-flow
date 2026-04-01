# CodeRail Flow - Implementation Plan

**Project**: CodeRail Flow
**Version**: 1.0.0
**Last Updated**: March 6, 2026
**Status**: Phase 2 (Production Ready + Growth Features)

---

## Executive Summary

This implementation plan focuses on completing remaining Phase A tasks, implementing Phase B killer features, and preparing for Phase C enterprise features. The plan is organized by priority with clear dependencies and acceptance criteria.

**Current Status**:
- ✅ Phase 0: Foundation Complete
- ✅ Phase 1: Quick Wins (Tasks 1-3 Complete)
- 🟡 Phase A: Task 4 (Dashboard), Task 5 (UI Polish) - In Progress
- ⏳ Phase B: Killer Features (Tasks 6-10) - Not Started
- ⏳ Phase C: Enterprise Features (Tasks 11-15) - Not Started

---

## Priority Matrix

| Task | Impact | Effort | Priority | Dependencies |
|------|--------|--------|----------|--------------|
| Task 4: Run History Dashboard | High | Medium | P0 | Backend complete |
| Task 6: Visual Element Mapper | Critical | High | P0 | None |
| Task 7: Smart Authentication | High | Medium | P0 | None |
| Task 5: UI Polish | Medium | Medium | P1 | None |
| Task 13: Jira Integration | High | High | P1 | None |
| Task 10: Flow Templates | Medium | Low | P1 | None |
| Task 9: Cloudflare Workflows | High | High | P2 | None |
| Task 8: Video Recording | Medium | High | P2 | None |

---

## Task 4: Run History Dashboard (3 hours) - P0

**Goal**: Overview of all runs with statistics and visualizations

**Status**: Backend complete, Frontend pending

### 4.1 Frontend Dashboard Page

**File**: `apps/web/src/pages/Dashboard.tsx`

- [ ] Create Dashboard page component
- [ ] Install charting library: `pnpm add recharts`
- [ ] Build layout with sections:
  - [ ] Summary cards (total runs, success rate, avg duration)
  - [ ] Success rate pie chart
  - [ ] Execution time line chart
  - [ ] Recent runs table
  - [ ] Most popular flows list

**Acceptance Criteria**:
- Dashboard loads in <2s
- Charts render with real data
- Date range filter works (7d, 30d, 90d, custom)
- Empty state shows helpful message
- Mobile responsive (320px+)

**Dependencies**:
- Requires `GET /stats` endpoint (✅ complete)

**Effort**: 2 hours

### 4.2 Navigation Integration

**Files**: `apps/web/src/App.tsx`, `apps/web/src/components/Nav.tsx`

- [ ] Add Dashboard link to main navigation
- [ ] Make Dashboard the home page (/)
- [ ] Update routing to handle /dashboard and /
- [ ] Add active state to nav links

**Acceptance Criteria**:
- Dashboard accessible from nav
- Dashboard is default route
- Active link highlighted

**Effort**: 30 minutes

### 4.3 Testing

- [ ] Test with sample data (100+ runs)
- [ ] Verify chart accuracy
- [ ] Test date range filters
- [ ] Test responsive behavior
- [ ] Test empty state

**Effort**: 30 minutes

---

## Task 5: UI Polish (4 hours) - P1

**Goal**: Professional, modern UI with dark mode and smooth interactions

### 5.1 Design System Setup

**File**: `apps/web/tailwind.config.js`

- [ ] Configure custom theme
- [ ] Define color palette:
  - Primary: Blue (#0066CC)
  - Success: Green (#28A745)
  - Warning: Orange (#FFA500)
  - Error: Red (#DC3545)
  - Neutral: Gray scale (9 shades)
- [ ] Define typography scale (12, 14, 16, 20, 24, 32, 48)
- [ ] Define spacing system (4, 8, 12, 16, 24, 32, 48, 64)

**Acceptance Criteria**:
- Theme applies globally
- Colors accessible (WCAG AA)
- Typography consistent

**Effort**: 1 hour

### 5.2 Component Improvements

**Files**: All component files

- [ ] Replace spinners with skeleton loaders
- [ ] Add toast notification system (`react-hot-toast`)
- [ ] Implement smooth transitions (200ms ease-out)
- [ ] Add loading states to all buttons
- [ ] Improve form styling (focus states, error states)

**Acceptance Criteria**:
- No spinners visible
- Toasts work for success/error
- All buttons have loading states
- Forms have clear validation feedback

**Effort**: 1.5 hours

### 5.3 Dark Mode

**Files**: New `apps/web/src/components/ThemeToggle.tsx`, `apps/web/src/App.tsx`

- [ ] Create ThemeToggle component
- [ ] Implement theme switching logic
- [ ] Update all components for dark mode
- [ ] Save preference to localStorage
- [ ] Add dark mode to Tailwind config

**Acceptance Criteria**:
- Toggle switches themes instantly
- Preference persists
- All components work in both modes
- No flash of wrong theme on load

**Effort**: 1 hour

### 5.4 Responsive Design

**Files**: All page components

- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Fix layout issues
- [ ] Make tables scrollable on mobile
- [ ] Ensure touch targets ≥44x44px

**Acceptance Criteria**:
- No horizontal scroll on mobile
- Tables scroll horizontally if needed
- Touch targets large enough
- Images scale properly

**Effort**: 30 minutes

---

## Task 6: Visual Element Mapper (8 hours) - P0 ⭐ GAME CHANGER

**Goal**: Click elements in browser to map them automatically

### 6.1 Mapping Mode Infrastructure

**Files**:
- `apps/web/src/pages/ElementMapper.tsx` (create)
- `apps/web/src/pages/ScreenDetail.tsx` (modify)

- [ ] Create ElementMapper route
- [ ] Add "Map Elements" button to screen detail
- [ ] Build iframe wrapper for target site
- [ ] Add URL input for target page
- [ ] Handle iframe security policies

**Acceptance Criteria**:
- Mapper page accessible from screen detail
- Iframe loads target URL
- No CORS errors

**Dependencies**: None
**Effort**: 2 hours

### 6.2 Hover Overlay System

**File**: `packages/overlay/src/mapper.ts` (create)

- [ ] Inject overlay script into iframe
- [ ] Add mouseover event listener
- [ ] Highlight element on hover (yellow outline)
- [ ] Show element info tooltip:
  - Tag name
  - ID (if exists)
  - Classes (max 3)
  - Text content (truncated)

**Acceptance Criteria**:
- Hover highlights element instantly
- Tooltip shows useful info
- No performance issues

**Dependencies**: 6.1 complete
**Effort**: 2 hours

### 6.3 Click Capture System

**File**: `packages/overlay/src/mapper.ts` (extend)

- [ ] Capture click event on element
- [ ] Extract all locators:
  - [ ] `data-testid` attribute
  - [ ] `aria-label` attribute
  - [ ] `role` + `name` combination
  - [ ] `id` attribute
  - [ ] Unique class selector
  - [ ] Full CSS selector
  - [ ] XPath (fallback)
- [ ] Calculate reliability score (0-1)
- [ ] Rank locators by reliability

**Reliability Algorithm**:
```
data-testid: 1.0 (best)
aria-label + role: 0.9
id: 0.8
unique class: 0.6
CSS selector: 0.4
XPath: 0.2 (worst)
```

**Acceptance Criteria**:
- All locators extracted
- Reliability scores accurate
- Best locator highlighted

**Dependencies**: 6.2 complete
**Effort**: 2 hours

### 6.4 Locator Preview & Selection

**File**: `apps/web/src/pages/ElementMapper.tsx` (extend)

- [ ] Show all found locators
- [ ] Display reliability score (%)
- [ ] Allow user to select preferred locator
- [ ] Show fallback chain
- [ ] Test locator in real-time
- [ ] Preview element highlight with selected locator

**Acceptance Criteria**:
- All locators visible with scores
- User can select any locator
- Test button highlights element

**Dependencies**: 6.3 complete
**Effort**: 1.5 hours

### 6.5 Backend Integration

**Files**:
- `apps/api/src/index.ts` (modify)
- `apps/web/src/pages/ElementMapper.tsx` (extend)

- [ ] Save element to database via API
- [ ] Store locator and fallbacks
- [ ] Add reliability_score to element schema
- [ ] Update element API to accept array of locators
- [ ] Add element name input
- [ ] Add screen assignment

**Acceptance Criteria**:
- Element saves with all locators
- Reliability score stored
- Can retrieve and use locators

**Dependencies**: 6.4 complete
**Effort**: 30 minutes

### 6.6 Testing

- [ ] Map 10+ different element types:
  - [ ] Button
  - [ ] Input
  - [ ] Link
  - [ ] Dropdown
  - [ ] Table cell
  - [ ] Modal
  - [ ] Tab
  - [ ] Checkbox
  - [ ] Radio button
  - [ ] Card
- [ ] Verify locators work in executor
- [ ] Test on complex pages (React, Vue, vanilla)
- [ ] Test with dynamic elements

**Effort**: 30 minutes

---

## Task 7: Smart Authentication (6 hours) - P0

**Goal**: Enable flows to access authenticated pages

### 7.1 Cookie Import UI

**File**: `apps/web/src/pages/AuthProfile.tsx` (create)

- [ ] Create AuthProfile page
- [ ] Add "Create Auth Profile" button
- [ ] Build JSON upload component
- [ ] Add cookie format validation
- [ ] Show cookie preview table:
  - Name
  - Value (truncated)
  - Domain
  - Path
  - Expires
- [ ] Encrypt cookies before sending

**Acceptance Criteria**:
- Upload accepts JSON file
- Validates cookie format
- Shows preview table
- Encrypts with AES-256-GCM

**Dependencies**: None
**Effort**: 2 hours

### 7.2 Backend Storage

**Files**:
- `apps/api/migrations/0006_auth_profiles.sql` (create if needed)
- `apps/api/src/index.ts` (modify)

- [ ] Verify auth_profiles table exists
- [ ] Add auth profile CRUD endpoints:
  - POST /auth-profiles (create)
  - GET /auth-profiles?projectId= (list)
  - GET /auth-profiles/:id (get)
  - PUT /auth-profiles/:id (update)
  - DELETE /auth-profiles/:id (delete)
- [ ] Encrypt cookies with org-specific key
- [ ] Add auth_profile_id to flow table (if not exists)
- [ ] Add encryption key to env vars

**Acceptance Criteria**:
- All CRUD operations work
- Cookies encrypted at rest
- Each org has unique encryption key

**Dependencies**: 7.1 complete
**Effort**: 2 hours

### 7.3 Executor Integration

**File**: `packages/runner/src/executor.ts` (modify)

- [ ] Load auth profile for flow
- [ ] Decrypt cookies
- [ ] Apply cookies before first navigation:
  ```typescript
  await page.setCookie(...cookies);
  ```
- [ ] Verify session is valid:
  - Check if auth still works
  - Detect session expiry
  - Return clear error if expired
- [ ] Test with authenticated app

**Acceptance Criteria**:
- Cookies applied before navigation
- Session verified
- Clear error on expiry

**Dependencies**: 7.2 complete
**Effort**: 1.5 hours

### 7.4 Session Management

**File**: `packages/runner/src/executor.ts` (extend)

- [ ] Auto-refresh if possible (handle refresh tokens)
- [ ] Handle multi-account scenarios:
  - Support multiple auth profiles per project
  - Allow selecting profile per run
- [ ] Add cookie expiry warnings
- [ ] Suggest re-authentication

**Acceptance Criteria**:
- Multiple profiles supported
- Expiry warnings shown
- Re-auth prompted when needed

**Dependencies**: 7.3 complete
**Effort**: 30 minutes

### 7.5 Testing

- [ ] Test with authenticated app (e.g., Gmail, GitHub)
- [ ] Verify cookies applied correctly
- [ ] Test session expiration handling
- [ ] Test multiple auth profiles
- [ ] Test encryption/decryption

**Effort**: 30 minutes

---

## Task 13: Jira Integration (8 hours) - P1

**Goal**: Create Jira issues with flow run artifacts

### 13.1 Jira OAuth Setup

**Files**:
- `apps/api/src/integrations/jira.ts` (create)
- `apps/web/src/pages/Integrations/Jira.tsx` (create)

- [ ] Create Jira integration type
- [ ] Implement OAuth 2.0 flow
- [ ] Add Jira Cloud API client
- [ ] Store access tokens encrypted
- [ ] Add Jira integration config UI

**Acceptance Criteria**:
- OAuth flow works
- Tokens stored securely
- Can connect to Jira Cloud

**Dependencies**: None
**Effort**: 2 hours

### 13.2 Issue Creation

**File**: `apps/api/src/integrations/jira.ts` (extend)

- [ ] Create issue from flow run
- [ ] Add issue title template: `"[Flow Run] {{flowName}} - {{status}}"`
- [ ] Add issue description template:
  ```
  h2. Flow Execution Details

  *Flow:* {{flowName}}
  *Status:* {{status}}
  *Duration:* {{duration}}ms
  *Started:* {{timestamp}}

  h2. Artifacts

  *Video:* [Download|{{videoUrl}}]
  *Screenshots:* [View All|{{screenshotUrl}}]
  *Report:* [Download|{{reportUrl}}]

  h2. Error Details

  {{#if error}}
  *Message:* {{errorMessage}}
  *Step:* {{errorStep}}
  *Screenshot:* [View|{{errorScreenshotUrl}}}
  {{/if}}
  ```
- [ ] Attach video to issue
- [ ] Attach screenshots to issue
- [ ] Add run link in issue

**Acceptance Criteria**:
- Issue created successfully
- All artifacts attached
- Description formatted correctly

**Dependencies**: 13.1 complete
**Effort**: 2 hours

### 13.3 Run-to-Issue Linking

**Files**:
- `apps/api/src/integrations/jira.ts` (extend)
- `apps/api/src/index.ts` (modify)

- [ ] Add jira_issue_key to run table
- [ ] Link run to created issue
- [ ] Show Jira link in run details
- [ ] Update issue status on run completion:
  - In Progress → run started
  - Done → run succeeded
  - Failed → run failed

**Acceptance Criteria**:
- Run shows Jira link
- Issue status updates
- Can navigate to issue from run

**Dependencies**: 13.2 complete
**Effort**: 1.5 hours

### 13.4 UI Integration

**Files**:
- `apps/web/src/pages/RunDetail.tsx` (modify)
- `apps/web/src/pages/FlowDetail.tsx` (modify)

- [ ] Add "Create Jira Issue" button to run detail
- [ ] Add Jira integration settings to project
- [ ] Show Jira issue link on run
- [ ] Add issue status badge
- [ ] Allow customizing issue templates

**Acceptance Criteria**:
- Button visible on failed runs
- Can customize templates per project
- Issue link clickable

**Dependencies**: 13.3 complete
**Effort**: 1.5 hours

### 13.5 Testing

- [ ] Test OAuth flow end-to-end
- [ ] Create issue with real Jira instance
- [ ] Verify all artifacts attached
- [ ] Test issue status updates
- [ ] Test with different project configs

**Effort**: 1 hour

---

## Task 10: Flow Templates Library (4 hours) - P1

**Goal**: Pre-built flows users can install instantly

### 10.1 Template Definition

**File**: `packages/dsl/src/template.ts` (create)

- [ ] Create template schema (Zod)
- [ ] Define template metadata:
  - name (string)
  - description (string)
  - category (string)
  - tags (string[])
  - difficulty ('beginner' | 'intermediate' | 'advanced')
  - estimated_time (number, minutes)
- [ ] Define required parameters
- [ ] Include screens and elements
- [ ] Include flow steps

**Acceptance Criteria**:
- Schema validates templates
- All required fields present
- Categories defined

**Dependencies**: None
**Effort**: 1 hour

### 10.2 Create Templates

**Directory**: `apps/api/templates/` (create)

Create these templates:
- [ ] Bug Report Generator (category: 'qa')
- [ ] Feature Walkthrough (category: 'documentation')
- [ ] User Onboarding (category: 'training')
- [ ] API Demo (category: 'development')
- [ ] E-commerce Checkout (category: 'testing')

Each template includes:
- metadata.json
- flow.json
- README.md

**Acceptance Criteria**:
- 5 templates created
- All templates valid per schema
- README explains usage

**Dependencies**: 10.1 complete
**Effort**: 1.5 hours

### 10.3 Template Catalog Page

**File**: `apps/web/src/pages/Templates.tsx` (create)

- [ ] Create Templates page
- [ ] Show template grid with cards:
  - Thumbnail (first screenshot)
  - Name
  - Description
  - Category badge
  - Difficulty badge
  - Install button
- [ ] Add category filters
- [ ] Add search functionality
- [ ] Sort by popularity, difficulty, name

**Acceptance Criteria**:
- All templates visible
- Filters work
- Search returns relevant results
- Cards load quickly

**Dependencies**: 10.2 complete
**Effort**: 1 hour

### 10.4 Template Installation

**Files**:
- `apps/api/src/index.ts` (modify)
- `apps/web/src/pages/Templates.tsx` (extend)

- [ ] Add POST /flows/from-template endpoint
- [ ] Parse template JSON
- [ ] Create flow, screens, elements
- [ ] Prompt for required parameters
- [ ] Redirect to flow detail
- [ ] Add "Install Template" button

**Acceptance Criteria**:
- Template installs correctly
- All screens/elements created
- Redirects to new flow
- Parameters prompted

**Dependencies**: 10.3 complete
**Effort**: 30 minutes

### 10.5 Testing

- [ ] Install each template
- [ ] Run installed flows
- [ ] Verify all steps work
- [ ] Test parameter prompts
- [ ] Test with demo target

**Effort**: 30 minutes

---

## Task 9: Cloudflare Workflows Integration (8 hours) - P2

**Goal**: Durable execution with automatic retries

### 9.1 Workflow Setup

**Files**:
- `apps/api/wrangler.toml` (modify)
- `apps/api/src/workflows/execute-flow.ts` (create)

- [ ] Add workflow binding to wrangler.toml
- [ ] Create workflow definition
- [ ] Set up workflow routes
- [ ] Test workflow creation

**Acceptance Criteria**:
- Workflow deployed
- Binding accessible
- Can trigger workflow

**Dependencies**: None
**Effort**: 2 hours

### 9.2 Workflow Implementation

**File**: `apps/api/src/workflows/execute-flow.ts` (extend)

- [ ] Move execution logic to workflow
- [ ] Implement state management
- [ ] Add checkpoint/resume logic
- [ ] Handle workflow timeouts
- [ ] Test with sample flow

**Acceptance Criteria**:
- Flow executes in workflow
- State persists
- Can resume after failure

**Dependencies**: 9.1 complete
**Effort**: 2 hours

### 9.3 Retry Logic

**File**: `apps/api/src/workflows/execute-flow.ts` (extend)

- [ ] Retry failed steps up to 3 times
- [ ] Exponential backoff (1s, 2s, 4s)
- [ ] Save retry state
- [ ] Log retry attempts
- [ ] Track retry_count

**Acceptance Criteria**:
- Failed steps retry automatically
- Backoff works
- Retries logged

**Dependencies**: 9.2 complete
**Effort**: 1.5 hours

### 9.4 Step Status Tracking

**Files**:
- `apps/api/migrations/0007_run_step_status.sql` (create)
- `apps/api/src/workflows/execute-flow.ts` (extend)

- [ ] Update run_step table schema:
  - status: pending, running, succeeded, failed, timeout
  - retry_count
  - started_at
  - completed_at
  - result (JSON)
- [ ] Add migration
- [ ] Update step execution to track status
- [ ] Store per-step results

**Acceptance Criteria**:
- Migration runs
- Step status tracked
- Results stored

**Dependencies**: 9.3 complete
**Effort**: 1.5 hours

### 9.5 API Integration

**Files**:
- `apps/api/src/runner.ts` (modify)
- `apps/api/src/index.ts` (modify)

- [ ] Modify runner to call workflow
- [ ] Update run status endpoints
- [ ] Add workflow status checking
- [ ] Add step status endpoint

**Acceptance Criteria**:
- API triggers workflow
- Can check workflow status
- Step status accessible

**Dependencies**: 9.4 complete
**Effort**: 1 hour

### 9.6 Testing

- [ ] Test successful flow
- [ ] Test retry on failure
- [ ] Test timeout handling
- [ ] Test concurrent executions
- [ ] Verify step status accuracy

**Effort**: 1 hour

---

## Task 8: Video Recording (12 hours) - P2

**Goal**: Capture full video, not just screenshots

### 8.1 Research Phase

- [ ] Check Cloudflare Browser Rendering video support
- [ ] Test CDP Screencast API
- [ ] Evaluate ffmpeg availability
- [ ] Document findings

**Acceptance Criteria**:
- Research documented
- Approach decided
- POC working

**Dependencies**: None
**Effort**: 2 hours

### 8.2 Video Capture Implementation

**File**: `packages/runner/src/video.ts` (create)

- [ ] Implement screencast recording:
  - Option A: CDP `Page.startScreencast`
  - Option B: Puppeteer native video
  - Option C: Frame stitching
- [ ] Save video frames to buffer
- [ ] Handle 30s timeout

**Acceptance Criteria**:
- Video captures smoothly
- Works within timeout
- Frames stored

**Dependencies**: 8.1 complete
**Effort**: 3 hours

### 8.3 Video Encoding

**File**: `packages/runner/src/video.ts` (extend)

- [ ] Convert frames to WebM
- [ ] Compress video
- [ ] Upload to R2
- [ ] Generate thumbnail

**Acceptance Criteria**:
- Video playable
- File size reasonable
- Thumbnail generated

**Dependencies**: 8.2 complete
**Effort**: 2 hours

### 8.4 Frontend Integration

**File**: `apps/web/src/components/VideoPlayer.tsx` (create)

- [ ] Add video player to run details
- [ ] Show video controls (play, pause, seek)
- [ ] Enable download
- [ ] Handle different formats

**Acceptance Criteria**:
- Video plays smoothly
- Controls work
- Download works

**Dependencies**: 8.3 complete
**Effort**: 1 hour

### 8.5 Testing

- [ ] Record demo flow
- [ ] Verify video quality
- [ ] Test on different browsers
- [ ] Check file size

**Effort**: 1 hour

---

## Execution Order

### Sprint 1 (Week 1) - Quick Wins
1. **Task 4: Dashboard** (3h) - Complete Phase A
2. **Task 5: UI Polish** (4h) - Improve UX

**Total**: 7 hours

### Sprint 2 (Week 1-2) - Game Changer
3. **Task 6: Element Mapper** (8h) - Visual mapping ⭐
4. **Task 7: Smart Auth** (6h) - Authenticated flows

**Total**: 14 hours

### Sprint 3 (Week 2-3) - Integrations
5. **Task 13: Jira Integration** (8h) - Jira issues
6. **Task 10: Flow Templates** (4h) - Template library

**Total**: 12 hours

### Sprint 4 (Week 3-4) - Advanced Features
7. **Task 9: Workflows** (8h) - Durable execution
8. **Task 8: Video Recording** (12h) - Enhanced video

**Total**: 20 hours

**Grand Total**: 53 hours (~2 weeks full-time)

---

## Testing Strategy

### Unit Tests
- [ ] Dashboard components
- [ ] Element mapper logic
- [ ] Auth profile encryption
- [ ] Template validation
- [ ] Jira API client

### Integration Tests
- [ ] Dashboard API endpoints
- [ ] Element mapper backend
- [ ] Auth profile CRUD
- [ ] Template installation
- [ ] Jira webhook delivery

### E2E Tests
- [ ] Create dashboard → view charts
- [ ] Map element → save → use in flow
- [ ] Create auth profile → run authenticated flow
- [ ] Install template → execute
- [ ] Create Jira issue → verify link

---

## Success Criteria

### Phase A Complete ✅
- [x] Real-time progress (Task 1)
- [x] Screenshot gallery (Task 2)
- [x] Error handling (Task 3)
- [ ] Dashboard (Task 4)
- [ ] UI polished (Task 5)

### Phase B Complete 🟡
- [ ] Element mapper (Task 6)
- [ ] Smart auth (Task 7)
- [ ] Video recording (Task 8)
- [ ] Workflows (Task 9)
- [ ] Templates (Task 10)
- [ ] Jira integration (Task 13)

### Phase C Complete ⏳
- [ ] Multi-tenancy (Task 11)
- [ ] Analytics (Task 12)
- [ ] More integrations (Task 13)
- [ ] Performance (Task 14)
- [ ] Security (Task 15)

---

## Next Steps

1. **Start with Task 4** (Dashboard) - Quick win, completes Phase A
2. **Move to Task 6** (Element Mapper) - Game changer, high impact
3. **Continue with Task 7** (Smart Auth) - Enables critical use cases
4. **Then Task 13** (Jira) - Popular integration request
5. **Task 10** (Templates) - Easy win, user value
6. **Task 9** (Workflows) - Advanced reliability
7. **Task 8** (Video) - Nice to have

---

**Status**: Ready to execute
**Total Effort**: 53 hours
**Recommended Pace**: 1-2 sprints (2-4 weeks)
**First Task**: Task 4 - Run History Dashboard

---

**Last Updated**: March 6, 2026
**Owner**: Development Team
**Next Review**: After Sprint 1 completion
