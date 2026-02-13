# 🎯 CodeRail Flow - Next Steps Checklist

**Phase 1 Status**: ✅ Complete
**Current Completion**: 70-75%
**Ready For**: Testing & Deployment

---

## 🚀 Immediate Actions (Do This First!)

### 1. Verify Installation

- [ ] Run `./verify-phase1.sh` and ensure all checks pass
- [ ] Check Node.js version: `node -v` (need v20+)
- [ ] Check pnpm: `pnpm -v`
- [ ] Verify overlay build: `ls packages/overlay/dist/`

### 2. Set Up Cloudflare Resources

- [ ] Login to Cloudflare: `wrangler login`
- [ ] Create D1 database:
  ```bash
  wrangler d1 create coderail-flow-db
  ```
- [ ] Copy database_id to `apps/api/wrangler.toml` (line 9)
- [ ] Apply migrations:
  ```bash
  cd apps/api
  pnpm run migrate
  cd ../..
  ```
- [ ] (Optional) Create R2 bucket:
  ```bash
  wrangler r2 bucket create coderail-flow-artifacts
  ```

### 3. Test Locally

- [ ] Terminal 1: Start API
  ```bash
  cd apps/api
  pnpm run dev
  # Should start on http://localhost:8787
  ```
- [ ] Terminal 2: Start Web UI
  ```bash
  cd apps/web
  pnpm run dev
  # Should start on http://localhost:5173
  ```
- [ ] Open http://localhost:5173 in browser
- [ ] See demo flow listed
- [ ] Click "Run Flow"
- [ ] Enter cardId: `****7842`
- [ ] Watch execution status
- [ ] Download artifacts (report + SRT)

### 4. Verify Artifacts

- [ ] Check run completed successfully
- [ ] Download JSON report - verify it contains:
  - `runId`
  - `status: "succeeded"`
  - `steps` array with results
  - `duration` in milliseconds
- [ ] Download SRT subtitle - verify format:
  ```srt
  1
  00:00:00,000 --> 00:00:03,000
  Opening the admin dashboard
  ...
  ```
- [ ] Check screenshots were captured (in DB or R2)

---

## 📋 Phase 2 Planning

### Week 1-2: Mapping Mode UI

**Goal**: Visual element picker for non-technical users

**Tasks**:
- [ ] Create `/projects/:id/screens/:id/map` route
- [ ] Build browser picker UI (hover to highlight)
- [ ] Implement click-to-select element capture
- [ ] Extract locators automatically (testid, role, etc.)
- [ ] Show reliability score in UI
- [ ] Save elements to database via API
- [ ] Test mapping 5+ elements without code

**Acceptance**: PM can map elements by clicking in browser

---

### Week 3: Authentication System

**Goal**: Flows can authenticate into protected apps

**Tasks**:
- [ ] Design auth_profile schema (already exists in migrations)
- [ ] Build cookie import UI (JSON upload)
- [ ] Encrypt cookies before storing
- [ ] Apply cookies before flow execution in executor
- [ ] Test login flow with protected app
- [ ] (Optional) Build login recipe feature

**Acceptance**: Flow executes successfully on protected pages

---

### Week 4: Workflow Integration

**Goal**: Durable, reliable execution with retries

**Tasks**:
- [ ] Replace inline execution with Cloudflare Workflows
- [ ] Configure workflow binding in wrangler.toml
- [ ] Implement retry logic (3 attempts)
- [ ] Add timeout handling (5min max)
- [ ] Update run_step table with per-step status
- [ ] Test workflow failure recovery
- [ ] Test concurrent executions

**Acceptance**: Runs recover from failures automatically

---

### Week 5: Video Recording

**Goal**: Full video capture (not just screenshots)

**Tasks**:
- [ ] Research CDP screencast API
- [ ] Implement video recording in executor
- [ ] Save WebM output to R2
- [ ] Test video playback
- [ ] (Optional) Implement MP4 muxing with ffmpeg

**Acceptance**: Download and play execution videos

---

### Week 6: Production Hardening

**Goal**: Enterprise-ready deployment

**Tasks**:
- [ ] Implement RBAC (users, roles, permissions)
- [ ] Add audit logging to all mutations
- [ ] Set up error monitoring (Sentry/Cloudflare)
- [ ] Configure rate limiting
- [ ] Add retries for R2 uploads
- [ ] Write integration tests
- [ ] Load test with 10 concurrent runs
- [ ] Set up CI/CD pipeline

**Acceptance**: Production deployment with monitoring

---

## 🛠️ Advanced Features (Phase 3+)

### Nice-to-Have Features

