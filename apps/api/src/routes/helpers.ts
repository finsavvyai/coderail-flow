/**
 * Shared route helpers and utility functions.
 */

import type { Env } from '../env';
import { q } from '../db';
import { readAuthProfilePayloadFromRow, type AuthProfileStorageMode } from '../auth_profiles';

export function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function normalizeTimeRangeToDays(timeRange?: string): number {
  if (timeRange === '90d') return 90;
  if (timeRange === '30d') return 30;
  return 7;
}

export async function getTableColumns(env: Env, tableName: string): Promise<Set<string>> {
  const info = await q(env, `PRAGMA table_info(${tableName})`);
  return new Set(((info.results ?? []) as any[]).map((r) => String(r.name)));
}

export async function getAuthProfileStorageMode(env: Env): Promise<AuthProfileStorageMode> {
  const columns = await getTableColumns(env, 'auth_profile');
  return columns.has('encrypted_payload') ? 'encrypted_payload' : 'legacy';
}

export async function flowSupportsAuthProfile(env: Env): Promise<boolean> {
  const columns = await getTableColumns(env, 'flow');
  return columns.has('auth_profile_id');
}

export async function resolveArtifactBody(
  env: Env,
  art: any
): Promise<ReadableStream | ArrayBuffer | string> {
  if (art.r2_key && env.ARTIFACTS) {
    const obj = await env.ARTIFACTS.get(art.r2_key);
    if (obj) return obj.body;
  }
  return art.inline_content ?? '';
}
