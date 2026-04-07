/**
 * Skill marketplace API routes.
 *
 * Manages skill publishing, discovery, installation, and reviews.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';

type Variables = { userId: string; userEmail?: string };
const skills = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);
const writeLimit = rateLimit(30, 60_000);

/** List published skills (public, no auth required for browsing). */
skills.get('/', readLimit, async (c) => {
  const tag = c.req.query('tag');
  const search = c.req.query('q');
  let sql =
    'SELECT id, name, version, description, author_name, tags, installs, stars, rating, created_at FROM skill WHERE published = 1';
  const params: unknown[] = [];

  if (tag) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY stars DESC, installs DESC LIMIT 100';
  const result = await q(c.env, sql, params);
  return c.json({ skills: result.results || [] });
});

/** Get skill details by ID. */
skills.get('/:id', readLimit, async (c) => {
  const row = await q1(c.env, 'SELECT * FROM skill WHERE id = ?', [c.req.param('id')]);
  if (!row) return c.json({ error: 'not_found', message: 'Skill not found' }, 404);
  return c.json({ skill: row });
});

/** Publish a new skill. */
skills.post('/', auth, writeLimit, async (c) => {
  const body = await c.req.json<{
    name: string;
    version: string;
    description: string;
    manifest: Record<string, unknown>;
    tags?: string[];
  }>();

  if (!body.name || !body.version || !body.description || !body.manifest) {
    return c.json(
      { error: 'validation_error', message: 'name, version, description, manifest required' },
      400
    );
  }

  const existing = await q1(c.env, 'SELECT id FROM skill WHERE name = ?', [body.name]);
  if (existing) {
    return c.json({ error: 'conflict', message: 'Skill name already taken' }, 409);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const userId = c.get('userId');

  await q(
    c.env,
    `INSERT INTO skill (id, name, version, description, author_id, author_name, manifest, tags, published, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      id,
      body.name,
      body.version,
      body.description,
      userId,
      userId,
      JSON.stringify(body.manifest),
      JSON.stringify(body.tags || []),
      now,
      now,
    ]
  );

  return c.json({ skill: { id, name: body.name } }, 201);
});

/** Install a skill for an org. */
skills.post('/:id/install', auth, writeLimit, async (c) => {
  const skillId = c.req.param('id');
  const skill = await q1(c.env, 'SELECT id FROM skill WHERE id = ? AND published = 1', [skillId]);
  if (!skill) return c.json({ error: 'not_found', message: 'Skill not found' }, 404);

  const orgId = c.req.query('orgId') || 'default';
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await q(
    c.env,
    'INSERT OR IGNORE INTO skill_install (id, skill_id, org_id, installed_at) VALUES (?, ?, ?, ?)',
    [id, skillId, orgId, now]
  );

  await q(c.env, 'UPDATE skill SET installs = installs + 1 WHERE id = ?', [skillId]);
  return c.json({ ok: true, installed: true });
});

/** Uninstall a skill. */
skills.delete('/:id/install', auth, writeLimit, async (c) => {
  const skillId = c.req.param('id');
  const orgId = c.req.query('orgId') || 'default';
  await q(c.env, 'DELETE FROM skill_install WHERE skill_id = ? AND org_id = ?', [skillId, orgId]);
  return c.json({ ok: true });
});

/** List installed skills for an org. */
skills.get('/installed', auth, readLimit, async (c) => {
  const orgId = c.req.query('orgId') || 'default';
  const result = await q(
    c.env,
    `SELECT s.* FROM skill s
     JOIN skill_install si ON si.skill_id = s.id
     WHERE si.org_id = ? ORDER BY si.installed_at DESC`,
    [orgId]
  );
  return c.json({ skills: result.results || [] });
});

/** Submit a review. */
skills.post('/:id/reviews', auth, writeLimit, async (c) => {
  const skillId = c.req.param('id');
  const body = await c.req.json<{ rating: number; comment?: string }>();

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return c.json({ error: 'validation_error', message: 'rating must be 1-5' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await q(
    c.env,
    'INSERT INTO skill_review (id, skill_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, skillId, c.get('userId'), body.rating, body.comment || null, now]
  );

  // Recalculate average rating
  const avg = await q1<{ avg_rating: number }>(
    c.env,
    'SELECT AVG(rating) as avg_rating FROM skill_review WHERE skill_id = ?',
    [skillId]
  );
  if (avg) {
    await q(c.env, 'UPDATE skill SET rating = ?, stars = stars + 1 WHERE id = ?', [
      (avg as any).avg_rating,
      skillId,
    ]);
  }

  return c.json({ ok: true }, 201);
});

export { skills };
