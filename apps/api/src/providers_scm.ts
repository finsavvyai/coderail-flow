/** SCM/issue-tracker integration providers: GitLab and Jira. */
import type { Env } from './env';
import { q } from './db';
import { uuid } from './ids';
import type { Integration, RunEvent } from './integration_types';
import { postWebhook } from './post_webhook';

/** Re-export GitHub delivery from dedicated module. */
export { deliverGitHub } from './providers_scm_github';

/**
 * Log a webhook delivery attempt to the database.
 */
export async function logDelivery(
  env: Env,
  integrationId: string,
  runId: string,
  event: string,
  meta: Record<string, string>,
  statusCode: number,
  body: string,
  ok: boolean
) {
  await q(
    env,
    `INSERT INTO webhook_delivery (id, integration_id, run_id, event, payload, status_code, response_body, success, attempted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid(),
      integrationId,
      runId,
      event,
      JSON.stringify(meta).slice(0, 5000),
      statusCode,
      body,
      ok ? 1 : 0,
      new Date().toISOString(),
    ]
  );
}

export async function deliverGitLab(
  env: Env,
  integration: Integration,
  config: { webhook_url?: string; token?: string; project_id?: string },
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  if (config.webhook_url) {
    return await postWebhook(env, integration.id, runEvent.runId, event, config.webhook_url, {
      event,
      object_kind: 'pipeline',
      data: {
        run_id: runEvent.runId,
        flow_name: runEvent.flowName,
        status: runEvent.status,
      },
    });
  }
  return false;
}

export async function deliverJira(
  env: Env,
  integration: Integration,
  config: {
    webhook_url?: string;
    base_url?: string;
    email?: string;
    api_token?: string;
    project_key?: string;
    issue_type?: string;
  },
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  if (
    config.base_url &&
    config.email &&
    config.api_token &&
    config.project_key &&
    runEvent.status === 'failed'
  ) {
    const summary = `[CodeRail] Flow failed: ${runEvent.flowName}`;
    const description = [
      `Run ID: ${runEvent.runId}`,
      runEvent.errorMessage ? `Error: ${runEvent.errorMessage}` : '',
      env.PUBLIC_BASE_URL
        ? `Details: ${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/runs/${runEvent.runId}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const basic = btoa(`${config.email}:${config.api_token}`);
    const jiraResp = await fetch(`${config.base_url.replace(/\/$/, '')}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basic}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: config.project_key },
          summary,
          description,
          issuetype: { name: config.issue_type || 'Task' },
        },
      }),
    });

    const body = (await jiraResp.text()).slice(0, 1000);
    await logDelivery(
      env,
      integration.id,
      runEvent.runId,
      event,
      { provider: 'jira', action: 'create_issue', project: config.project_key },
      jiraResp.status,
      body,
      jiraResp.ok
    );
    return jiraResp.ok;
  }

  if (config.webhook_url) {
    return await postWebhook(env, integration.id, runEvent.runId, event, config.webhook_url, {
      event,
      data: {
        run_id: runEvent.runId,
        flow_name: runEvent.flowName,
        status: runEvent.status,
      },
    });
  }

  return false;
}
