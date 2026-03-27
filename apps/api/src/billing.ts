import { Hono } from 'hono';
import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';
import { requireAuth } from './auth';
import {
  PLAN_LIMITS,
  formatUserResponse,
  lemonSqueezyRequest,
  type BillingVariables,
} from './billing_helpers';
import { webhookRouter } from './billing_webhook';

const billing = new Hono<{ Bindings: Env; Variables: BillingVariables }>();
const auth = requireAuth();

// ---- Get or create user account ----
billing.post('/account/sync', auth, async (c) => {
  const env = c.env;
  const clerkId = c.get('userId');
  const body = await c.req.json<{ email: string; name?: string }>();

  if (!body.email) {
    return c.json({ error: 'email required' }, 400);
  }

  let user = await q1<any>(env, 'SELECT * FROM user_account WHERE clerk_id = ?', [clerkId]);

  if (!user) {
    const id = uuid();
    const now = new Date().toISOString();
    await q(
      env,
      `INSERT INTO user_account (id, clerk_id, email, name, plan, runs_this_month, runs_reset_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'free', 0, ?, ?, ?)`,
      [id, clerkId, body.email, body.name ?? null, now, now, now]
    );
    user = await q1<any>(env, 'SELECT * FROM user_account WHERE id = ?', [id]);
  }

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  return c.json(formatUserResponse(user, limits));
});

// ---- Get account info ----
billing.get('/account', auth, async (c) => {
  const env = c.env;
  const clerkId = c.get('userId');

  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE clerk_id = ?', [clerkId]);
  if (!user) return c.json({ error: 'user_not_found' }, 404);

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  return c.json(formatUserResponse(user, limits));
});

// ---- Create Lemon Squeezy checkout ----
billing.post('/checkout', auth, async (c) => {
  const env = c.env;
  if (!env.LEMONSQUEEZY_API_KEY) {
    return c.json({ error: 'Lemon Squeezy not configured' }, 503);
  }

  const clerkId = c.get('userId');
  const body = await c.req.json<{ plan: 'pro' | 'team' }>();
  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE clerk_id = ?', [clerkId]);
  if (!user) return c.json({ error: 'user_not_found' }, 404);

  const variantId =
    body.plan === 'pro' ? env.LEMONSQUEEZY_VARIANT_PRO : env.LEMONSQUEEZY_VARIANT_TEAM;
  if (!variantId) return c.json({ error: 'Variant not configured for plan: ' + body.plan }, 503);

  const storeId = env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) return c.json({ error: 'Store ID not configured' }, 503);

  const checkout = await lemonSqueezyRequest(env.LEMONSQUEEZY_API_KEY, 'checkouts', {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: user.email,
          name: user.name ?? undefined,
          custom: {
            coderail_user_id: user.id,
            clerk_id: user.clerk_id,
            plan: body.plan,
          },
        },
        product_options: {
          redirect_url: `${env.PUBLIC_BASE_URL}/app?checkout=success`,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: variantId } },
      },
    },
  });

  const checkoutUrl = checkout?.data?.attributes?.url;
  if (!checkoutUrl) {
    return c.json({ error: 'Failed to create checkout' }, 500);
  }

  return c.json({ checkoutUrl });
});

// Mount webhook routes
billing.route('/', webhookRouter);

// Re-export everything needed by other modules
export { billing, PLAN_LIMITS };
export { checkUsageLimit, incrementUsage } from './billing_helpers';
