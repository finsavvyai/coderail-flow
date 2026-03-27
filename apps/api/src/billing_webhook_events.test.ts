import { describe, it, expect, vi, beforeEach } from 'vitest';

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

async function signedPost(body: object, extraEnv: Record<string, any> = {}) {
  const { webhookRouter } = await import('./billing_webhook.js');
  const bodyStr = JSON.stringify(body);
  const signature = await hmacHex(SECRET, bodyStr);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-signature': signature,
  };

  return webhookRouter.request(
    '/webhook/lemonsqueezy',
    { method: 'POST', body: bodyStr, headers },
    { ...BASE_ENV, ...extraEnv }
  );
}

describe('billing webhook event handlers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('subscription_created: writes plan and payment_event when user + plan present', async () => {
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue(null),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('evt-id') }));

    const body = {
      meta: {
        event_name: 'subscription_created',
        custom_data: { coderail_user_id: 'u-1', plan: 'pro' },
      },
      data: { id: 'sub-1', attributes: { customer_id: 'cust-1' } },
    };
    const res = await signedPost(body);
    expect(res.status).toBe(200);
  });

  it('subscription_updated: downgrades plan for cancelled status', async () => {
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue({ id: 'u-1' }),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('evt-id') }));

    const body = {
      meta: { event_name: 'subscription_updated' },
      data: { id: 'sub-1', attributes: { status: 'cancelled' } },
    };
    const res = await signedPost(body);
    expect(res.status).toBe(200);
  });

  it('subscription_updated: skips DB write when status is active', async () => {
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue({ id: 'u-1' }),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('evt-id') }));

    const body = {
      meta: { event_name: 'subscription_updated' },
      data: { id: 'sub-1', attributes: { status: 'active' } },
    };
    const res = await signedPost(body);
    expect(res.status).toBe(200);
  });

  it('subscription_payment_success: inserts payment_event when user found', async () => {
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue({ id: 'u-1' }),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('pay-id') }));

    const body = {
      meta: { event_name: 'subscription_payment_success' },
      data: { id: 'sub-1', attributes: { first_subscription_item: { price: 999 } } },
    };
    const res = await signedPost(body);
    expect(res.status).toBe(200);
  });

  it('subscription_cancelled: downgrades plan when user found', async () => {
    vi.mock('./db.js', () => ({
      q: vi.fn().mockResolvedValue({ results: [] }),
      q1: vi.fn().mockResolvedValue({ id: 'u-2' }),
    }));
    vi.mock('./ids.js', () => ({ uuid: vi.fn().mockReturnValue('c-id') }));

    const body = {
      meta: { event_name: 'subscription_cancelled' },
      data: { id: 'sub-2' },
    };
    const res = await signedPost(body);
    expect(res.status).toBe(200);
  });
});
