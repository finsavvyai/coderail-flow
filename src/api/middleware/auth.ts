import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { Env } from "../bindings";

export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  email?: string;
  role?: "user" | "admin";
}

export const authMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: Missing token" }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = (await verify(
        token,
        c.env.AUTH_SECRET
      )) as JWTPayload;

      c.set("userId", payload.sub);
      c.set("userEmail", payload.email);
      c.set("userRole", payload.role || "user");

      await next();
    } catch {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
  }
);

export const optionalAuthMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const payload = (await verify(
          token,
          c.env.AUTH_SECRET
        )) as JWTPayload;
        c.set("userId", payload.sub);
      } catch {
        // Continue without auth
      }
    }

    await next();
  }
);
