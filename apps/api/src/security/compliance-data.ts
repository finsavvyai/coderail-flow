import type { Env } from '../env';
import { q } from '../db';
import { redactValue } from './pii-redaction';

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseBoolean(input: unknown, fallback = false): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const normalized = input.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

export async function exportOrgData(env: Env, orgId: string) {
  const projects =
    (await q(env, 'SELECT * FROM project WHERE org_id = ? ORDER BY created_at DESC', [orgId]))
      .results || [];

  const exportedProjects = [] as any[];
  for (const project of projects as any[]) {
    const projectId = String(project.id);
    const screens =
      (
        await q(env, 'SELECT * FROM screen WHERE project_id = ? ORDER BY created_at DESC', [
          projectId,
        ])
      ).results || [];
    const flows =
      (
        await q(env, 'SELECT * FROM flow WHERE project_id = ? ORDER BY created_at DESC', [
          projectId,
        ])
      ).results || [];
    const integrations =
      (
        await q(
          env,
          'SELECT id, project_id, type, name, enabled, created_at, updated_at FROM integration WHERE project_id = ? ORDER BY created_at DESC',
          [projectId]
        )
      ).results || [];
    const authProfiles =
      (
        await q(
          env,
          'SELECT id, project_id, name, type, created_at, updated_at FROM auth_profile WHERE project_id = ? ORDER BY created_at DESC',
          [projectId]
        )
      ).results || [];

    const flowIds = (flows as any[]).map((flow) => String(flow.id));
    const versions: any[] = [];
    const runs: any[] = [];

    for (const flowId of flowIds) {
      versions.push(
        ...(((
          await q(env, 'SELECT * FROM flow_version WHERE flow_id = ? ORDER BY version DESC', [
            flowId,
          ])
        ).results || []) as any[])
      );
      runs.push(
        ...(((
          await q(env, 'SELECT * FROM run WHERE flow_id = ? ORDER BY created_at DESC', [flowId])
        ).results || []) as any[])
      );
    }

    exportedProjects.push({
      project: redactValue(project),
      screens: redactValue(screens),
      flows: redactValue(flows),
      flowVersions: redactValue(versions),
      runs: redactValue(runs),
      integrations: redactValue(integrations),
      authProfiles: redactValue(authProfiles),
    });
  }

  const auditLogs =
    (
      await q(env, 'SELECT * FROM audit_log WHERE org_id = ? ORDER BY created_at DESC LIMIT 5000', [
        orgId,
      ])
    ).results || [];

  return {
    generatedAt: new Date().toISOString(),
    orgId,
    projects: exportedProjects,
    auditLogs: redactValue(auditLogs),
  };
}

// Re-export deletion and retention operations
export { deleteOrgData, applyRetentionPolicy } from './compliance-data-formatters';
