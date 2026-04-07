/** GitHub SCM integration: create issues on failure and deliver webhooks. */
import type { Env } from './env';
import type { Integration, RunEvent } from './integration_types';
import { postWebhook } from './post_webhook';
import { logDelivery } from './providers_scm';

export async function deliverGitHub(
  env: Env,
  integration: Integration,
  config: {
    webhook_url?: string;
    token?: string;
    repo?: string;
    create_issue_on_failure?: boolean;
  },
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  if (
    runEvent.status === 'failed' &&
    config.token &&
    config.repo &&
    config.create_issue_on_failure
  ) {
    const issueTitle = `[CodeRail] Flow run failed: ${runEvent.flowName}`;
    const issueBody = [
      `Flow: ${runEvent.flowName}`,
      `Run ID: ${runEvent.runId}`,
      runEvent.errorMessage ? `Error: ${runEvent.errorMessage}` : '',
      env.PUBLIC_BASE_URL
        ? `Details: ${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/runs/${runEvent.runId}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const ghResp = await fetch(`https://api.github.com/repos/${config.repo}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeRailFlow/1.0',
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ title: issueTitle, body: issueBody }),
    });

    const body = (await ghResp.text()).slice(0, 1000);
    await logDelivery(
      env,
      integration.id,
      runEvent.runId,
      event,
      { provider: 'github', action: 'create_issue', repo: config.repo },
      ghResp.status,
      body,
      ghResp.ok
    );
    return ghResp.ok;
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
