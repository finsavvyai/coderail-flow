import type { Env } from './env';
import { q, q1 } from './db';
import { resolveAuthSubjectColumn } from './auth-subject';

export type BillingVariables = { userId: string; userEmail?: string };
type UserAccountRow = {
  id: string;
  auth_subject: string;
  email: string;
  name: string | null;
  plan: string;
  runs_this_month: number;
  stripe_subscription_id?: string | null;
};

async function getUserAccountSql(env: Env) {
  const subjectColumn = await resolveAuthSubjectColumn(env.DB, 'user_account');
  return {
    subjectColumn,
    selectColumns: `id, ${subjectColumn} AS auth_subject, email, name, plan, runs_this_month, stripe_subscription_id`,
  };
}

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
  authSubject: string,
  userEmail?: string
): Promise<{ allowed: boolean; plan: string; used: number; limit: number }> {
  const user = await findOrClaimUserAccount(env, authSubject, userEmail);
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

export async function incrementUsage(
  env: Env,
  authSubject: string,
  userEmail?: string
): Promise<void> {
  const user = await findOrClaimUserAccount(env, authSubject, userEmail);
  if (!user) return;

  await q(
    env,
    'UPDATE user_account SET runs_this_month = runs_this_month + 1, updated_at = ? WHERE id = ?',
    [new Date().toISOString(), user.id]
  );
}

export async function syncUserAccount(
  env: Env,
  authSubject: string,
  email: string,
  name?: string | null
): Promise<UserAccountRow> {
  const { selectColumns, subjectColumn } = await getUserAccountSql(env);
  const normalizedEmail = email.trim();
  let user = await findOrClaimUserAccount(env, authSubject, normalizedEmail);

  if (user) {
    await q(env, 'UPDATE user_account SET email = ?, name = ?, updated_at = ? WHERE id = ?', [
      normalizedEmail,
      name ?? user.name ?? null,
      new Date().toISOString(),
      user.id,
    ]);
    return (await q1<UserAccountRow>(
      env,
      `SELECT ${selectColumns} FROM user_account WHERE id = ?`,
      [user.id]
    ))!;
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await q(
    env,
    `INSERT INTO user_account (id, ${subjectColumn}, email, name, plan, runs_this_month, runs_reset_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'free', 0, ?, ?, ?)`,
    [id, authSubject, normalizedEmail, name ?? null, now, now, now]
  );

  return (await q1<UserAccountRow>(env, `SELECT ${selectColumns} FROM user_account WHERE id = ?`, [
    id,
  ]))!;
}

export async function findOrClaimUserAccount(
  env: Env,
  authSubject: string,
  userEmail?: string
): Promise<UserAccountRow | null> {
  const { selectColumns, subjectColumn } = await getUserAccountSql(env);
  const existingBySubject = await q1<UserAccountRow>(
    env,
    `SELECT ${selectColumns} FROM user_account WHERE ${subjectColumn} = ?`,
    [authSubject]
  );
  if (existingBySubject) {
    return existingBySubject;
  }

  const normalizedEmail = userEmail?.trim();
  if (!normalizedEmail) {
    return null;
  }

  const existingByEmail = await q1<UserAccountRow>(
    env,
    `SELECT ${selectColumns} FROM user_account WHERE lower(email) = lower(?)`,
    [normalizedEmail]
  );
  if (!existingByEmail) {
    return null;
  }

  await q(env, `UPDATE user_account SET ${subjectColumn} = ?, updated_at = ? WHERE id = ?`, [
    authSubject,
    new Date().toISOString(),
    existingByEmail.id,
  ]);

  return q1<UserAccountRow>(env, `SELECT ${selectColumns} FROM user_account WHERE id = ?`, [
    existingByEmail.id,
  ]);
}
