-- Demo flow: Explain a Failed Card Transaction
-- This is the demo that sells the product

-- Create demo screens for the admin dashboard
INSERT INTO screen (id, project_id, name, url_path, created_at) VALUES
  ('scr-dashboard', 'demo-project', 'Admin Dashboard', '/admin', '2024-01-01T00:00:00Z'),
  ('scr-transactions', 'demo-project', 'Transactions List', '/admin/transactions', '2024-01-01T00:00:00Z'),
  ('scr-transaction-detail', 'demo-project', 'Transaction Detail', '/admin/transactions/:id', '2024-01-01T00:00:00Z');

-- Create demo elements
INSERT INTO element (id, screen_id, name, locator_primary, locator_fallbacks, reliability_score, created_at, updated_at) VALUES
  ('el-search-input', 'scr-transactions', 'Search Input', '{"type":"testid","value":"transaction-search"}', '[]', 1.0, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('el-search-btn', 'scr-transactions', 'Search Button', '{"type":"role","value":"button","meta":{"name":"Search"}}', '[]', 0.8, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('el-txn-row', 'scr-transactions', 'Transaction Row', '{"type":"testid","value":"transaction-row-0"}', '[]', 1.0, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('el-error-code', 'scr-transaction-detail', 'Error Code Field', '{"type":"testid","value":"error-code-field"}', '[{"type":"css","value":".error-code"}]', 1.0, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
  ('el-status-badge', 'scr-transaction-detail', 'Status Badge', '{"type":"testid","value":"status-badge"}', '[]', 1.0, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z');

-- Create the demo flow: Explain a Failed Card Transaction
INSERT INTO flow (id, project_id, name, description, status, current_version, created_at) VALUES
  ('demo-failed-txn', 'demo-project', 'Explain a Failed Card Transaction', 'Demonstrates how to investigate and explain a declined card authorization to stakeholders.', 'active', 1, '2024-01-01T00:00:00Z');

-- Create the flow version with steps
INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at) VALUES
  ('demo-failed-txn-v1', 'demo-failed-txn', 1, '{
  "params": [
    {"name": "cardId", "type": "string", "required": true}
  ],
  "steps": [
    {
      "type": "goto",
      "screenId": "scr-dashboard",
      "narrate": "Opening the admin dashboard"
    },
    {
      "type": "caption",
      "text": "Let''s investigate a failed card transaction",
      "placement": "bottom"
    },
    {
      "type": "goto",
      "screenId": "scr-transactions",
      "narrate": "Navigating to the transactions list"
    },
    {
      "type": "fill",
      "elementId": "el-search-input",
      "value": "{{cardId}}",
      "narrate": "Searching for the card ID"
    },
    {
      "type": "click",
      "elementId": "el-search-btn",
      "narrate": "Clicking search"
    },
    {
      "type": "waitFor",
      "elementId": "el-txn-row",
      "state": "visible"
    },
    {
      "type": "highlight",
      "elementId": "el-txn-row",
      "style": "pulse",
      "narrate": "Here is the latest failed transaction"
    },
    {
      "type": "click",
      "elementId": "el-txn-row",
      "narrate": "Opening the transaction details"
    },
    {
      "type": "pause",
      "ms": 1000
    },
    {
      "type": "highlight",
      "elementId": "el-error-code",
      "style": "pulse",
      "narrate": "This is the error code returned by the payment operator"
    },
    {
      "type": "caption",
      "text": "This error code is returned by the operator and indicates a declined authorization.",
      "placement": "bottom"
    },
    {
      "type": "pause",
      "ms": 2000
    },
    {
      "type": "caption",
      "text": "The cardholder should contact their bank for more information.",
      "placement": "bottom"
    }
  ]
}', 'Initial demo flow', '2024-01-01T00:00:00Z');

-- Create a sample completed run for the demo
INSERT INTO run (id, flow_id, flow_version, params, status, runner_version, created_at, started_at, finished_at) VALUES
  ('run-demo-001', 'demo-failed-txn', 1, '{"cardId": "****7842"}', 'succeeded', 'stub-0.1', '2024-01-15T10:30:00Z', '2024-01-15T10:30:01Z', '2024-01-15T10:30:28Z');

-- Create sample artifacts for the demo run
INSERT INTO artifact (id, run_id, kind, content_type, bytes, r2_key, inline_content, created_at) VALUES
  ('art-demo-report', 'run-demo-001', 'report', 'application/json', 1024, NULL, '{
    "flowId": "demo-failed-txn",
    "flowName": "Explain a Failed Card Transaction",
    "runId": "run-demo-001",
    "status": "succeeded",
    "duration": 27000,
    "stepsExecuted": 13,
    "stepsFailed": 0,
    "params": {"cardId": "****7842"},
    "summary": "Successfully demonstrated the investigation of a failed card transaction. The error code ERR_AUTH_051 indicates a declined authorization from the payment operator."
  }', '2024-01-15T10:30:28Z'),
  ('art-demo-srt', 'run-demo-001', 'subtitle', 'text/srt', 512, NULL, '1
00:00:00,000 --> 00:00:03,000
Opening the admin dashboard

2
00:00:03,000 --> 00:00:06,000
Let''s investigate a failed card transaction

3
00:00:06,000 --> 00:00:09,000
Navigating to the transactions list

4
00:00:09,000 --> 00:00:12,000
Searching for the card ID

5
00:00:12,000 --> 00:00:14,000
Clicking search

6
00:00:14,000 --> 00:00:17,000
Here is the latest failed transaction

7
00:00:17,000 --> 00:00:20,000
Opening the transaction details

8
00:00:21,000 --> 00:00:25,000
This is the error code returned by the payment operator

9
00:00:25,000 --> 00:00:28,000
This error code is returned by the operator and indicates a declined authorization.
', '2024-01-15T10:30:28Z');
