import type { Env } from './env';

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry>();

function getMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setMemory<T>(key: string, value: T, ttlSeconds: number): void {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function readThroughCache<T>(
  env: Env,
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const memoryValue = getMemory<T>(key);
  if (memoryValue !== null) {
    return memoryValue;
  }

  if (env.CACHE) {
    try {
      const raw = await env.CACHE.get(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        setMemory(key, parsed, ttlSeconds);
        return parsed;
      }
    } catch {
      // Ignore cache read errors and fallback to loader
    }
  }

  const loaded = await loader();
  setMemory(key, loaded, ttlSeconds);

  if (env.CACHE) {
    try {
      await env.CACHE.put(key, JSON.stringify(loaded), { expirationTtl: ttlSeconds });
    } catch {
      // Ignore cache write errors to avoid impacting request path
    }
  }

  return loaded;
}
