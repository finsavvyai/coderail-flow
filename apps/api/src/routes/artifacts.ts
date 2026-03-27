/**
 * Artifact download and preview route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { resolveArtifactBody } from './helpers';

type Variables = { userId: string; userEmail?: string };
const artifacts = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);

artifacts.get('/:runId', auth, readLimit, async (c) => {
  const runId = c.req.param('runId');
  const res = await q(
    c.env,
    'SELECT id, kind, content_type, bytes, created_at FROM artifact WHERE run_id = ? ORDER BY created_at ASC',
    [runId]
  );
  return c.json({ artifacts: res.results ?? [] });
});

artifacts.get('/:id/download', auth, readLimit, async (c) => {
  const id = c.req.param('id');
  const art = await q1<any>(c.env, 'SELECT * FROM artifact WHERE id = ?', [id]);
  if (!art) return c.json({ error: 'artifact_not_found' }, 404);

  const body = await resolveArtifactBody(c.env, art);
  const ext =
    art.kind === 'report'
      ? 'json'
      : art.kind === 'subtitle'
        ? 'srt'
        : art.kind.startsWith('screenshot')
          ? 'webp'
          : 'bin';
  return new Response(body as any, {
    headers: {
      'content-type': art.content_type ?? 'application/octet-stream',
      'content-disposition': `attachment; filename="coderail-${id}.${ext}"`,
    },
  });
});

artifacts.get('/:id/preview', auth, readLimit, async (c) => {
  const id = c.req.param('id');
  const art = await q1<any>(c.env, 'SELECT * FROM artifact WHERE id = ?', [id]);
  if (!art) return c.json({ error: 'artifact_not_found' }, 404);

  const body = await resolveArtifactBody(c.env, art);
  return new Response(body as any, {
    headers: {
      'content-type': art.content_type ?? 'application/octet-stream',
      'cache-control': 'public, max-age=3600',
    },
  });
});

export { artifacts };
