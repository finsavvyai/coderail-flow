import { Hono } from 'hono';
import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';
import type { BillingVariables } from './billing_helpers';

const webhookRouter = new Hono<{ Bindings: Env; Variables: BillingVariables }>();

async function verifySignature(
  secret: string,
  signature: string,
  rawBody: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex === signature;
}

async function handleSubscriptionCreated(env: Env, event: any, now: string) {
  const customData = event.meta?.custom_data;
  const userId = customData?.coderail_user_id;
  const plan = customData?.plan;
  if (!userId || !plan) return;

  const subId = String(event.data?.id ?? '');
  const customerId = String(event.data?.attributes?.customer_id ?? '');

  await q(
    env,
    `UPDATE user_account SET plan = ?, stripe_subscription_id = ?, stripe_customer_id = ?, updated_at = ? WHERE id = ?`,
    [plan, subId, customerId, now, userId]
  );

  await q(
    env,
    `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      uuid(),
      userId,
      `ls_${subId}`,
      'subscription_created',
      JSON.stringify({ plan, subId, customerId }),
      now,
    ]
  );
}

async function handleSubscriptionUpdated(env: Env, event: any, now: string) {
  const subId = String(event.data?.id ?? '');
  const status = event.data?.attributes?.status;
  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE stripe_subscription_id = ?', [
    subId,
  ]);
  if (!user) return;

  if (status === 'cancelled' || status === 'expired' || status === 'unpaid') {
    await q(
      env,
      `UPDATE user_account SET plan = 'free', stripe_subscription_id = NULL, updated_at = ? WHERE id = ?`,
      [now, user.id]
    );
  }

  await q(
    env,
    `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uuid(), user.id, `ls_update_${subId}`, 'subscription_updated', JSON.stringify({ status }), now]
  );
}

async function handleSubscriptionCancelled(env: Env, event: any, now: string) {
  const subId = String(event.data?.id ?? '');
  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE stripe_subscription_id = ?', [
    subId,
  ]);
  if (!user) return;

  await q(
    env,
    `UPDATE user_account SET plan = 'free', stripe_subscription_id = NULL, updated_at = ? WHERE id = ?`,
    [now, user.id]
  );

  await q(
    env,
    `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      uuid(),
      user.id,
      `ls_cancel_${subId}`,
      'subscription_cancelled',
      JSON.stringify({ subId }),
      now,
    ]
  );
}

async function handlePaymentSuccess(env: Env, event: any, now: string) {
  const subId = String(event.data?.id ?? '');
  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE stripe_subscription_id = ?', [
    subId,
  ]);
  if (!user) return;

  const amount = event.data?.attributes?.first_subscription_item?.price ?? 0;
  await q(
    env,
    `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, amount_cents, currency, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuid(), user.id, `ls_pay_${Date.now()}`, 'payment_succeeded', amount, 'usd', now]
  );
}

webhookRouter.post('/webhook/lemonsqueezy', async (c) => {
  const env = c.env;
  const rawBody = await c.req.text();

  if (env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    const signature = c.req.header('x-signature');
    if (!signature) return c.json({ error: 'Missing signature' }, 401);

    const valid = await verifySignature(env.LEMONSQUEEZY_WEBHOOK_SECRET, signature, rawBody);
    if (!valid) return c.json({ error: 'Invalid signature' }, 401);
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const now = new Date().toISOString();
  const eventName = event.meta?.event_name;

  switch (eventName) {
    case 'subscription_created':
      await handleSubscriptionCreated(env, event, now);
      break;
    case 'subscription_updated':
      await handleSubscriptionUpdated(env, event, now);
      break;
    case 'subscription_cancelled':
      await handleSubscriptionCancelled(env, event, now);
      break;
    case 'subscription_payment_success':
      await handlePaymentSuccess(env, event, now);
      break;
  }

  return c.json({ received: true });
});

export { webhookRouter };
