// Element validation schemas and access helpers

import { z } from 'zod';

export const ElementSchema = z.object({
  screen_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  primary_locator: z.string(),
  primary_strategy: z.enum(['data-testid', 'aria', 'id', 'class', 'css', 'xpath']),
  reliability_score: z.number().min(0).max(1),
  fallback_chain: z.array(
    z.object({
      locator: z.string(),
      strategy: z.enum(['data-testid', 'aria', 'id', 'class', 'css', 'xpath']),
      reliability: z.number().min(0).max(1),
    })
  ),
  metadata: z
    .object({
      tag: z.string().optional(),
      id: z.string().optional(),
      classes: z.array(z.string()).optional(),
      text: z.string().optional(),
      aria_label: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
});

export type ElementType = z.infer<typeof ElementSchema>;

/** Verify user has project access via org membership */
export async function verifyProjectMembership(
  db: any,
  projectId: string,
  token: string
): Promise<boolean> {
  const membership = await db
    .prepare(
      'SELECT om.* FROM org_members om JOIN projects p ON p.org_id = om.org_id WHERE p.id = ? AND om.user_id = (SELECT id FROM users WHERE clerk_id = ?)'
    )
    .bind(projectId, token)
    .first();
  return !!membership;
}

/** Get element with project info for access checks */
export async function getElementWithProject(db: any, elementId: string): Promise<any | null> {
  return db
    .prepare(
      'SELECT e.*, s.project_id FROM elements e JOIN screens s ON s.id = e.screen_id WHERE e.id = ?'
    )
    .bind(elementId)
    .first();
}

/** Parse JSON fields from element row */
export function parseElementRow(el: any): any {
  return {
    ...el,
    fallback_chain: JSON.parse(el.fallback_chain || '[]'),
    metadata: JSON.parse(el.metadata || '{}'),
  };
}

/** Build dynamic update query fields */
export function buildElementUpdateFields(updates: Partial<ElementType>): {
  fields: string[];
  values: any[];
} {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.primary_locator) {
    fields.push('primary_locator = ?');
    values.push(updates.primary_locator);
  }
  if (updates.primary_strategy) {
    fields.push('primary_strategy = ?');
    values.push(updates.primary_strategy);
  }
  if (updates.reliability_score !== undefined) {
    fields.push('reliability_score = ?');
    values.push(updates.reliability_score);
  }
  if (updates.fallback_chain) {
    fields.push('fallback_chain = ?');
    values.push(JSON.stringify(updates.fallback_chain));
  }
  if (updates.metadata) {
    fields.push('metadata = ?');
    values.push(JSON.stringify(updates.metadata));
  }

  return { fields, values };
}
