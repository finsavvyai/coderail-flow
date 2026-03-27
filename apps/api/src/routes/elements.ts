import { Hono } from 'hono';
import { z } from 'zod';
import {
  ElementSchema,
  verifyProjectMembership,
  getElementWithProject,
  parseElementRow,
  buildElementUpdateFields,
} from './elements-validation';

export const elementRoutes = new Hono<{ Bindings: Env }>();

// POST /elements - Create element with locators
elementRoutes.post('/', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  try {
    const element = ElementSchema.parse(await c.req.json());
    const screen = await c.env.DB.prepare('SELECT project_id FROM screens WHERE id = ?')
      .bind(element.screen_id)
      .first();
    if (!screen) return c.json({ error: 'screen_not_found' }, 404);

    if (!(await verifyProjectMembership(c.env.DB, screen.project_id as string, token))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const result = await c.env.DB.prepare(
      `
      INSERT INTO elements (screen_id, name, primary_locator, primary_strategy, reliability_score, fallback_chain, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        element.screen_id,
        element.name,
        element.primary_locator,
        element.primary_strategy,
        element.reliability_score,
        JSON.stringify(element.fallback_chain),
        JSON.stringify(element.metadata || {})
      )
      .run();

    return c.json({ id: result.meta.last_row_id.toString(), ...element }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'validation_error', details: error.errors }, 400);
    }
    console.error('Error creating element:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// GET /elements - List elements for a screen
elementRoutes.get('/', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  const screenId = c.req.query('screenId');
  if (!screenId) return c.json({ error: 'screen_id_required' }, 400);

  try {
    const screen = await c.env.DB.prepare(
      'SELECT p.id as project_id FROM screens s JOIN projects p ON p.project_id = p.id WHERE s.id = ?'
    )
      .bind(screenId)
      .first();
    if (!screen) return c.json({ error: 'screen_not_found' }, 404);

    if (!(await verifyProjectMembership(c.env.DB, screen.project_id as string, token))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const elements = await c.env.DB.prepare(
      'SELECT * FROM elements WHERE screen_id = ? ORDER BY created_at DESC'
    )
      .bind(screenId)
      .all();

    return c.json({ elements: elements.results.map(parseElementRow) });
  } catch (error) {
    console.error('Error listing elements:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// GET /elements/:id - Get element details
elementRoutes.get('/:id', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  try {
    const element = await getElementWithProject(c.env.DB, c.req.param('id'));
    if (!element) return c.json({ error: 'element_not_found' }, 404);

    if (!(await verifyProjectMembership(c.env.DB, element.project_id, token))) {
      return c.json({ error: 'forbidden' }, 403);
    }
    return c.json(parseElementRow(element));
  } catch (error) {
    console.error('Error getting element:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// PUT /elements/:id - Update element
elementRoutes.put('/:id', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  try {
    const updates = ElementSchema.partial().parse(await c.req.json());
    const element = await getElementWithProject(c.env.DB, c.req.param('id'));
    if (!element) return c.json({ error: 'element_not_found' }, 404);

    if (!(await verifyProjectMembership(c.env.DB, element.project_id, token))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const { fields, values } = buildElementUpdateFields(updates);
    if (fields.length === 0) return c.json({ error: 'no_updates' }, 400);

    values.push(c.req.param('id'));
    await c.env.DB.prepare(`UPDATE elements SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'validation_error', details: error.errors }, 400);
    }
    console.error('Error updating element:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// DELETE /elements/:id - Delete element
elementRoutes.delete('/:id', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'unauthorized' }, 401);

  try {
    const element = await getElementWithProject(c.env.DB, c.req.param('id'));
    if (!element) return c.json({ error: 'element_not_found' }, 404);

    if (!(await verifyProjectMembership(c.env.DB, element.project_id, token))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM elements WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting element:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});
