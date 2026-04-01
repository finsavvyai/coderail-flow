export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_subject TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL,
  actions TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  is_public INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL,
  actions TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_id) REFERENCES templates(id)
);

CREATE TABLE IF NOT EXISTS executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'success', 'failed')),
  triggered_at TEXT NOT NULL,
  completed_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_template_id ON workflows(template_id);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
`;
