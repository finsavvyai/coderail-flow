import type { Env } from './env';
import { q, q1 } from './db';

export type BillingVariables = { userId: string; userEmail?: string };

export const PLAN_LIMITS: Record<string, { runs: number; flows: number }> = {
  free: { runs: 10, flows: 3 },
  pro: { runs: 500, flows: 25 },
  team: { runs: 2000, flows: -1 },
  enterprise: { runs: -1, flows: -1 },
};

export function formatUserResponse(user: any, limits: { runs: number; flows: number }) {
  return {
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
  };
}

export async function lemonSqueezyRequest(
  apiKey: string,
  endpoint: string,
  body: any
): Promise<any> {
  const res = await fetch(`https://api.lemonsqueezy.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Lemon Squeezy API error: ${JSON.stringify(data)}`);
  }
  return data;
}

export async function checkUsageLimit(
  env: Env,
  clerkId: string
): Promise<{ allowed: boolean; plan: string; used: number; limit: number }> {
  const user = await q1<any>(env, 'SELECT * FROM user_account WHERE clerk_id = ?', [clerkId]);
  if (!user) return { allowed: true, plan: 'free', used: 0, limit: 10 };

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  if (limits.runs === -1) {
    return { allowed: true, plan: user.plan, used: user.runs_this_month, limit: -1 };
  }

  return {
    allowed: user.runs_this_month < limits.runs,
    plan: user.plan,
    used: user.runs_this_month,
    limit: limits.runs,
  };
}

export async function incrementUsage(env: Env, clerkId: string): Promise<void> {
  await q(
    env,
    'UPDATE user_account SET runs_this_month = runs_this_month + 1, updated_at = ? WHERE clerk_id = ?',
    [new Date().toISOString(), clerkId]
  );
}
