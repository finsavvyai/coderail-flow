import type { Env } from '../env';
import { q1 } from '../db';

export async function orgFromProject(env: Env, projectId: string): Promise<string | null> {
  const project = await q1<{ org_id: string }>(env, 'SELECT org_id FROM project WHERE id = ?', [
    projectId,
  ]);
  return project?.org_id || null;
}

async function orgFromFlow(env: Env, flowId: string): Promise<string | null> {
  const row = await q1<{ org_id: string }>(
    env,
    `SELECT p.org_id
     FROM flow f
     JOIN project p ON p.id = f.project_id
     WHERE f.id = ?`,
    [flowId]
  );
  return row?.org_id || null;
}

async function orgFromRun(env: Env, runId: string): Promise<string | null> {
  const row = await q1<{ org_id: string }>(
    env,
    `SELECT p.org_id
     FROM run r
     JOIN flow f ON f.id = r.flow_id
     JOIN project p ON p.id = f.project_id
     WHERE r.id = ?`,
    [runId]
  );
  return row?.org_id || null;
}

async function orgFromIntegration(env: Env, integrationId: string): Promise<string | null> {
  const row = await q1<{ org_id: string }>(
    env,
    `SELECT p.org_id
     FROM integration i
     JOIN project p ON p.id = i.project_id
     WHERE i.id = ?`,
    [integrationId]
  );
  return row?.org_id || null;
}

async function orgFromAuthProfile(env: Env, authProfileId: string): Promise<string | null> {
  const row = await q1<{ org_id: string }>(
    env,
    `SELECT p.org_id
     FROM auth_profile ap
     JOIN project p ON p.id = ap.project_id
     WHERE ap.id = ?`,
    [authProfileId]
  );
  return row?.org_id || null;
}

async function orgFromSchedule(env: Env, scheduleId: string): Promise<string | null> {
  const row = await q1<{ org_id: string }>(
    env,
    `SELECT p.org_id
     FROM schedule s
     JOIN flow f ON f.id = s.flow_id
     JOIN project p ON p.id = f.project_id
     WHERE s.id = ?`,
    [scheduleId]
  );
  return row?.org_id || null;
}

export async function resolveOrgId(
  env: Env,
  path: string,
  body: Record<string, any> | null
): Promise<string | null> {
  if (body?.orgId) return String(body.orgId);
  if (body?.projectId) return orgFromProject(env, String(body.projectId));
  if (body?.flowId) return orgFromFlow(env, String(body.flowId));
  if (body?.screenId) {
    const row = await q1<{ org_id: string }>(
      env,
      `SELECT p.org_id
       FROM screen s
       JOIN project p ON p.id = s.project_id
       WHERE s.id = ?`,
      [String(body.screenId)]
    );
    if (row?.org_id) return row.org_id;
  }

  const seg = path.split('/').filter(Boolean);
  const resource = seg[0];
  const id = seg[1];
  if (!resource || !id) return null;

  if (resource === 'projects') return orgFromProject(env, id);
  if (resource === 'flows') return orgFromFlow(env, id);
  if (resource === 'runs') return orgFromRun(env, id);
  if (resource === 'integrations') return orgFromIntegration(env, id);
  if (resource === 'auth-profiles') return orgFromAuthProfile(env, id);
  if (resource === 'schedules') return orgFromSchedule(env, id);

  return null;
}
