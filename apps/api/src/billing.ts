import { Hono } from "hono";
import type { Env } from "./env";
import { q, q1 } from "./db";
import { uuid } from "./ids";
import { requireAuth } from "./auth";

type Variables = { userId: string; userEmail?: string };
const billing = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

const PLAN_LIMITS: Record<string, { runs: number; flows: number }> = {
  free: { runs: 10, flows: 3 },
  pro: { runs: 500, flows: 25 },
  team: { runs: 2000, flows: -1 },
  enterprise: { runs: -1, flows: -1 },
};

// ---- Get or create user account ----
billing.post("/account/sync", auth, async (c) => {
  const env = c.env;
  const clerkId = c.get("userId");
  const body = await c.req.json<{ email: string; name?: string }>();

  if (!body.email) {
    return c.json({ error: "email required" }, 400);
  }

  let user = await q1<any>(env, "SELECT * FROM user_account WHERE clerk_id = ?", [clerkId]);

  if (!user) {
    const id = uuid();
    const now = new Date().toISOString();
    await q(env, `INSERT INTO user_account (id, clerk_id, email, name, plan, runs_this_month, runs_reset_at, created_at, updated_at)
                  VALUES (?, ?, ?, ?, 'free', 0, ?, ?, ?)`,
      [id, clerkId, body.email, body.name ?? null, now, now, now]
    );
    user = await q1<any>(env, "SELECT * FROM user_account WHERE id = ?", [id]);
  }

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      runsThisMonth: user.runs_this_month,
      runsLimit: limits.runs,
      flowsLimit: limits.flows,
      hasSubscription: !!user.stripe_subscription_id,
    },
  });
});

// ---- Get account info ----
billing.get("/account", auth, async (c) => {
  const env = c.env;
  const clerkId = c.get("userId");

  const user = await q1<any>(env, "SELECT * FROM user_account WHERE clerk_id = ?", [clerkId]);
  if (!user) return c.json({ error: "user_not_found" }, 404);

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      runsThisMonth: user.runs_this_month,
      runsLimit: limits.runs,
      flowsLimit: limits.flows,
      hasSubscription: !!user.stripe_subscription_id,
    },
  });
});

// ---- Create Lemon Squeezy checkout ----
billing.post("/checkout", auth, async (c) => {
  const env = c.env;
  if (!env.LEMONSQUEEZY_API_KEY) {
    return c.json({ error: "Lemon Squeezy not configured" }, 503);
  }

  const clerkId = c.get("userId");
  const body = await c.req.json<{ plan: "pro" | "team" }>();
  const user = await q1<any>(env, "SELECT * FROM user_account WHERE clerk_id = ?", [clerkId]);
  if (!user) return c.json({ error: "user_not_found" }, 404);

  const variantId = body.plan === "pro" ? env.LEMONSQUEEZY_VARIANT_PRO : env.LEMONSQUEEZY_VARIANT_TEAM;
  if (!variantId) return c.json({ error: "Variant not configured for plan: " + body.plan }, 503);

  const storeId = env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) return c.json({ error: "Store ID not configured" }, 503);

  // Create Lemon Squeezy checkout via API
  const checkout = await lemonSqueezyRequest(env.LEMONSQUEEZY_API_KEY, "checkouts", {
    data: {
      type: "checkouts",
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
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  });

  const checkoutUrl = checkout?.data?.attributes?.url;
  if (!checkoutUrl) {
    return c.json({ error: "Failed to create checkout" }, 500);
  }

  return c.json({ checkoutUrl });
});

