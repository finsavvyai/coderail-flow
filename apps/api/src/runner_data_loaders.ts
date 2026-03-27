import type { Env } from './env';
import { q } from './db';
import type { ElementData } from '@coderail-flow/runner';
import { readThroughCache } from './cache';

const ELEMENT_CACHE_TTL_SECONDS = 120;
const SCREEN_CACHE_TTL_SECONDS = 120;

export async function loadElementsForFlow(
  env: Env,
  projectId: string,
  elementIds: string[]
): Promise<ElementData[]> {
  if (elementIds.length === 0) return [];

  const sortedIds = [...new Set(elementIds)].sort();
  const cacheKey = `elements:${projectId}:${sortedIds.join(',')}`;

  return readThroughCache(env, cacheKey, ELEMENT_CACHE_TTL_SECONDS, async () => {
    const rows = await q(
      env,
      `SELECT id, name, locator_primary, locator_fallbacks, reliability_score
       FROM element
       WHERE id IN (${sortedIds.map(() => '?').join(',')})`,
      sortedIds
    );
    return ((rows.results || []) as any[]).map((row) => row as ElementData);
  });
}

export async function loadScreensForFlow(
  env: Env,
  projectId: string,
  screenIds: string[]
): Promise<Array<{ id: string; url_path: string }>> {
  if (screenIds.length === 0) return [];

  const sortedIds = [...new Set(screenIds)].sort();
  const cacheKey = `screens:${projectId}:${sortedIds.join(',')}`;

  return readThroughCache(env, cacheKey, SCREEN_CACHE_TTL_SECONDS, async () => {
    const rows = await q(
      env,
      `SELECT id, url_path
       FROM screen
       WHERE id IN (${sortedIds.map(() => '?').join(',')})`,
      sortedIds
    );
    return ((rows.results || []) as any[]).map((row) => ({
      id: String((row as any).id),
      url_path: String((row as any).url_path),
    }));
  });
}
