-- D1 migration 0002: seed demo org/project/flow

INSERT OR IGNORE INTO org (id, name, plan, created_at)
VALUES ('default', 'Default', 'free', datetime('now'));

INSERT OR IGNORE INTO org (id, name, plan, created_at)
VALUES ('demo-org', 'Demo Org', 'free', datetime('now'));

INSERT OR IGNORE INTO project (id, org_id, name, base_url, env, created_at)
VALUES ('demo-project', 'demo-org', 'Demo Project', 'https://example.com', 'dev', datetime('now'));

INSERT OR IGNORE INTO flow (id, project_id, name, description, status, current_version, created_at)
VALUES ('hello-flow', 'demo-project', 'Hello Flow', 'First hardcoded flow (stub runner).', 'active', 1, datetime('now'));

INSERT OR IGNORE INTO flow_version (id, flow_id, version, definition, changelog, created_at)
VALUES (
  'hello-flow-v1',
  'hello-flow',
  1,
  json_object(
    'params', json_array(),
    'steps', json_array(
      json_object('type','caption','text','Hello from CodeRail Flow!'),
      json_object('type','pause','ms', 800)
    )
  ),
  'Initial seed',
  datetime('now')
);
