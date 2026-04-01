// Auth profile validation schemas and access helpers

import { z } from 'zod';
import { resolveUserLookup } from '../auth-subject';

export const AuthProfileSchema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  cookies: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
      domain: z.string().optional(),
      path: z.string().optional(),
      httpOnly: z.boolean().optional(),
      secure: z.boolean().optional(),
      sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
      expires: z.string().optional(),
    })
  ),
});

export type AuthProfileType = z.infer<typeof AuthProfileSchema>;

/** Verify user has access to a project via org membership */
export async function verifyProjectAccess(
  db: any,
  projectId: string,
  userId: string
): Promise<boolean> {
  const { tableName, subjectColumn } = await resolveUserLookup(db);
  const membership = await db
    .prepare(
      `SELECT om.* FROM org_members om JOIN projects p ON p.org_id = om.org_id WHERE p.id = ? AND om.user_id = (SELECT id FROM ${tableName} WHERE ${subjectColumn} = ?)`
    )
    .bind(projectId, userId)
    .first();
  return !!membership;
}

/** Verify user has access via org ID */
export async function verifyOrgAccess(db: any, orgId: string, userId: string): Promise<boolean> {
  const { tableName, subjectColumn } = await resolveUserLookup(db);
  const membership = await db
    .prepare(
      `SELECT om.* FROM org_members om WHERE om.org_id = ? AND om.user_id = (SELECT id FROM ${tableName} WHERE ${subjectColumn} = ?)`
    )
    .bind(orgId, userId)
    .first();
  return !!membership;
}

/** Get profile with org ID for access verification */
export async function getProfileWithOrg(db: any, profileId: string): Promise<any | null> {
  return db
    .prepare(
      'SELECT ap.*, p.org_id FROM auth_profiles ap JOIN projects p ON p.id = ap.project_id WHERE ap.id = ?'
    )
    .bind(profileId)
    .first();
}
