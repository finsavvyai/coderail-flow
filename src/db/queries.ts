import type { WorkflowRow, TemplateRow, UserRow } from "./types";

export async function getTemplates(db: D1Database): Promise<TemplateRow[]> {
  const result = await db
    .prepare(
      "SELECT id, name, description, category, trigger_type, trigger_config, actions, tags, is_public, created_at, updated_at FROM templates WHERE is_public = 1 ORDER BY created_at DESC"
    )
    .all();

  return result.results as TemplateRow[];
}

export async function getTemplateById(
  db: D1Database,
  id: string
): Promise<TemplateRow | null> {
  const result = await db
    .prepare(
      "SELECT id, name, description, category, trigger_type, trigger_config, actions, tags, is_public, created_at, updated_at FROM templates WHERE id = ?"
    )
    .bind(id)
    .first();

  return (result as TemplateRow) || null;
}

export async function createWorkflow(
  db: D1Database,
  data: {
    id: string;
    userId: string;
    name: string;
    description?: string;
    templateId?: string;
    triggerType: string;
    triggerConfig: string;
    actions: string;
    enabled?: boolean;
  }
): Promise<WorkflowRow> {
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO workflows (id, user_id, name, description, template_id, trigger_type, trigger_config, actions, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      data.id,
      data.userId,
      data.name,
      data.description || null,
      data.templateId || null,
      data.triggerType,
      data.triggerConfig,
      data.actions,
      data.enabled ? 1 : 0,
      now,
      now
    )
    .run();

  const workflow = await db
    .prepare("SELECT * FROM workflows WHERE id = ?")
    .bind(data.id)
    .first();

  return workflow as WorkflowRow;
}

export async function getWorkflows(
  db: D1Database,
  userId: string
): Promise<WorkflowRow[]> {
  const result = await db
    .prepare(
      "SELECT * FROM workflows WHERE user_id = ? ORDER BY created_at DESC"
    )
    .bind(userId)
    .all();

  return result.results as WorkflowRow[];
}

export async function getWorkflowById(
  db: D1Database,
  id: string
): Promise<WorkflowRow | null> {
  const result = await db
    .prepare("SELECT * FROM workflows WHERE id = ?")
    .bind(id)
    .first();

  return (result as WorkflowRow) || null;
}

export async function updateWorkflow(
  db: D1Database,
  id: string,
  data: Partial<Omit<WorkflowRow, "id" | "created_at">>
): Promise<WorkflowRow> {
  const updates: string[] = [];
  const values: unknown[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at") {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  const query = `UPDATE workflows SET ${updates.join(", ")} WHERE id = ?`;
  await db.prepare(query).bind(...values).run();

  const workflow = await db
    .prepare("SELECT * FROM workflows WHERE id = ?")
    .bind(id)
    .first();

  return workflow as WorkflowRow;
}

export async function createUser(
  db: D1Database,
  data: { id: string; email: string; authSubject: string }
): Promise<UserRow> {
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO users (id, email, auth_subject, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(data.id, data.email, data.authSubject, now, now)
    .run();

  const user = await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(data.id)
    .first();

  return user as UserRow;
}

export async function getUserByAuthSubject(
  db: D1Database,
  authSubject: string
): Promise<UserRow | null> {
  const result = await db
    .prepare("SELECT * FROM users WHERE auth_subject = ?")
    .bind(authSubject)
    .first();

  return (result as UserRow) || null;
}
