-- D1 migration 0013: skill marketplace

CREATE TABLE IF NOT EXISTS skill (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  license TEXT NOT NULL DEFAULT 'MIT',
  manifest TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0,
  tags TEXT,
  installs INTEGER NOT NULL DEFAULT 0,
  stars INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES org(id)
);

CREATE TABLE IF NOT EXISTS skill_install (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  installed_at TEXT NOT NULL,
  FOREIGN KEY (skill_id) REFERENCES skill(id),
  FOREIGN KEY (org_id) REFERENCES org(id),
  UNIQUE(skill_id, org_id)
);

CREATE TABLE IF NOT EXISTS skill_review (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (skill_id) REFERENCES skill(id)
);

CREATE INDEX IF NOT EXISTS idx_skill_published ON skill(published, stars DESC);
CREATE INDEX IF NOT EXISTS idx_skill_author ON skill(author_id);
CREATE INDEX IF NOT EXISTS idx_skill_install_org ON skill_install(org_id);
CREATE INDEX IF NOT EXISTS idx_skill_review_skill ON skill_review(skill_id);