- [ ] `selectRow` step - Table row selection
- [ ] `assertText` step - Text validation
- [ ] `screenshot` step - Manual screenshot capture
- [ ] TTS audio generation - Narration voiceover
- [ ] MP4 muxing - Video + audio combine
- [ ] Redaction/masking - PII protection
- [ ] Flow builder UI - Drag-and-drop interface
- [ ] Schedule triggers - Cron-based execution
- [ ] Webhooks - Post-run notifications
- [ ] API key auth - Programmatic access
- [ ] Multi-language subtitles - i18n support

---

## 📊 Success Criteria

### MVP Launch (End of Phase 2)

- [ ] 5+ real flows running in production
- [ ] Mapping mode used by non-developers
- [ ] Authentication working for 2+ apps
- [ ] Workflows handling failures gracefully
- [ ] Video recordings available for download
- [ ] < 5% error rate on runs
- [ ] < 30s execution time for typical flows

### Production Ready (End of Phase 3)

- [ ] 50+ flows in production
- [ ] Multi-tenant with RBAC
- [ ] 99% uptime
- [ ] Full audit logging
- [ ] Error monitoring active
- [ ] Load tested for 100 concurrent runs
- [ ] Documentation for end users

---

## 🐛 Known Issues to Track

### Current Limitations

- [ ] No video recording (only screenshots)
- [ ] No TTS audio generation
- [ ] Inline execution (not durable yet)
- [ ] No cookie authentication
- [ ] No mapping mode UI
- [ ] No RBAC/user management
- [ ] No audit logging implementation

**All tracked in Phase 2+ roadmap above.**

---

## 📚 Learning & Research

### Recommended Reading

- [ ] [Cloudflare Browser Rendering Docs](https://developers.cloudflare.com/browser-rendering/)
- [ ] [Puppeteer Best Practices](https://pptr.dev/guides/best-practices)
- [ ] [Cloudflare Workflows Guide](https://developers.cloudflare.com/workflows/)
- [ ] [R2 Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [ ] [D1 Performance Tips](https://developers.cloudflare.com/d1/platform/limits/)

### Community

- [ ] Join Cloudflare Discord
- [ ] Follow Cloudflare Workers on Twitter
- [ ] Star relevant GitHub repos

---

## 💡 Ideas for Improvement

### User Experience

- [ ] Real-time execution progress (WebSocket)
- [ ] Artifact preview in UI (no download needed)
- [ ] Flow templates library
- [ ] Diff view for flow versions
- [ ] Search/filter runs
- [ ] Bulk run operations

### Developer Experience

- [ ] Flow validation before execution
- [ ] Dry-run mode (no actual clicks)
- [ ] Element inspector Chrome extension
- [ ] CLI for flow management
- [ ] Terraform/IaC for deployment

### Performance

- [ ] Screenshot compression
- [ ] Parallel step execution (where safe)
- [ ] Caching for repeated elements
- [ ] Incremental artifact uploads

---

## 🎯 Monthly Goals

### Month 1 (Current)
- [x] Phase 1: Core automation complete
- [ ] Test with 3 real applications
- [ ] Deploy to Cloudflare staging

### Month 2
- [ ] Phase 2: Mapping mode + auth
- [ ] Onboard 2 beta users
- [ ] Collect feedback

### Month 3
- [ ] Phase 2: Workflows + video
- [ ] Scale to 20 flows
- [ ] Production deployment

### Month 4
- [ ] Phase 3: Hardening
- [ ] Full RBAC
- [ ] General availability launch

---

## 🚦 Current Blockers

### None! 🎉

Phase 1 is complete with no blockers. You can proceed directly to testing and Phase 2 planning.

### Potential Future Blockers

- **Cloudflare Browser Rendering Limits** - May need to contact Cloudflare for higher limits
- **R2 Storage Costs** - Monitor artifact size growth
- **Execution Time Limits** - Workers have max execution time

**Recommendation**: Start tracking metrics now to avoid surprises.

---

## 📞 Support Resources

### Internal Docs

- [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) - Implementation details
- [QUICKSTART.md](QUICKSTART.md) - Setup guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Architecture overview

### External Help

- Cloudflare Community: https://community.cloudflare.com/
- Puppeteer Issues: https://github.com/puppeteer/puppeteer/issues
- Hono Docs: https://hono.dev/

---

## ✅ Completion Checklist

**Before moving to Phase 2, ensure**:

- [x] Phase 1 verification passed
- [ ] Demo flow executed successfully
- [ ] Artifacts downloaded and verified
- [ ] Documentation reviewed
- [ ] Architecture understood
- [ ] Cloudflare resources configured
- [ ] Team trained on new features

---

**Last Updated**: January 2, 2026
**Next Review**: After first production test
**Status**: Ready to Proceed! 🚀
