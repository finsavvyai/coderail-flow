# CodeRail Flow - Complete Task List

**Project Status**: Phase 1 Complete ✅ | Moving to Quick Wins Phase

**Last Updated**: January 7, 2026

---

## 🎯 PHASE A: QUICK WINS (2-3 Days)

### Task 1: Real-time Execution Status UI (4 hours) ✅ COMPLETE

**Goal**: Show live progress instead of just "running..."

- [x] Backend: Add progress streaming to runner
  - [x] Modify `packages/runner/src/executor.ts` to emit progress events
  - [x] Create progress callback interface: `onProgress(step, total, status, description)`
  - [x] Add polling endpoint in `apps/api/src/index.ts`
- [x] Frontend: Build live progress component
  - [x] Create `apps/web/src/ui/LiveProgress.tsx`
  - [x] Add progress bar with percentage
  - [x] Show current step description
  - [x] Display "Step X of Y" counter
  - [x] Add polling mechanism
  - [x] Integrate into App.tsx
- [x] Testing
  - [x] Test with demo flow
  - [x] Verify progress updates in real-time
  - [x] Test error states

**See [TASK1_COMPLETE.md](TASK1_COMPLETE.md) for full details**

**Files to create/modify**:
- `packages/runner/src/executor.ts` (modify)
- `apps/api/src/index.ts` (modify)
- `apps/web/src/components/LiveProgress.tsx` (create)
- `apps/web/src/pages/RunDetail.tsx` (modify)

---

### Task 2: Screenshot Gallery (3 hours) ✅ COMPLETE

**Goal**: View screenshots inline without downloading

- [x] Backend: Screenshot preview endpoint
  - [x] Add `GET /artifacts/:id/preview` to `apps/api/src/index.ts`
  - [x] Return inline content with caching headers
  - [x] Add proper cache-control headers
- [x] Frontend: Gallery component
  - [x] Create `apps/web/src/ui/ScreenshotGallery.tsx`
  - [x] Build grid layout for thumbnails
  - [x] Add lightbox/modal for full-size view
  - [x] Show step labels with each screenshot
  - [x] Add navigation controls (prev/next)
  - [x] Add download button per screenshot
- [x] Integration
  - [x] Add Screenshots section to run details
  - [x] Filter artifacts for screenshots
  - [x] Handle empty state
- [x] Testing
  - [x] Test with multiple screenshots
  - [x] Verify lightbox functionality
  - [x] Keyboard navigation

**Files to create/modify**:
- `apps/api/src/index.ts` (modify)
- `apps/web/src/components/ScreenshotGallery.tsx` (create)
- `apps/web/src/pages/RunDetail.tsx` (modify)

---

### Task 3: Better Error Handling (2 hours) ✅ COMPLETE

**Goal**: Show exactly what went wrong when flows fail

- [x] Backend: Error details endpoint
  - [x] Ensure error screenshots are captured (already done)
  - [x] Add error context to run record (already exists)
  - [x] Return full error details in API
- [x] Frontend: Error display component
  - [x] Create `apps/web/src/ui/ErrorDisplay.tsx`
  - [x] Show error screenshot prominently
  - [x] Display error message clearly
  - [x] Add expandable details section
  - [x] Show troubleshooting tips
  - [x] Add "Retry" button with loading state
- [x] Integration
  - [x] Update run detail page for failed runs
  - [x] Add retry endpoint `POST /runs/:id/retry`
  - [x] Wire up retry handler in App
- [x] Testing
  - [x] Trigger intentional error
  - [x] Verify error screenshot displays
  - [x] Test retry functionality

**Files to create/modify**:
- `apps/web/src/components/ErrorDisplay.tsx` (create)
- `apps/api/src/index.ts` (modify - add retry endpoint)
- `apps/web/src/pages/RunDetail.tsx` (modify)

---

### Task 4: Run History Dashboard (3 hours)

**Goal**: Overview of all runs with statistics

- [ ] Backend: Analytics endpoint
  - [ ] Create `GET /stats` endpoint in `apps/api/src/index.ts`
  - [ ] Query for:
    - Total runs
    - Success/failure counts
    - Average duration
    - Runs per flow
    - Runs over time
  - [ ] Add date range filtering
