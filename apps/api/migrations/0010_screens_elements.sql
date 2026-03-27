-- D1 migration 0010: screens and elements tables for visual element mapper
-- These tables support the Element Mapper feature with reliability scoring

-- Screens table: Represents pages/URLs in target applications
CREATE TABLE IF NOT EXISTS screens (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

-- Elements table: Mapped UI elements with locator fallback chains
CREATE TABLE IF NOT EXISTS elements (
  id TEXT PRIMARY KEY,
  screen_id TEXT NOT NULL,
  name TEXT NOT NULL,
  primary_locator TEXT NOT NULL,
  primary_strategy TEXT NOT NULL,
  reliability_score REAL NOT NULL DEFAULT 0,
  fallback_chain TEXT NOT NULL DEFAULT '[]',
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (screen_id) REFERENCES screens(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_screens_project_id ON screens(project_id);
CREATE INDEX IF NOT EXISTS idx_elements_screen_id ON elements(screen_id);
CREATE INDEX IF NOT EXISTS idx_elements_name ON elements(name);

-- Trigger to update updated_at timestamp on screens
CREATE TRIGGER IF NOT EXISTS update_screens_updated_at
AFTER UPDATE ON screens
BEGIN
  UPDATE screens SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger to update updated_at timestamp on elements
CREATE TRIGGER IF NOT EXISTS update_elements_updated_at
AFTER UPDATE ON elements
BEGIN
  UPDATE elements SET updated_at = datetime('now') WHERE id = NEW.id;
END;