// ---- Lemon Squeezy webhook ----
billing.post("/webhook/lemonsqueezy", async (c) => {
  const env = c.env;
  const rawBody = await c.req.text();

  // Verify webhook signature if secret is set
  if (env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    const signature = c.req.header("x-signature");
    if (!signature) return c.json({ error: "Missing signature" }, 401);

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.LEMONSQUEEZY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    if (hex !== signature) {
      return c.json({ error: "Invalid signature" }, 401);
    }
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const now = new Date().toISOString();
  const eventName = event.meta?.event_name;
  const customData = event.meta?.custom_data;
  const userId = customData?.coderail_user_id;
  const plan = customData?.plan;

  switch (eventName) {
    case "subscription_created": {
      if (userId && plan) {
        const subId = String(event.data?.id ?? "");
        const customerId = String(event.data?.attributes?.customer_id ?? "");

        await q(env, `UPDATE user_account SET plan = ?, stripe_subscription_id = ?, stripe_customer_id = ?, updated_at = ? WHERE id = ?`,
          [plan, subId, customerId, now, userId]
        );

        await q(env, `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
          [uuid(), userId, `ls_${subId}`, "subscription_created", JSON.stringify({ plan, subId, customerId }), now]
        );
      }
      break;
    }

    case "subscription_updated": {
      const subId = String(event.data?.id ?? "");
      const status = event.data?.attributes?.status;
      const user = await q1<any>(env, "SELECT * FROM user_account WHERE stripe_subscription_id = ?", [subId]);

      if (user) {
        if (status === "active" || status === "on_trial") {
          // Keep current plan
        } else if (status === "cancelled" || status === "expired" || status === "unpaid") {
          await q(env, `UPDATE user_account SET plan = 'free', stripe_subscription_id = NULL, updated_at = ? WHERE id = ?`,
            [now, user.id]
          );
        }

        await q(env, `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
          [uuid(), user.id, `ls_update_${subId}`, "subscription_updated", JSON.stringify({ status }), now]
        );
      }
      break;
    }

    case "subscription_cancelled": {
      const subId = String(event.data?.id ?? "");
      const user = await q1<any>(env, "SELECT * FROM user_account WHERE stripe_subscription_id = ?", [subId]);

      if (user) {
        await q(env, `UPDATE user_account SET plan = 'free', stripe_subscription_id = NULL, updated_at = ? WHERE id = ?`,
          [now, user.id]
        );

        await q(env, `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, metadata, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
          [uuid(), user.id, `ls_cancel_${subId}`, "subscription_cancelled", JSON.stringify({ subId }), now]
        );
      }
      break;
    }

    case "subscription_payment_success": {
      const subId = String(event.data?.id ?? "");
      const user = await q1<any>(env, "SELECT * FROM user_account WHERE stripe_subscription_id = ?", [subId]);

      if (user) {
        const amount = event.data?.attributes?.first_subscription_item?.price ?? 0;
        await q(env, `INSERT INTO payment_event (id, user_id, stripe_event_id, event_type, amount_cents, currency, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuid(), user.id, `ls_pay_${Date.now()}`, "payment_succeeded", amount, "usd", now]
        );
      }
      break;
    }
  }

  return c.json({ received: true });
});

// ---- Lemon Squeezy API helper ----
async function lemonSqueezyRequest(apiKey: string, endpoint: string, body: any): Promise<any> {
  const res = await fetch(`https://api.lemonsqueezy.com/v1/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Lemon Squeezy API error: ${JSON.stringify(data)}`);
  }
  return data;
}

// ---- Usage check helper (exported for middleware) ----
export async function checkUsageLimit(env: Env, clerkId: string): Promise<{ allowed: boolean; plan: string; used: number; limit: number }> {
  const user = await q1<any>(env, "SELECT * FROM user_account WHERE clerk_id = ?", [clerkId]);
  if (!user) return { allowed: true, plan: "free", used: 0, limit: 10 };

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  if (limits.runs === -1) return { allowed: true, plan: user.plan, used: user.runs_this_month, limit: -1 };

  return {
    allowed: user.runs_this_month < limits.runs,
    plan: user.plan,
    used: user.runs_this_month,
    limit: limits.runs,
  };
}

export async function incrementUsage(env: Env, clerkId: string): Promise<void> {
  await q(env, "UPDATE user_account SET runs_this_month = runs_this_month + 1, updated_at = ? WHERE clerk_id = ?",
    [new Date().toISOString(), clerkId]
  );
}

export { billing, PLAN_LIMITS };