- [ ] Frontend: Dashboard page
  - [ ] Create `apps/web/src/pages/Dashboard.tsx`
  - [ ] Install charting library (recharts or chart.js)
  - [ ] Build success rate pie chart
  - [ ] Show average execution time
  - [ ] Create recent runs table
  - [ ] Add most popular flows list
  - [ ] Show trends over time
- [ ] Navigation
  - [ ] Add dashboard link to main nav
  - [ ] Make it the home page
- [ ] Testing
  - [ ] Verify statistics are accurate
  - [ ] Test with various date ranges

**Files to create/modify**:
- `apps/api/src/index.ts` (modify - add stats endpoint)
- `apps/web/src/pages/Dashboard.tsx` (create)
- `apps/web/package.json` (add chart library)

---

### Task 5: UI Polish (4 hours)

**Goal**: Make it look professional and modern

- [ ] Design system setup
  - [ ] Configure Tailwind CSS properly
  - [ ] Create custom theme in `tailwind.config.js`:
    - Primary color (blue)
    - Success (green)
    - Error (red)
    - Warning (yellow)
  - [ ] Define typography scale
  - [ ] Set up spacing system
- [ ] Component improvements
  - [ ] Replace spinners with skeleton loaders
  - [ ] Add toast notification system (react-hot-toast)
  - [ ] Implement smooth transitions
  - [ ] Add loading states to all buttons
  - [ ] Improve form styling
- [ ] Dark mode
  - [ ] Add dark mode toggle component
  - [ ] Implement theme switching
  - [ ] Update all components for dark mode
  - [ ] Save preference to localStorage
- [ ] Responsive design
  - [ ] Test on mobile (375px)
  - [ ] Test on tablet (768px)
  - [ ] Fix any layout issues
  - [ ] Make tables scrollable on mobile
- [ ] Testing
  - [ ] Visual testing on all pages
  - [ ] Test dark mode toggle
  - [ ] Verify responsive behavior

**Files to create/modify**:
- `apps/web/tailwind.config.js` (modify)
- `apps/web/src/components/ThemeToggle.tsx` (create)
- `apps/web/src/components/Toast.tsx` (create)
- All component files (modify for styling)

---

## 🚀 PHASE B: KILLER FEATURES (1-2 Weeks)

### Task 6: Visual Element Mapper (8 hours) ⭐ GAME CHANGER

**Goal**: Click elements in browser to map them automatically

- [ ] Mapping mode infrastructure
  - [ ] Create route: `apps/web/src/pages/ElementMapper.tsx`
  - [ ] Add "Map Elements" button to screen detail page
  - [ ] Create iframe wrapper for target site
- [ ] Hover overlay system
  - [ ] Create `packages/overlay/src/mapper.ts`
  - [ ] Inject mouseover handler
  - [ ] Highlight element on hover
  - [ ] Show element info tooltip (tag, id, classes)
- [ ] Click capture system
  - [ ] Capture click event
  - [ ] Extract all possible locators:
    - `data-testid`
    - `role` + `name`
    - `id`
    - `class` (unique)
    - CSS selector
    - XPath
  - [ ] Calculate reliability score for each
  - [ ] Rank locators (testid best, xpath worst)
- [ ] Locator preview
  - [ ] Show preview: "This locator is 95% reliable"
  - [ ] Allow user to select preferred locator
  - [ ] Show fallback chain
  - [ ] Test locator in real-time
- [ ] Backend integration
  - [ ] Save element to database via API
  - [ ] Store locator and fallbacks
  - [ ] Update element API to accept reliability_score
- [ ] Testing
  - [ ] Map 10+ different element types
  - [ ] Verify locators work in executor
  - [ ] Test on complex pages

**Files to create/modify**:
- `apps/web/src/pages/ElementMapper.tsx` (create)
- `packages/overlay/src/mapper.ts` (create)
- `apps/api/src/index.ts` (modify - enhance element endpoints)

---

### Task 7: Smart Authentication (6 hours)

**Goal**: Enable flows to access authenticated pages

- [ ] Cookie import UI
  - [ ] Create `apps/web/src/pages/AuthProfile.tsx`
  - [ ] Add "Create Auth Profile" button
  - [ ] Build JSON upload component
  - [ ] Show cookie preview table
  - [ ] Validate cookie format
  - [ ] Encrypt cookies before sending to API
- [ ] Backend storage
  - [ ] Create migration if not exists: `apps/api/migrations/0006_auth_profiles.sql`
  - [ ] Add auth profile CRUD endpoints
  - [ ] Encrypt cookies before storing in D1
  - [ ] Add auth_profile_id to flow table
