import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DB and uuid before importing the module
vi.mock('./db.js', () => ({
  q: vi.fn().mockResolvedValue({ results: [] }),
  q1: vi.fn().mockResolvedValue(null),
}));
vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('mock-uuid') }));

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const SECRET = 'test-webhook-secret';
const BASE_ENV = { LEMONSQUEEZY_WEBHOOK_SECRET: SECRET };

async function postWebhook(env: Record<string, any>, body: object, signature?: string) {
  const { webhookRouter } = await import('./billing_webhook.js');
  const bodyStr = JSON.stringify(body);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (signature !== undefined) headers['x-signature'] = signature;

  return webhookRouter.request(
    '/webhook/lemonsqueezy',
    { method: 'POST', body: bodyStr, headers },
    env
  );
}

describe('billing webhook signature verification', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue(null),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('mock-uuid') }));
  });

  it('returns 401 when secret is configured but signature header is missing', async () => {
    const res = await postWebhook(BASE_ENV, { meta: { event_name: 'subscription_created' } });
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.error).toContain('signature');
  });

  it('returns 401 when signature does not match', async () => {
    const res = await postWebhook(BASE_ENV, {}, 'deadbeef');
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.error).toContain('Invalid signature');
  });

  it('accepts request when secret is not configured (no signature check)', async () => {
    const res = await postWebhook({}, { meta: { event_name: 'unknown_event' } });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.received).toBe(true);
  });

  it('accepts request with valid HMAC-SHA256 signature', async () => {
    const body = { meta: { event_name: 'unknown_event' } };
    const bodyStr = JSON.stringify(body);
    const signature = await hmacHex(SECRET, bodyStr);

    const res = await postWebhook(BASE_ENV, body, signature);
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.received).toBe(true);
  });

  it('returns 400 for invalid JSON body', async () => {
    const { webhookRouter } = await import('./billing_webhook.js');
    const badBody = 'not-json';
    const signature = await hmacHex(SECRET, badBody);

    const res = await webhookRouter.request(
      '/webhook/lemonsqueezy',
      {
        method: 'POST',
        body: badBody,
        headers: { 'Content-Type': 'text/plain', 'x-signature': signature },
      },
      BASE_ENV
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as any;
    expect(json.error).toContain('JSON');
  });

  it('returns 200 received:true for unrecognized event names', async () => {
    const body = { meta: { event_name: 'some_future_event' } };
    const bodyStr = JSON.stringify(body);
    const signature = await hmacHex(SECRET, bodyStr);

    const res = await postWebhook(BASE_ENV, body, signature);
    expect(res.status).toBe(200);
  });

  it('handles subscription_created event with missing custom_data gracefully', async () => {
    const body = { meta: { event_name: 'subscription_created' }, data: { id: '99' } };
    const bodyStr = JSON.stringify(body);
    const signature = await hmacHex(SECRET, bodyStr);

    const res = await postWebhook(BASE_ENV, body, signature);
    expect(res.status).toBe(200);
  });

  it('handles subscription_cancelled event with no matching user gracefully', async () => {
    const body = {
      meta: { event_name: 'subscription_cancelled' },
      data: { id: 'sub-999' },
    };
    const bodyStr = JSON.stringify(body);
    const signature = await hmacHex(SECRET, bodyStr);
    const res = await postWebhook(BASE_ENV, body, signature);
    expect(res.status).toBe(200);
  });
});
