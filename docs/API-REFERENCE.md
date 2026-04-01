# API Reference

## Base URL
```
Production: https://coderail-flow-api.broad-dew-49ad.workers.dev
```

## Authentication

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## Endpoints

### Health Checks

#### GET /health
Basic health check (no authentication)

#### GET /health/detailed
Detailed health (requires authentication)

### Flows

#### GET /flows
List all flows

#### POST /flows
Create a flow

#### GET /flows/:id
Get flow details

#### PUT /flows/:id
Update a flow

#### DELETE /flows/:id
Delete a flow

### Runs

#### POST /runs
Execute a flow

#### GET /runs
List all runs

#### GET /runs/:id
Get run details with artifacts

#### POST /runs/:id/retry
Retry a failed run

## Error Responses

All errors follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "details": {},
  "requestId": "uuid"
}
```

## Rate Limiting

- Free: 10 runs/day
- Pro: 1,000 runs/month
- Enterprise: Unlimited

---

**Last Updated**: March 6, 2026