- [ ] Executor integration
  - [ ] Modify `packages/runner/src/executor.ts`
  - [ ] Load auth profile for flow
  - [ ] Decrypt cookies
  - [ ] Apply cookies before first navigation:
    ```typescript
    await page.setCookie(...cookies);
    ```
  - [ ] Verify session is valid
- [ ] Session management
  - [ ] Test if session expired
  - [ ] Auto-refresh if possible
  - [ ] Handle multi-account scenarios
- [ ] Testing
  - [ ] Test with authenticated app
  - [ ] Verify cookies applied correctly
  - [ ] Test session expiration handling

**Files to create/modify**:
- `apps/web/src/pages/AuthProfile.tsx` (create)
- `apps/api/migrations/0006_auth_profiles.sql` (create if needed)
- `apps/api/src/index.ts` (modify - add auth endpoints)
- `packages/runner/src/executor.ts` (modify)

---

### Task 8: Video Recording (12 hours)

**Goal**: Capture full video, not just screenshots

- [ ] Research phase
  - [ ] Check Cloudflare Browser Rendering video support
  - [ ] Test CDP Screencast API
  - [ ] Evaluate ffmpeg availability
- [ ] Video capture implementation
  - [ ] Implement screencast recording in executor
  - [ ] Option A: CDP `Page.startScreencast`
  - [ ] Option B: Puppeteer native video
  - [ ] Option C: Frame stitching
  - [ ] Save video frames to buffer
- [ ] Video encoding
  - [ ] Convert frames to WebM
  - [ ] Compress video for smaller file size
  - [ ] Upload to R2
  - [ ] Generate thumbnail
- [ ] TTS narration (optional)
  - [ ] Integrate Text-to-Speech API
  - [ ] Generate audio from step narrations
  - [ ] Sync audio with video timeline
  - [ ] Mux audio + video
- [ ] Frontend integration
  - [ ] Add video player to run details
  - [ ] Show video instead of screenshot gallery
  - [ ] Add video controls (play, pause, seek)
  - [ ] Enable download
- [ ] Testing
  - [ ] Record demo flow
  - [ ] Verify video quality
  - [ ] Test on different browsers
  - [ ] Check file size

**Files to create/modify**:
- `packages/runner/src/video.ts` (create)
- `packages/runner/src/executor.ts` (modify)
- `apps/web/src/components/VideoPlayer.tsx` (create)
- `apps/api/src/index.ts` (modify - video download endpoint)

---

### Task 9: Cloudflare Workflows Integration (8 hours)

**Goal**: Durable execution with automatic retries

- [ ] Workflow setup
  - [ ] Add workflow binding in `apps/api/wrangler.toml`
  - [ ] Create workflow definition
  - [ ] Set up workflow routes
- [ ] Workflow implementation
  - [ ] Create `apps/api/src/workflows/execute-flow.ts`
  - [ ] Move execution logic to workflow
  - [ ] Implement state management
  - [ ] Add checkpoint/resume logic
- [ ] Retry logic
  - [ ] Retry failed steps up to 3 times
  - [ ] Exponential backoff (1s, 2s, 4s)
  - [ ] Save retry state
  - [ ] Log retry attempts
- [ ] Timeout handling
  - [ ] Set 5-minute timeout per step
  - [ ] Set 30-minute timeout for full flow
  - [ ] Handle timeout gracefully
  - [ ] Mark as timeout failure
- [ ] Step status tracking
  - [ ] Update `run_step` table schema
  - [ ] Add status: pending, running, succeeded, failed, timeout
  - [ ] Add retry_count
  - [ ] Add started_at, completed_at
  - [ ] Store per-step results
- [ ] API integration
  - [ ] Modify `apps/api/src/runner.ts` to call workflow
  - [ ] Update run status endpoints
  - [ ] Add workflow status checking
- [ ] Testing
  - [ ] Test successful flow
  - [ ] Test retry on failure
  - [ ] Test timeout handling
  - [ ] Test concurrent executions

**Files to create/modify**:
- `apps/api/wrangler.toml` (modify)
- `apps/api/src/workflows/execute-flow.ts` (create)
- `apps/api/src/runner.ts` (modify)
- `apps/api/migrations/0007_run_step_status.sql` (create)

---

