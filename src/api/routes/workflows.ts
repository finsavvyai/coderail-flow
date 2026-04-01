import { Hono } from "hono";
import type { Env } from "../bindings";
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
} from "../../db/queries";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  try {
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const workflows = await getWorkflows(c.env.DB, userId);

    return c.json({ data: workflows, total: workflows.length }, 200);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return c.json({ error: "Failed to fetch workflows" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const workflow = await getWorkflowById(c.env.DB, id);

    if (!workflow) {
      return c.json({ error: "Workflow not found" }, 404);
    }

    return c.json({ data: workflow }, 200);
  } catch (error) {
    console.error("Error fetching workflow:", error);
    return c.json({ error: "Failed to fetch workflow" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      name,
      description,
      templateId,
      triggerType,
      triggerConfig,
      actions,
      enabled,
    } = body;

    if (!name || !triggerType || !actions) {
      return c.json(
        {
          error: "Missing required fields: name, triggerType, actions",
        },
        400
      );
    }

    const workflow = await createWorkflow(c.env.DB, {
      id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      description,
      templateId,
      triggerType,
      triggerConfig: JSON.stringify(triggerConfig || {}),
      actions: JSON.stringify(actions),
      enabled: enabled !== false,
    });

    return c.json({ data: workflow }, 201);
  } catch (error) {
    console.error("Error creating workflow:", error);
    return c.json({ error: "Failed to create workflow" }, 500);
  }
});

app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const existing = await getWorkflowById(c.env.DB, id);
    if (!existing || existing.user_id !== userId) {
      return c.json({ error: "Workflow not found or unauthorized" }, 404);
    }

    const body = await c.req.json();
    const { name, description, enabled, triggerConfig, actions } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (enabled !== undefined) updates.enabled = enabled ? 1 : 0;
    if (triggerConfig !== undefined) updates.trigger_config = JSON.stringify(triggerConfig);
    if (actions !== undefined) updates.actions = JSON.stringify(actions);

    const workflow = await updateWorkflow(c.env.DB, id, updates);

    return c.json({ data: workflow }, 200);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return c.json({ error: "Failed to update workflow" }, 500);
  }
});

export default app;
