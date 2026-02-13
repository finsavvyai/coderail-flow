-- D1 migration 0001: core schema (minimal)

CREATE TABLE IF NOT EXISTS org (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  env TEXT NOT NULL DEFAULT 'dev',
  created_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES org(id)
);

CREATE TABLE IF NOT EXISTS flow (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id)
);

CREATE TABLE IF NOT EXISTS flow_version (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  definition TEXT NOT NULL, -- JSON
  changelog TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(flow_id, version),
  FOREIGN KEY (flow_id) REFERENCES flow(id)
);

CREATE TABLE IF NOT EXISTS run (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  flow_version INTEGER NOT NULL,
  status TEXT NOT NULL,
  params TEXT NOT NULL, -- JSON
  runner_version TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (flow_id) REFERENCES flow(id)
);

CREATE TABLE IF NOT EXISTS artifact (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  r2_key TEXT,
  content_type TEXT,
  bytes INTEGER NOT NULL DEFAULT 0,
  sha256 TEXT,
  created_at TEXT NOT NULL,
  inline_content TEXT, -- starter only
  FOREIGN KEY (run_id) REFERENCES run(id)
);

CREATE INDEX IF NOT EXISTS idx_run_flow_created ON run(flow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_run_kind ON artifact(run_id, kind);