### Task 10: Flow Templates Library (4 hours)

**Goal**: Pre-built flows users can install instantly

- [ ] Template definition format
  - [ ] Create template schema in `packages/dsl/src/template.ts`
  - [ ] Define template metadata (name, description, category)
  - [ ] Define required parameters
  - [ ] Include screens and elements
- [ ] Create templates
  - [ ] Bug Report Generator template
  - [ ] Feature Walkthrough template
  - [ ] User Onboarding template
  - [ ] API Demo template
  - [ ] E-commerce Checkout template
  - [ ] Save as JSON in `apps/api/templates/`
- [ ] Template catalog page
  - [ ] Create `apps/web/src/pages/Templates.tsx`
  - [ ] Show template grid with cards
  - [ ] Add category filters
  - [ ] Show template preview
  - [ ] Add search functionality
- [ ] Template installation
  - [ ] Add `POST /flows/from-template` endpoint
  - [ ] Parse template JSON
  - [ ] Create flow, screens, elements
  - [ ] Prompt for required params
  - [ ] Redirect to flow detail
- [ ] Testing
  - [ ] Install each template
  - [ ] Run installed flows
  - [ ] Verify all steps work

**Files to create/modify**:
- `packages/dsl/src/template.ts` (create)
- `apps/api/templates/*.json` (create multiple)
- `apps/web/src/pages/Templates.tsx` (create)
- `apps/api/src/index.ts` (modify - add template endpoint)

---

## 🏢 PHASE C: ENTERPRISE FEATURES (2-4 Weeks)

### Task 11: Multi-tenancy & RBAC (12 hours)

- [ ] Schema design
  - [ ] Create organization table
  - [ ] Create user table
  - [ ] Create role table
  - [ ] Create permission table
  - [ ] Link resources to organizations
- [ ] Authentication system
  - [ ] Integrate Cloudflare Access or custom auth
  - [ ] JWT token generation
  - [ ] Session management
  - [ ] Logout functionality
- [ ] Authorization middleware
  - [ ] Check user permissions
  - [ ] Enforce tenant isolation
  - [ ] Add role-based access control
- [ ] User management UI
  - [ ] Organization settings page
  - [ ] User list with roles
  - [ ] Invite user flow
  - [ ] Role assignment
- [ ] Testing
  - [ ] Test different roles (admin, editor, viewer)
  - [ ] Verify tenant isolation
  - [ ] Test invite flow

**Files to create**:
- `apps/api/migrations/0008_multi_tenancy.sql`
- `apps/api/src/auth.ts`
- `apps/web/src/pages/Settings/Organization.tsx`
- `apps/web/src/pages/Settings/Users.tsx`

---

### Task 12: Analytics & Insights (8 hours)

- [ ] Performance metrics
  - [ ] Track execution time per step
  - [ ] Track success/failure rates
  - [ ] Track element reliability
  - [ ] Store metrics in D1 or Analytics Engine
- [ ] Dashboard implementation
  - [ ] Create analytics dashboard page
  - [ ] Show flow performance metrics
  - [ ] Display reliability trends
  - [ ] Add date range filters
- [ ] Reporting
  - [ ] Generate PDF reports
  - [ ] Export to CSV
  - [ ] Schedule email reports
- [ ] Testing
  - [ ] Verify metric accuracy
  - [ ] Test report generation

**Files to create**:
- `apps/web/src/pages/Analytics.tsx`
- `apps/api/src/analytics.ts`

---

### Task 13: Integrations (16 hours)

- [ ] Slack integration
  - [ ] Create Slack app
  - [ ] Add webhook endpoint
  - [ ] Send notification on run complete
  - [ ] Format message with screenshots
- [ ] Jira integration
  - [ ] Authenticate with Jira API
  - [ ] Create issue with video attached
  - [ ] Link runs to issues
- [ ] GitHub integration
  - [ ] Link flows to repositories
  - [ ] Create issues with recordings
  - [ ] Comment on PRs
- [ ] Webhook system
  - [ ] Generic webhook endpoint
  - [ ] Trigger on run complete
  - [ ] Retry on failure
- [ ] Testing
  - [ ] Test each integration
  - [ ] Verify notifications sent

**Files to create**:
- `apps/api/src/integrations/slack.ts`
- `apps/api/src/integrations/jira.ts`
- `apps/api/src/integrations/github.ts`
- `apps/api/src/integrations/webhook.ts`

