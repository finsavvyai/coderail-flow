-- D1 migration 0012: visual regression testing

CREATE TABLE IF NOT EXISTS baseline (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  width INTEGER NOT NULL DEFAULT 1280,
  height INTEGER NOT NULL DEFAULT 720,
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (flow_id) REFERENCES flow(id),
  UNIQUE(flow_id, step_index)
);

CREATE TABLE IF NOT EXISTS visual_diff (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  baseline_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  diff_r2_key TEXT,
  mismatch_pixels INTEGER NOT NULL DEFAULT 0,
  mismatch_percentage REAL NOT NULL DEFAULT 0.0,
  threshold REAL NOT NULL DEFAULT 0.1,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES run(id),
  FOREIGN KEY (baseline_id) REFERENCES baseline(id)
);

CREATE INDEX IF NOT EXISTS idx_baseline_flow ON baseline(flow_id, step_index);
CREATE INDEX IF NOT EXISTS idx_visual_diff_run ON visual_diff(run_id);
