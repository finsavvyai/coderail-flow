import { Hono } from "hono";
import type { Env } from "../bindings";
import {
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
} from "../../templates/index";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  try {
    const category = c.req.query("category");
    const limit = parseInt(c.req.query("limit") || "50", 10);

    let templates = await getTemplates();

    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    return c.json(
      {
        data: templates.slice(0, limit),
        total: templates.length,
        limit,
      },
      200
    );
  } catch (error) {
    console.error("Error fetching templates:", error);
    return c.json({ error: "Failed to fetch templates" }, 500);
  }
});

app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const template = await getTemplateById(id);

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }

    return c.json({ data: template }, 200);
  } catch (error) {
    console.error("Error fetching template:", error);
    return c.json({ error: "Failed to fetch template" }, 500);
  }
});

app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, category, trigger, actions, tags } = body;

    if (!name || !category || !trigger || !actions) {
      return c.json(
        {
          error: "Missing required fields: name, category, trigger, actions",
        },
        400
      );
    }

    const newTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: description || "",
      category,
      trigger,
      actions,
      tags: tags || [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({ data: newTemplate }, 201);
  } catch (error) {
    console.error("Error creating template:", error);
    return c.json({ error: "Failed to create template" }, 500);
  }
});

export default app;
