# CoderailFlow Wave 1 - Technical Specification

## Architecture Overview

### API Layer (Hono + Cloudflare Workers)
```
Request → CORS → Logger → RateLimit → Auth? → Route Handler → Response
```

### Key Modules

#### 1. Bindings (`src/api/bindings.ts`)
```typescript
interface Env {
  DB: D1Database           // Cloudflare D1 SQLite
  KV: KVNamespace         // Cloudflare KV for caching/rate-limit
  R2: R2Bucket            // Cloudflare R2 for file storage
  AUTH_SECRET: string     // JWT signing secret
  ENVIRONMENT: "development" | "production" | "test"
  LOG_LEVEL: "debug" | "info" | "warn" | "error"
}
```

#### 2. Authentication (`src/api/middleware/auth.ts`)
- JWT verification using Hono's JWT helper
- Two variants:
  - `authMiddleware` - Strict (401 if no token)
  - `optionalAuthMiddleware` - Permissive (continue without token)
- Extracts: `userId`, `userEmail`, `userRole` into context

#### 3. Rate Limiting (`src/api/middleware/rate-limiter.ts`)
- Per-IP rate limiting using KV store
- Window: 60 seconds, Limit: 100 requests
- TTL-based expiration for KV entries
- Returns: 429 Too Many Requests if exceeded
- Headers: X-RateLimit-{Limit,Remaining,Reset}

#### 4. Templates System (`src/templates/`)
- **In-memory registry** of 5 pre-built templates
- Each template includes:
  - ID, name, description, category
  - Trigger config (type + options)
  - Array of actions with individual configs
  - Tags for filtering
  - Public/private visibility
  - Created/updated timestamps

Template Categories:
- `notifications` - Email, Slack messages
- `automation` - Git rebasing, issue archival
- `maintenance` - Cron jobs, cleanup tasks
- `integration` - Notion sync, webhooks

#### 5. Database (`src/db/`)
**Schema:**
- `users` - Clerk ID, email (unique)
- `templates` - Public templates (read-only in Wave 1)
- `workflows` - User-created workflows
- `executions` - Workflow run history + logs

**Relationships:**
```
User (1) ---> (N) Workflows
Workflow (1) ---> (N) Executions
Workflow (N) ---> (1) Template (optional)
```

#### 6. API Endpoints

**Public:**
```
GET    /health                           - Status check
GET    /api/templates                    - List templates (paginated)
GET    /api/templates/:id                - Get template details
POST   /api/templates                    - Create custom template
```

**Protected (JWT required):**
```
GET    /api/workflows                    - List user's workflows
GET    /api/workflows/:id                - Get workflow details
POST   /api/workflows                    - Create from template
PUT    /api/workflows/:id                - Update workflow
```

## Data Types

### Template
```typescript
{
  id: string                        // "tpl-{uuid}"
  name: string                      // Display name
  description: string               // Purpose/usage
  category: string                  // notifications|automation|maintenance|integration
  trigger: {
    type: TriggerType              // pr.opened, deploy.success, etc.
    config?: Record<string, any>   // Trigger-specific options
  }
  actions: [{
    type: ActionType               // send_email, slack_message, etc.
    config: Record<string, any>    // Required action configuration
  }]
  tags: string[]                    // Filter tags
  isPublic: boolean                 // Visibility
  createdAt: string                 // ISO 8601
  updatedAt: string                 // ISO 8601
}
```

### Workflow
```typescript
{
  id: string                        // "wf-{uuid}"
  userId: string                    // Clerk ID
  name: string                      // User-defined
  description?: string
  templateId?: string               // If based on template
  triggerType: string               // From template
  triggerConfig: string             // JSON serialized
  actions: string                   // JSON serialized
  enabled: boolean
  createdAt: string                 // ISO 8601
  updatedAt: string                 // ISO 8601
}
```

## Error Handling

**Standard Error Response:**
```json
{
  "error": "Human-readable error message",
  "message": "Technical details (dev only)",
  "retryAfter": 60  // For 429 responses
}
```

**HTTP Status Codes:**
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Validation failed
- 401 Unauthorized - Auth required/failed
- 404 Not Found - Resource doesn't exist
- 429 Too Many Requests - Rate limited
- 500 Internal Server Error - Unhandled error

## Security Considerations

1. **Authentication**
   - JWT in Authorization header (Bearer token)
   - Secret stored in Env (not code)
   - Token verified on every protected request

2. **Rate Limiting**
   - Per-IP tracking using KV (distributed)
   - Prevents abuse/DDoS
   - Returns 429 with retry-after

3. **Input Validation**
   - Hono request validation (optional, can be added)
   - Prepared statements for DB (prevents SQL injection)
   - JSON parsing with error handling

4. **CORS**
   - Wildcard origin for Wave 1 (testing)
   - Should be restricted in production

## Testing Strategy

**Unit Tests (30 total):**
- Templates: Structure, filtering, data integrity
- DB: Query builders, prepared statements
- Rate Limiter: Window management, per-IP tracking, header generation
- Routes: Endpoint functionality, auth, error handling

**Test Patterns:**
- Mock D1Database and KVNamespace
- Test middleware in isolation
- Verify HTTP status codes and response shape

## Deployment (Cloudflare Workers)

**Configuration (wrangler.toml):**
```toml
[env.production]
bindings = [
  { binding = "DB", database_id = "..." },
  { binding = "KV", namespace_id = "..." },
  { binding = "R2", bucket_name = "..." }
]

vars = {
  ENVIRONMENT = "production"
  LOG_LEVEL = "warn"
  AUTH_SECRET = "..."
}
```

**Build + Deploy:**
```bash
npm run build
wrangler deploy
```

## Future Enhancements (Wave 2+)

1. **Execution Engine**
   - Run workflows based on triggers
   - Event handling (webhooks, pub/sub)
   - Retry logic + exponential backoff

2. **Integration SDKs**
   - Slack API client
   - GitHub API client
   - Notion API client
   - Custom webhook support

3. **Scheduling**
   - Cron job execution
   - Delayed/scheduled workflows
   - Timezone-aware times

4. **Dashboard**
   - React SPA (already in monorepo)
   - Real-time execution logs
   - Template marketplace

5. **Analytics**
   - Execution metrics
   - Success/failure rates
   - Performance monitoring

6. **Billing**
   - LemonSqueezy integration
   - Usage-based pricing
   - Metering/quotas

