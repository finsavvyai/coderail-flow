-- D1 migration 0003: full schema (screens, elements, users, auth, audit, run_step)

-- User table for RBAC
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES org(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user(email);

-- Screen: represents a page/view in the target app
CREATE TABLE IF NOT EXISTS screen (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id)
);
CREATE INDEX IF NOT EXISTS idx_screen_project ON screen(project_id, name);

-- Element: mapped UI element with locators
CREATE TABLE IF NOT EXISTS element (
  id TEXT PRIMARY KEY,
  screen_id TEXT NOT NULL,
  name TEXT NOT NULL,
  locator_primary TEXT NOT NULL,
  locator_fallbacks TEXT,
  reliability_score REAL NOT NULL DEFAULT 0.5,
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (screen_id) REFERENCES screen(id),
  FOREIGN KEY (created_by) REFERENCES user(id)
);
CREATE INDEX IF NOT EXISTS idx_element_screen ON element(screen_id, name);

-- Auth profile: stored credentials for target app
CREATE TABLE IF NOT EXISTS auth_profile (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  encrypted_payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id)
);
CREATE INDEX IF NOT EXISTS idx_auth_profile_project ON auth_profile(project_id);

-- Run step: individual step execution record
CREATE TABLE IF NOT EXISTS run_step (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  idx INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TEXT,
  finished_at TEXT,
  detail TEXT,
  FOREIGN KEY (run_id) REFERENCES run(id)
);
CREATE INDEX IF NOT EXISTS idx_run_step_run ON run_step(run_id, idx);

-- Audit log: track all actions
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  detail TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES org(id),
  FOREIGN KEY (actor_user_id) REFERENCES user(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_log_org ON audit_log(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log(target_type, target_id);
