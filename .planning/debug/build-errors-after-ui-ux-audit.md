---
status: awaiting_human_verify
trigger: "Build/compile errors after recent UI/UX audit changes"
created: 2026-03-09T00:00:00Z
updated: 2026-03-09T00:01:00Z
---

## Current Focus

hypothesis: CONFIRMED - audit introduced ESLint config without browser globals, created files with floating promises, and had formatting issues
test: Run eslint, tsc, vite build
expecting: Clean builds with only pre-existing errors remaining
next_action: Await human verification

## Symptoms

expected: Clean build - TypeScript compiles, bundler succeeds, lint passes
actual: 556 ESLint errors, plus TypeScript test file errors
errors: no-undef (missing browser globals), no-floating-promises, no-misused-promises, prettier formatting, unused vars
reproduction: Run eslint apps/web/src/ui/
started: After UI/UX audit commits (6cd9211 and a459c5c)

## Eliminated

- hypothesis: TypeScript source code errors in production files
  evidence: Vite build passes clean (2507 modules transformed). Only tsc errors in non-test files are pre-existing Toast/EnhancedUI casing issue
  timestamp: 2026-03-09

- hypothesis: Missing package dependencies (lucide-react etc)
  evidence: lucide-react installed in apps/web/node_modules, Vite build resolves all imports
  timestamp: 2026-03-09

## Evidence

- timestamp: 2026-03-09
  checked: Vite production build
  found: Passes clean (2507 modules, 1.52s)
  implication: Production code compiles fine, issues are lint/typecheck only

- timestamp: 2026-03-09
  checked: TypeScript check (tsc --noEmit)
  found: 19 errors, ALL in test files or pre-existing EnhancedUI/Toast casing issue
  implication: No new TypeScript errors in production source

- timestamp: 2026-03-09
  checked: ESLint (apps/web/src/ui/)
  found: 556 errors initially. Root causes: (1) eslint.config.js missing browser globals, (2) 28+ floating promises in new files, (3) 247 prettier formatting issues, (4) missing test globals
  implication: Audit created eslint.config.js but misconfigured it for browser/React code

- timestamp: 2026-03-09
  checked: API TypeScript check
  found: All API errors pre-existing (audit did not modify any API files)
  implication: API not affected by audit

## Resolution

root_cause: The UI/UX audit (commits 6cd9211 and a459c5c) introduced an ESLint flat config (eslint.config.js) that was missing browser globals (fetch, window, document, console, HTMLElement, etc.), React/JSX globals, and test globals. Additionally, ~20 new source files had unhandled floating promises (async functions called without void/await in useEffect callbacks and event handlers), and all new files had prettier formatting inconsistencies.

fix: |
  1. Fixed eslint.config.js: Added browser globals, JSX global, separate web/api configs, test file overrides with vitest globals, configured no-misused-promises to allow async JSX attributes
  2. Added void operator to ~25 floating promise calls across 15 files (useEffect async calls, navigator.clipboard, setInterval with async callbacks)
  3. Auto-fixed 247 prettier formatting errors via eslint --fix
  4. Fixed unused variable (projectId -> _projectId in CookieImportModal.tsx)
  5. Fixed useless assignment in Tooltip.tsx (refactored switch to object lookup)
  6. Fixed empty catch block in ScheduleManager.tsx

verification: |
  - Vite build: PASSES (2507 modules, 1.52s)
  - ESLint: 2 errors remaining (both pre-existing Toast casing issues), 117 warnings (no-explicit-any)
  - TypeScript non-test: only pre-existing EnhancedUI/Toast casing errors
  - Before: 556 ESLint errors -> After: 2 errors (pre-existing only)

files_changed:
  - eslint.config.js
  - apps/web/src/ui/AnalyticsDashboard.tsx
  - apps/web/src/ui/BillingPage.tsx
  - apps/web/src/ui/CookieImportModal.tsx
  - apps/web/src/ui/DashboardPage.tsx
  - apps/web/src/ui/ElementMapper.tsx
  - apps/web/src/ui/FlowTemplates.tsx
  - apps/web/src/ui/IntegrationList.tsx
  - apps/web/src/ui/JiraIntegrationForm.tsx
  - apps/web/src/ui/LiveProgress.tsx
  - apps/web/src/ui/OnboardingWizard.tsx
  - apps/web/src/ui/ProjectManager.tsx
  - apps/web/src/ui/RunProgress.tsx
  - apps/web/src/ui/ScheduleManager.tsx
  - apps/web/src/ui/ShareToSlackModal.tsx
  - apps/web/src/ui/Tooltip.tsx
  - apps/web/src/ui/useCookieProfiles.ts
  - apps/web/src/ui/useFlowBuilder.ts
  - apps/web/src/ui/useFlowTest.ts
  - apps/web/src/ui/useIntegrations.ts
  - apps/web/src/ui/useJiraConfig.ts
  - apps/web/src/ui/useProjectManager.ts
