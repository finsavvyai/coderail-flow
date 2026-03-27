-- D1 migration 0008: integrations, webhooks, API keys

-- API keys for external access (GitLab CI, GitHub Actions, CLI)
CREATE TABLE IF NOT EXISTS api_key (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,        -- first 8 chars for display
  scopes TEXT NOT NULL DEFAULT '["runs:write","flows:read"]',
  last_used_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_key_hash ON api_key(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_key_user ON api_key(user_id);

-- Integration configs (Slack, GitLab, GitHub, generic webhook)
CREATE TABLE IF NOT EXISTS integration (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  type TEXT NOT NULL,               -- 'slack' | 'gitlab' | 'github' | 'webhook' | 'email'
  name TEXT NOT NULL,
  config TEXT NOT NULL DEFAULT '{}', -- JSON: webhook_url, channel, token, etc.
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES project(id)
);

CREATE INDEX IF NOT EXISTS idx_integration_project ON integration(project_id);
CREATE INDEX IF NOT EXISTS idx_integration_type ON integration(type);

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_delivery (
  id TEXT PRIMARY KEY,
  integration_id TEXT NOT NULL,
  run_id TEXT,
  event TEXT NOT NULL,              -- 'run.completed' | 'run.failed' | 'flow.created'
  payload TEXT NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL,
  FOREIGN KEY (integration_id) REFERENCES integration(id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_integration ON webhook_delivery(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_run ON webhook_delivery(run_id);
