# CodeRail Flow API Reference

Base URL: `$CODERAIL_API_URL` (e.g. `https://coderail-flow-api.broad-dew-49ad.workers.dev`)

All endpoints require `Authorization: Bearer <token>` except `/health` and `/waitlist`.

## Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Returns `{"ok":true}` |

### Flows

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/flows` | Yes | List all flows with current version definition |
| GET | `/flows/:id` | Yes | Get a single flow by ID |
| POST | `/flows` | Yes | Create a new flow |
| PUT | `/flows/:id` | Yes | Update flow (creates new version) |

#### POST `/flows` body

```json
{
  "projectId": "string (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "definition": {
    "params": [
      { "name": "string", "type": "string|number|boolean|json", "required": true }
    ],
    "steps": [ ... ]
  }
}
```

### Runs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/runs` | Yes | Trigger a new run |
| GET | `/runs` | Yes | List recent runs (max 100) |
| GET | `/runs/:id` | Yes | Get run details + artifacts |
| GET | `/runs/:id/progress` | Yes | Poll run progress |
| POST | `/runs/:id/retry` | Yes | Retry a failed run |

#### POST `/runs` body

```json
{
  "flowId": "string (required)",
  "params": { "key": "value" }
}
```

#### Run statuses

`queued` → `running` → `succeeded` | `failed`

### Artifacts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/artifacts/:id/download` | Yes | Download artifact as file |
| GET | `/artifacts/:id/preview` | Yes | Inline preview (e.g. screenshot) |

Artifact kinds: `screenshot`, `report` (JSON), `subtitle` (SRT).

### Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/projects` | Yes | List projects (optional `?orgId=`) |
| GET | `/projects/:id` | Yes | Get project by ID |
| POST | `/projects` | Yes | Create project |

#### POST `/projects` body

```json
{
  "orgId": "string (required)",
  "name": "string (required)",
  "baseUrl": "https://example.com (required)",
  "env": "dev|stage|prod (default: dev)"
}
```

### Screens

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/screens?projectId=` | Yes | List screens for project |
| GET | `/screens/:id` | Yes | Get screen by ID |
| POST | `/screens` | Yes | Create screen |

### Elements

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/elements?screenId=` | Yes | List elements for screen |
| GET | `/elements/:id` | Yes | Get element by ID |
| POST | `/elements` | Yes | Create element |

#### POST `/elements` body

```json
{
  "screenId": "string (required)",
  "name": "string (required)",
  "locatorPrimary": {
    "type": "testid|role|label|css|xpath",
    "value": "string"
  },
  "locatorFallbacks": [],
  "reliabilityScore": 0.0-1.0
}
```

### Rate Limits

- Reads: 120 req/min
- Writes: 30 req/min
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
