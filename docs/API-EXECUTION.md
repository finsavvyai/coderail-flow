# Execution API Endpoints

## Execute Flow

```http
POST /flows/{flow_id}/execute
Authorization: Bearer <token>

{
  "capture_screenshots": true,
  "generate_srt": true
}
```

**Response:** `202 Accepted`

```json
{
  "execution_id": "exec_1234567890",
  "flow_id": "flow_1234567890",
  "status": "running",
  "started_at": "2025-03-20T10:00:00Z"
}
```

## Get Execution

```http
GET /executions/{execution_id}
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "exec_1234567890",
  "flow_id": "flow_1234567890",
  "status": "completed",
  "duration_ms": 5234,
  "screenshots": [
    {
      "step": 0,
      "url": "https://r2.coderailflow.dev/exec_123/screenshot_0.png",
      "timestamp": "2025-03-20T10:00:00Z"
    }
  ],
  "srt_url": "https://r2.coderailflow.dev/exec_123/subtitles.srt"
}
```

## List Executions

```http
GET /executions?flow_id=flow_123&limit=20
Authorization: Bearer <token>
```

## Create Schedule

```http
POST /flows/{flow_id}/schedule
Authorization: Bearer <token>

{
  "cron": "0 9 * * 1-5",
  "timezone": "UTC",
  "enabled": true
}
```

**Response:** `201 Created`

```json
{
  "id": "schedule_1234567890",
  "flow_id": "flow_1234567890",
  "cron": "0 9 * * 1-5",
  "next_run": "2025-03-24T09:00:00Z"
}
```

## List Schedules

```http
GET /flows/{flow_id}/schedules
Authorization: Bearer <token>
```

## Disable Schedule

```http
POST /flows/{flow_id}/schedules/{schedule_id}/disable
Authorization: Bearer <token>
```

## Supported Step Types

- `navigate` - Go to URL
- `click` - Click element
- `fill` - Fill text input
- `select` - Select dropdown option
- `check` - Check checkbox
- `screenshot` - Capture screenshot
- `waitFor` - Wait for element
- `waitForNavigation` - Wait for page load
- `press` - Press keyboard key
- `type` - Type text character by character
- `hover` - Hover over element
- `scroll` - Scroll page
- `fillForm` - Fill multiple fields
