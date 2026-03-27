import type { Env } from './env';

export async function q(env: Env, sql: string, params: any[] = []) {
  const stmt = env.DB.prepare(sql);
  const bound = params.length ? stmt.bind(...params) : stmt;
  return bound.all();
}

export async function q1<T = any>(env: Env, sql: string, params: any[] = []): Promise<T | null> {
  const res = await q(env, sql, params);
  return (res.results?.[0] as T) ?? null;
}
