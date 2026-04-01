import { Hono } from "hono";
import type { Env } from "../bindings";

const app = new Hono<{ Bindings: Env }>();

app.get("/health", async (c) => {
  try {
    const dbCheck = await c.env.DB.prepare("SELECT 1 as status").first();
    const kvCheck = await c.env.KV.get("health-check");

    return c.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: dbCheck ? "ok" : "error",
          cache: kvCheck !== null ? "ok" : "degraded",
        },
        version: "1.0.0",
      },
      200
    );
  } catch (error) {
    console.error("Health check error:", error);
    return c.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: String(error),
      },
      503
    );
  }
});

export default app;
