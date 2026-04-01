import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./bindings";
import { authMiddleware, optionalAuthMiddleware } from "./middleware/auth";
import { rateLimiterMiddleware } from "./middleware/rate-limiter";
import healthRoutes from "./routes/health";
import templateRoutes from "./routes/templates";
import workflowRoutes from "./routes/workflows";

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  // Global middleware
  app.use("*", logger());
  app.use("*", cors({ origin: "*" }));
  app.use("*", rateLimiterMiddleware);

  // Health check (no auth required)
  app.route("/health", healthRoutes);

  // Public routes
  app.use("/api/templates", optionalAuthMiddleware);
  app.route("/api/templates", templateRoutes);

  // Protected routes
  app.use("/api/workflows", authMiddleware);
  app.route("/api/workflows", workflowRoutes);

  // Error handler
  app.onError((error, c) => {
    console.error("Unhandled error:", error);
    return c.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  });

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        error: "Not found",
        path: c.req.path,
      },
      404
    );
  });

  return app;
}
