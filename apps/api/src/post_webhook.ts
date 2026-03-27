/** HTTP POST helper with retry logic and delivery logging. */
import type { Env } from './env';
import { q } from './db';
import { uuid } from './ids';
import type { DeliveryOptions } from './integration_types';
import { sleep } from './integration_types';

export async function postWebhook(
  env: Env,
  integrationId: string,
  runId: string | undefined,
  event: string,
  url: string,
  payload: any,
  extraHeaders?: Record<string, string>,
  options?: DeliveryOptions
): Promise<boolean> {
  const deliveryId = uuid();
  let statusCode = 0;
  let responseBody = '';
  let success = false;
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 1);
  const retryDelayMs = Math.max(0, options?.retryDelayMs ?? 0);
  let attempt = 0;

  while (attempt < maxAttempts && !success) {
    attempt += 1;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodeRailFlow/1.0',
          ...(extraHeaders || {}),
        },
        body: JSON.stringify(payload),
      });
      statusCode = resp.status;
      responseBody = (await resp.text()).slice(0, 1000);
      success = resp.ok;
    } catch (err: any) {
      responseBody = err.message?.slice(0, 500) || 'Unknown error';
      statusCode = 0;
    }

    if (!success && attempt < maxAttempts) {
      await sleep(retryDelayMs * attempt);
    }
  }

  const withAttemptMeta = `attempt=${attempt}/${maxAttempts}${responseBody ? ` | ${responseBody}` : ''}`;

  await q(
    env,
    `INSERT INTO webhook_delivery (id, integration_id, run_id, event, payload, status_code, response_body, success, attempted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      deliveryId,
      integrationId,
      runId || null,
      event,
      JSON.stringify(payload).slice(0, 5000),
      statusCode,
      withAttemptMeta.slice(0, 1000),
      success ? 1 : 0,
      new Date().toISOString(),
    ]
  );

  return success;
}
