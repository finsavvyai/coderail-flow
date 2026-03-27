import type { MiddlewareHandler } from 'hono';
import type { Env } from '../env';
import { q } from '../db';
import { uuid } from '../ids';
import { redactValue } from './pii-redaction';
import { resolveOrgId } from './audit-log-resolvers';

type Variables = { userId: string; userEmail?: string };

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function shouldAudit(method: string, path: string): boolean {
  if (!MUTATION_METHODS.has(method.toUpperCase())) return false;
  if (path.startsWith('/internal/')) return false;
  if (path === '/waitlist') return false;
  return true;
}

function truncate(value: string, max = 2000): string {
  return value.length > max ? value.slice(0, max) : value;
}

async function parseRequestBody(c: any): Promise<Record<string, any> | null> {
  const type = c.req.header('content-type') || '';
  if (!type.includes('application/json')) return null;
  try {
    return (await c.req.clone().json()) as Record<string, any>;
  } catch {
    return null;
  }
}

function inferTargetType(path: string): string {
  const first = path.split('/').filter(Boolean)[0] || 'unknown';
  if (first.endsWith('s')) return first.slice(0, -1);
  return first;
}

function inferTargetId(path: string, body: Record<string, any> | null): string | null {
  const seg = path.split('/').filter(Boolean);
  if (seg[1] && !['retry'].includes(seg[1])) return seg[1];

  return (
    body?.id ||
    body?.projectId ||
    body?.flowId ||
    body?.screenId ||
    body?.elementId ||
    body?.integrationId ||
    body?.scheduleId ||
    null
  );
}

function inferAction(method: string, path: string, targetType: string): string {
  const loweredMethod = method.toLowerCase();
  if (path.endsWith('/retry')) return `${targetType}.retry`;
  if (loweredMethod === 'post') return `${targetType}.create`;
  if (loweredMethod === 'put' || loweredMethod === 'patch') return `${targetType}.update`;
  if (loweredMethod === 'delete') return `${targetType}.delete`;
  return `${targetType}.${loweredMethod}`;
}

export function auditMutationMiddleware(): MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> {
  return async (c, next) => {
    const method = c.req.method.toUpperCase();
    const path = c.req.path;

    if (!shouldAudit(method, path)) {
      await next();
      return;
    }

    const body = await parseRequestBody(c);
    await next();

    if (c.res.status >= 400) return;

    const orgId = await resolveOrgId(c.env, path, body);
    if (!orgId) return;

    const targetType = inferTargetType(path);
    const targetId = inferTargetId(path, body);
    const actorUserId = c.get('userId') || null;

    const detail = truncate(
      JSON.stringify({
        method,
        path,
        status: c.res.status,
        body: redactValue(body),
      })
    );

    await q(
      c.env,
      `INSERT INTO audit_log (id, org_id, actor_user_id, action, target_type, target_id, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid(),
        orgId,
        actorUserId,
        inferAction(method, path, targetType),
        targetType,
        targetId,
        detail,
        new Date().toISOString(),
      ]
    );
  };
}

export async function listAuditLogs(env: Env, orgId: string, limit: number, offset: number) {
  const safeLimit = Math.min(200, Math.max(1, limit));
  const safeOffset = Math.max(0, offset);

  const rows = await q(
    env,
    `SELECT id, org_id, actor_user_id, action, target_type, target_id, detail, created_at
     FROM audit_log
     WHERE org_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [orgId, safeLimit, safeOffset]
  );

  return (rows.results || []) as any[];
}
