# CoderailFlow API Documentation

## Overview

CoderailFlow provides a REST API for managing automation flows, executing workflows, and monitoring results. All endpoints require JWT authentication via Clerk.

## Base URLs

- **Production:** `https://api.coderailflow.dev`
- **Staging:** `https://staging-api.coderailflow.dev`
- **Local:** `http://localhost:8787/api`

## Authentication

All requests require a valid Clerk JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- **Free Plan:** 100 executions/month
- **Pro Plan:** 10,000 executions/month
- **Enterprise:** Unlimited

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 1711324800
```

## API Endpoints

See dedicated documentation:

- [Flow Endpoints](API-FLOWS.md) - Create, list, update, delete flows
- [Execution & Schedule Endpoints](API-EXECUTION.md) - Execute flows, manage schedules

## Error Responses

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "validation error details"
  },
  "request_id": "req_1234567890"
}
```

### Common Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `202 Accepted` - Async operation started
- `204 No Content` - Success, no content
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Best Practices

1. **Error Handling:** Always check response status
2. **Idempotency:** Use idempotency keys for mutations
3. **Pagination:** Use `limit` and `offset`
4. **Secrets:** Never include sensitive data
5. **Webhooks:** Use for real-time updates instead of polling

## SDKs

- **JavaScript/TypeScript:** `npm install coderailflow`
- **Python:** `pip install coderailflow`
- **Go:** `go get github.com/coderailflow/go-sdk`

## Support

- Docs: https://docs.coderailflow.dev
- Issues: https://github.com/coderailflow/coderailflow/issues
- Email: api-support@coderailflow.dev
