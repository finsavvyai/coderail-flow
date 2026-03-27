/**
 * Notification-style integration providers: Slack and generic webhook.
 */
import type { Env } from './env';
import type { Integration, RunEvent } from './integration_types';
import { postWebhook } from './post_webhook';

// ── Slack ────────────────────────────────────────────────────
export async function deliverSlack(
  env: Env,
  integration: Integration,
  config: { webhook_url: string; channel?: string },
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  if (!config.webhook_url) return false;

  const isSuccess = runEvent.status === 'succeeded';
  const emoji = isSuccess ? '\u2705' : '\u274C';
  const color = isSuccess ? '#22c55e' : '#ef4444';
  const statusText = isSuccess ? 'Succeeded' : 'Failed';

  const payload = {
    username: 'CodeRail Flow',
    icon_emoji: ':robot_face:',
    channel: config.channel || undefined,
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *Flow Run ${statusText}*\n*Flow:* ${runEvent.flowName}\n*Run ID:* \`${runEvent.runId}\`${
                runEvent.errorMessage ? `\n*Error:* ${runEvent.errorMessage}` : ''
              }${runEvent.artifactCount ? `\n*Artifacts:* ${runEvent.artifactCount} files` : ''}${
                env.PUBLIC_BASE_URL
                  ? `\n*Details:* ${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/runs/${runEvent.runId}`
                  : ''
              }`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Started: ${runEvent.startedAt || '\u2014'} | Finished: ${runEvent.finishedAt || '\u2014'}`,
              },
            ],
          },
        ],
      },
    ],
  };

  return await postWebhook(env, integration.id, runEvent.runId, event, config.webhook_url, payload);
}

// ── Generic Webhook ─────────────────────────────────────────
export async function deliverGenericWebhook(
  env: Env,
  integration: Integration,
  config: {
    url: string;
    secret?: string;
    headers?: Record<string, string>;
    retry_attempts?: number | string;
    retry_delay_ms?: number | string;
  },
  event: string,
  runEvent: RunEvent
): Promise<boolean> {
  if (!config.url) return false;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data: {
      run_id: runEvent.runId,
      flow_id: runEvent.flowId,
      flow_name: runEvent.flowName,
      status: runEvent.status,
      started_at: runEvent.startedAt,
      finished_at: runEvent.finishedAt,
      error_message: runEvent.errorMessage,
      artifact_count: runEvent.artifactCount,
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CodeRail-Event': event,
    ...(config.headers || {}),
  };

  if (config.secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(config.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(JSON.stringify(payload)));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    headers['X-CodeRail-Signature'] = `sha256=${hex}`;
  }

  const maxAttemptsRaw = Number(config.retry_attempts ?? 3);
  const retryDelayRaw = Number(config.retry_delay_ms ?? 1000);
  const maxAttempts = Number.isFinite(maxAttemptsRaw)
    ? Math.min(5, Math.max(1, Math.round(maxAttemptsRaw)))
    : 3;
  const retryDelayMs = Number.isFinite(retryDelayRaw)
    ? Math.min(15000, Math.max(0, Math.round(retryDelayRaw)))
    : 1000;

  return await postWebhook(
    env,
    integration.id,
    runEvent.runId,
    event,
    config.url,
    payload,
    headers,
    {
      maxAttempts,
      retryDelayMs,
    }
  );
}
