/**
 * Webhook delivery orchestration — finds integrations and dispatches to providers.
 */
import type { Env } from './env';
import { q, q1 } from './db';
import type { Integration, RunEvent } from './integration_types';
import { decryptIntegrationConfig } from './integration_types';
import { deliverSlack, deliverGenericWebhook } from './providers_notify';
import { deliverGitLab, deliverGitHub, deliverJira } from './providers_scm';

// Re-export so callers that imported postWebhook from here still work
export { postWebhook } from './post_webhook';

// ── Delivery orchestration ──────────────────────────────────
export async function deliverWebhooks(env: Env, event: string, runEvent: RunEvent) {
  const flow = await q1<{ project_id: string }>(env, 'SELECT project_id FROM flow WHERE id = ?', [
    runEvent.flowId,
  ]);
  if (!flow) return;

  const { results } = await q(
    env,
    'SELECT * FROM integration WHERE project_id = ? AND enabled = 1',
    [flow.project_id]
  );
  if (!results?.length) return;

  const integrations = results as unknown as Integration[];

  for (const integration of integrations) {
    try {
      const config = await decryptIntegrationConfig(env, integration.config);
      await deliverIntegration(env, integration, config, event, runEvent);
    } catch (err) {
      console.error(`Integration ${integration.id} delivery failed:`, err);
    }
  }
}

export async function deliverIntegration(
  env: Env,
  integration: Integration,
  config: Record<string, any>,
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  switch (integration.type) {
    case 'slack':
      return deliverSlack(env, integration, config as any, event, runEvent);
    case 'webhook':
      return deliverGenericWebhook(env, integration, config as any, event, runEvent);
    case 'gitlab':
      return deliverGitLab(env, integration, config as any, event, runEvent);
    case 'github':
      return deliverGitHub(env, integration, config as any, event, runEvent);
    case 'jira':
      return deliverJira(env, integration, config as any, event, runEvent);
    default:
      return false;
  }
}
