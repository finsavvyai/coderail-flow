# API Reference

Base URL: `https://api.coderail.dev`

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

Generate keys from the dashboard under **Settings > API Keys**.

---

## Endpoints

### Flows

#### `POST /flows`

Create a new flow.

**Body:**
```json
{
  "name": "My Flow",
  "projectId": "proj_abc",
  "steps": [
    { "type": "goto", "url": "https://example.com" },
    { "type": "screenshot" }
  ]
}
```

**Response:** `201` with the created flow object.

#### `GET /flows`

List all flows. Supports `?projectId=` filter.

#### `GET /flows/:id`

Get a single flow by ID.

#### `PUT /flows/:id`

Update a flow's name, steps, or schedule.

#### `DELETE /flows/:id`

Delete a flow and its associated runs.

---

### Runs

#### `POST /runs`

Trigger a flow run.

**Body:**
```json
{
  "flowId": "flow_abc",
  "env": { "BASE_URL": "https://staging.example.com" }
}
```

**Response:** `201` with `{ runId, status: "queued" }`.

#### `GET /runs`

List runs. Supports `?flowId=` and `?status=` filters.

#### `GET /runs/:id`

Get run details including step-level results, timing, and status.

---

### Artifacts

#### `GET /artifacts`

List artifacts for a run. Query: `?runId=RUN_ID`.

Returns an array of `{ id, type, name, url, createdAt }`. Types: `screenshot`, `srt`, `log`.

#### `GET /artifacts/:id`

Download a single artifact by ID. Returns the file with appropriate content type.

---

### Elements

#### `POST /elements`

Discover interactive elements on a page.

**Body:**
```json
{
  "url": "https://example.com",
  "selector": "body"
}
```

**Response:** Array of `{ tag, selector, text, boundingBox, interactive }`.

---

### Billing

#### `GET /billing/plans`

List available subscription plans.

**Response:**
```json
[
  { "id": "free", "name": "Free", "runsPerMonth": 50, "price": 0 },
  { "id": "pro", "name": "Pro", "runsPerMonth": 2000, "price": 29 },
  { "id": "team", "name": "Team", "runsPerMonth": 10000, "price": 79 }
]
```

---

### AI

#### `POST /ai/generate-flow`

Generate a flow from a natural language description.

**Body:**
```json
{
  "prompt": "Go to GitHub, search for coderailflow, and screenshot the results"
}
```

**Response:** A complete flow object with generated steps.

---

### Health

#### `GET /health`

Health check endpoint. Returns `200` with `{ status: "ok" }`. No auth required.

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "steps is required",
    "correlationId": "req_abc123"
  }
}
```

Common codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`.

## Rate Limits

- **Free:** 10 requests/minute
- **Pro:** 60 requests/minute
- **Team:** 200 requests/minute

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