---

### Task 14: Performance Optimization (12 hours)

- [ ] Parallel execution
  - [ ] Identify independent steps
  - [ ] Execute in parallel where safe
  - [ ] Merge results
- [ ] Caching
  - [ ] Cache element lookups
  - [ ] Cache screen data
  - [ ] Use Cloudflare KV for cache
- [ ] Screenshot optimization
  - [ ] Convert PNG to WebP
  - [ ] Compress images
  - [ ] Lazy load in UI
- [ ] Edge deployment
  - [ ] Optimize worker bundle size
  - [ ] Use service bindings
  - [ ] Minimize cold starts
- [ ] Testing
  - [ ] Benchmark execution time
  - [ ] Measure improvement
  - [ ] Load test with 100 concurrent runs

**Files to modify**:
- `packages/runner/src/executor.ts`
- `apps/api/src/cache.ts` (create)

---

### Task 15: Security & Compliance (16 hours)

- [ ] PII redaction
  - [ ] Detect sensitive data in screenshots
  - [ ] Blur or mask PII
  - [ ] Add redaction rules
- [ ] Audit logging
  - [ ] Log all mutations
  - [ ] Store who did what when
  - [ ] Build audit log viewer
- [ ] SSO integration
  - [ ] Implement SAML
  - [ ] Add OAuth support
  - [ ] Test with providers
- [ ] Data encryption
  - [ ] Encrypt sensitive data at rest
  - [ ] Use Cloudflare KMS
  - [ ] Rotate encryption keys
- [ ] Compliance
  - [ ] GDPR compliance (data export, deletion)
  - [ ] Add privacy policy
  - [ ] Implement data retention policies
- [ ] Testing
  - [ ] Penetration testing
  - [ ] Security audit
  - [ ] Compliance verification

**Files to create**:
- `apps/api/src/security/pii-redaction.ts`
- `apps/api/src/security/audit-log.ts`
- `apps/api/src/security/sso.ts`
- `apps/api/migrations/0009_audit_log.sql`

---

## 📋 MAINTENANCE & OPERATIONS

### Documentation

- [ ] Update README with new features
- [ ] Write user guide
- [ ] Create video tutorials
- [ ] API documentation
- [ ] Architecture diagrams
- [ ] Deployment guide

### Testing

- [ ] Unit tests for runner package
- [ ] Integration tests for API
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Load testing
- [ ] Security testing

### DevOps

- [ ] Set up CI/CD pipeline
- [ ] Automated testing in CI
- [ ] Staging environment
- [ ] Production deployment
- [ ] Monitoring and alerting
- [ ] Error tracking (Sentry)

### Performance Monitoring

- [ ] Set up Cloudflare Analytics
- [ ] Track execution metrics
- [ ] Monitor error rates
- [ ] Set up alerts for failures

---

## 🎯 PRIORITY ORDER

### Do This First (Week 1)
1. ✅ Verify Phase 1 setup
2. Task 1: Real-time execution UI
3. Task 2: Screenshot gallery
4. Task 3: Error handling
5. Task 5: UI polish (basic)

### Do This Next (Week 2)
6. Task 6: Visual element mapper ⭐ (CRITICAL)
7. Task 7: Smart authentication
8. Task 4: Dashboard

### After That (Week 3-4)
9. Task 9: Cloudflare Workflows
10. Task 8: Video recording
11. Task 10: Templates library

### Enterprise Phase (Week 5+)
12. Task 11: Multi-tenancy
13. Task 12: Analytics
14. Task 13: Integrations
15. Task 14: Performance
16. Task 15: Security

---

## ✅ COMPLETION CHECKLIST

Mark with [x] when done:

### Phase A Complete When:
- [ ] Real-time progress shows during execution
- [ ] Screenshots visible inline
- [ ] Errors show helpful context
- [ ] Dashboard shows statistics
- [ ] UI looks professional

### Phase B Complete When:
- [ ] Element mapper works without code
- [ ] Authenticated flows execute successfully
- [ ] Video recordings available
- [ ] Workflows handle failures gracefully
- [ ] Templates can be installed

### Phase C Complete When:
- [ ] Multi-tenant with RBAC
- [ ] 3+ integrations working
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Ready for production

---

**Current Status**: Starting Phase A
**Next Task**: Task 1 - Real-time Execution UI
**Target Completion**: 6-8 weeks for all phases

