import type { Env } from './env';
import { q1 } from './db';

export async function artifactSignedUrl(env: Env, artifactId: string): Promise<string | null> {
  // In production: use R2 signed URLs.
  // For starter: return a Worker route URL that streams from DB-stored content when present.
  const art = await q1<{ id: string; kind: string }>(
    env,
    'SELECT id, kind FROM artifact WHERE id = ?',
    [artifactId]
  );
  if (!art) return null;
  return `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/api/artifacts/${artifactId}/download`;
}
