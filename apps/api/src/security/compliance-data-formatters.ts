// Compliance data deletion and retention operations

import type { Env } from '../env';
import { q, q1 } from '../db';
import { toNumber } from './compliance-data';

async function listProjectIdsByOrg(env: Env, orgId: string): Promise<string[]> {
  const result = await q(env, 'SELECT id FROM project WHERE org_id = ?', [orgId]);
  return ((result.results || []) as Array<{ id: string }>).map((row) => row.id);
}

async function listFlowIdsByProjects(env: Env, projectIds: string[]): Promise<string[]> {
  const flowIds: string[] = [];
  for (const projectId of projectIds) {
    const result = await q(env, 'SELECT id FROM flow WHERE project_id = ?', [projectId]);
    flowIds.push(...((result.results || []) as Array<{ id: string }>).map((row) => row.id));
  }
  return flowIds;
}

async function listRunIdsByFlows(env: Env, flowIds: string[]): Promise<string[]> {
  const runIds: string[] = [];
  for (const flowId of flowIds) {
    const result = await q(env, 'SELECT id FROM run WHERE flow_id = ?', [flowId]);
    runIds.push(...((result.results || []) as Array<{ id: string }>).map((row) => row.id));
  }
  return runIds;
}

export async function deleteOrgData(env: Env, orgId: string, dryRun: boolean) {
  const projectIds = await listProjectIdsByOrg(env, orgId);
  const flowIds = await listFlowIdsByProjects(env, projectIds);
  const runIds = await listRunIdsByFlows(env, flowIds);

  const summary = {
    orgId,
    projects: projectIds.length,
    flows: flowIds.length,
    runs: runIds.length,
    deleted: {
      runStep: 0,
      artifact: 0,
      run: 0,
      flowVersion: 0,
      schedule: 0,
      webhookDelivery: 0,
      integration: 0,
      authProfile: 0,
      element: 0,
      screen: 0,
      flow: 0,
      project: 0,
      auditLog: 0,
    },
  };

  for (const runId of runIds) {
    if (!dryRun) {
      await q(env, 'DELETE FROM run_step WHERE run_id = ?', [runId]);
      await q(env, 'DELETE FROM artifact WHERE run_id = ?', [runId]);
    }
    summary.deleted.runStep += 1;
    summary.deleted.artifact += 1;
  }

  for (const flowId of flowIds) {
    if (!dryRun) {
      await q(env, 'DELETE FROM run WHERE flow_id = ?', [flowId]);
      await q(env, 'DELETE FROM flow_version WHERE flow_id = ?', [flowId]);
      await q(env, 'DELETE FROM schedule WHERE flow_id = ?', [flowId]);
    }
    summary.deleted.run += 1;
    summary.deleted.flowVersion += 1;
    summary.deleted.schedule += 1;
  }

  for (const projectId of projectIds) {
    const integrationRows =
      (await q(env, 'SELECT id FROM integration WHERE project_id = ?', [projectId])).results || [];
    for (const row of integrationRows as Array<{ id: string }>) {
      if (!dryRun) await q(env, 'DELETE FROM webhook_delivery WHERE integration_id = ?', [row.id]);
      summary.deleted.webhookDelivery += 1;
    }

    const screenRows =
      (await q(env, 'SELECT id FROM screen WHERE project_id = ?', [projectId])).results || [];
    for (const row of screenRows as Array<{ id: string }>) {
      if (!dryRun) await q(env, 'DELETE FROM element WHERE screen_id = ?', [row.id]);
      summary.deleted.element += 1;
    }

    if (!dryRun) {
      await q(env, 'DELETE FROM integration WHERE project_id = ?', [projectId]);
      await q(env, 'DELETE FROM auth_profile WHERE project_id = ?', [projectId]);
      await q(env, 'DELETE FROM screen WHERE project_id = ?', [projectId]);
      await q(env, 'DELETE FROM flow WHERE project_id = ?', [projectId]);
      await q(env, 'DELETE FROM project WHERE id = ?', [projectId]);
    }

    summary.deleted.integration += 1;
    summary.deleted.authProfile += 1;
    summary.deleted.screen += 1;
    summary.deleted.flow += 1;
    summary.deleted.project += 1;
  }

  if (!dryRun) await q(env, 'DELETE FROM audit_log WHERE org_id = ?', [orgId]);
  summary.deleted.auditLog = toNumber(
    (
      await q1<{ count: number }>(env, 'SELECT COUNT(*) as count FROM audit_log WHERE org_id = ?', [
        orgId,
      ])
    )?.count,
    0
  );

  return summary;
}

export async function applyRetentionPolicy(env: Env, days: number, dryRun: boolean) {
  const safeDays = Math.min(3650, Math.max(1, Math.round(days)));
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();

  const runCount = toNumber(
    (
      await q1<{ count: number }>(env, 'SELECT COUNT(*) as count FROM run WHERE created_at < ?', [
        cutoff,
      ])
    )?.count
  );
  const auditCount = toNumber(
    (
      await q1<{ count: number }>(
        env,
        'SELECT COUNT(*) as count FROM audit_log WHERE created_at < ?',
        [cutoff]
      )
    )?.count
  );
  const deliveryCount = toNumber(
    (
      await q1<{ count: number }>(
        env,
        'SELECT COUNT(*) as count FROM webhook_delivery WHERE attempted_at < ?',
        [cutoff]
      )
    )?.count
  );

  if (!dryRun) {
    await q(env, 'DELETE FROM run_step WHERE run_id IN (SELECT id FROM run WHERE created_at < ?)', [
      cutoff,
    ]);
    await q(env, 'DELETE FROM artifact WHERE run_id IN (SELECT id FROM run WHERE created_at < ?)', [
      cutoff,
    ]);
    await q(env, 'DELETE FROM run WHERE created_at < ?', [cutoff]);
    await q(env, 'DELETE FROM audit_log WHERE created_at < ?', [cutoff]);
    await q(env, 'DELETE FROM webhook_delivery WHERE attempted_at < ?', [cutoff]);
  }

  return {
    dryRun,
    days: safeDays,
    cutoff,
    affected: { runs: runCount, auditLogs: auditCount, webhookDeliveries: deliveryCount },
  };
}
