# Flow API Endpoints

## Create Flow

```http
POST /flows
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Login Flow",
  "description": "Automated login test",
  "steps": [
    {
      "type": "navigate",
      "url": "https://app.example.com/login"
    },
    {
      "type": "fill",
      "selector": "input[name='email']",
      "value": "user@example.com"
    },
    {
      "type": "click",
      "selector": "button[type='submit']"
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "id": "flow_1234567890",
  "name": "Login Flow",
  "description": "Automated login test",
  "steps": 3,
  "created_at": "2025-03-20T10:00:00Z",
  "updated_at": "2025-03-20T10:00:00Z",
  "status": "active"
}
```

## List Flows

```http
GET /flows?limit=10&offset=0&status=active
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "flows": [
    {
      "id": "flow_1234567890",
      "name": "Login Flow",
      "status": "active",
      "created_at": "2025-03-20T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 10,
  "offset": 0
}
```

## Get Flow

```http
GET /flows/{flow_id}
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "id": "flow_1234567890",
  "name": "Login Flow",
  "steps": [
    {
      "type": "navigate",
      "url": "https://app.example.com/login"
    }
  ]
}
```

## Update Flow

```http
PATCH /flows/{flow_id}
Authorization: Bearer <token>

{
  "name": "Updated Flow Name",
  "steps": [...]
}
```

## Delete Flow

```http
DELETE /flows/{flow_id}
Authorization: Bearer <token>
```

**Response:** `204 No Content`
