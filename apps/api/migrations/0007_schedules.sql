-- Schedule table for cron-based flow execution
CREATE TABLE IF NOT EXISTS schedule (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES flow(id) ON DELETE CASCADE,
  cron_expression TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  params TEXT DEFAULT '{}',
  last_run_at TEXT,
  next_run_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_schedule_flow ON schedule(flow_id);
CREATE INDEX IF NOT EXISTS idx_schedule_enabled ON schedule(enabled);
CREATE INDEX IF NOT EXISTS idx_schedule_next_run ON schedule(next_run_at);
