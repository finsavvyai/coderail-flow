import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { q, q1 } from "./db";
import { CreateRunSchema, CreateProjectSchema, CreateScreenSchema, CreateElementSchema, CreateFlowSchema } from "./schemas";
import { uuid } from "./ids";
import { runFlow } from "./runner";
import { billing } from "./billing";
import { requireAuth } from "./auth";
import { rateLimit } from "./ratelimit";

type Variables = { userId: string; userEmail?: string };
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Prevent Cloudflare CDN from caching API responses (stale CORS headers)
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store");
});

app.use("*", cors({
  origin: (origin, c) => {
    const env = (c as any).env as Env;
    const baseUrl = env.PUBLIC_BASE_URL;
    if (!baseUrl || env.APP_ENV !== "production") return origin || "*";
    const allowed = [baseUrl];
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
}));

app.get("/health", (c) => c.json({ ok: true, service: "coderail-flow-api" }));

// ---- Auth middleware for all protected routes ----
const auth = requireAuth();

// ---- Rate limits ----
const readLimit = rateLimit(120, 60_000);   // 120 req/min for reads
const writeLimit = rateLimit(30, 60_000);   // 30 req/min for writes

// ---- Flows ----
app.get("/flows", auth, readLimit, async (c) => {
  const env = c.env;
  const res = await q(env, `
    SELECT f.id, f.name, f.description, f.current_version,
           fv.definition
    FROM flow f
    JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = f.current_version
    ORDER BY f.created_at DESC
  `);
  return c.json({ flows: res.results ?? [] });
});

// ---- Runs ----
app.post("/runs", auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateRunSchema.parse(await c.req.json());

  const flow = await q1<{ id: string; current_version: number }>(env, "SELECT id, current_version FROM flow WHERE id = ?", [body.flowId]);
  if (!flow) return c.json({ error: "flow_not_found" }, 404);

  const runId = uuid();
  await q(env, `INSERT INTO run (id, flow_id, flow_version, status, params, runner_version, created_at)
               VALUES (?, ?, ?, 'queued', ?, 'runner-0.2', ?)`,
    [runId, body.flowId, flow.current_version, JSON.stringify(body.params ?? {}), new Date().toISOString()]
  );

  // Execute in background using ctx.waitUntil for async execution
  c.executionCtx.waitUntil(runFlow(env, runId));

  return c.json({ runId });
});

app.get("/runs", auth, readLimit, async (c) => {
  const env = c.env;
  const res = await q(env, `
    SELECT r.id, r.flow_id, f.name as flow_name, r.flow_version, r.status, r.started_at, r.finished_at, r.created_at
    FROM run r
    JOIN flow f ON f.id = r.flow_id
    ORDER BY r.created_at DESC
    LIMIT 100
  `);
  return c.json({ runs: res.results ?? [] });
});

app.get("/runs/:id", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const run = await q1<any>(env, `
    SELECT r.*, f.name as flow_name
    FROM run r
    JOIN flow f ON f.id = r.flow_id
    WHERE r.id = ?
  `, [id]);
  if (!run) return c.json({ error: "run_not_found" }, 404);

  const arts = await q(env, "SELECT id, kind, content_type, bytes, created_at FROM artifact WHERE run_id = ? ORDER BY created_at ASC", [id]);
  return c.json({ run, artifacts: arts.results ?? [] });
});

// Server-Sent Events endpoint for real-time progress
app.get("/runs/:id/progress", auth, readLimit, async (c) => {
  const env = c.env;
  const runId = c.req.param("id");

  // Check if run exists
  const run = await q1<any>(env, "SELECT id, status FROM run WHERE id = ?", [runId]);
  if (!run) return c.json({ error: "run_not_found" }, 404);

  // If run is already complete, return final status
  if (run.status === 'succeeded' || run.status === 'failed') {
    return c.json({
      status: run.status,
      complete: true
    });
  }

  // Return JSON polling response for now
  // Note: Cloudflare Workers have limitations with SSE, so we use polling
  // In production, consider using Durable Objects or WebSockets
  return c.json({
    status: run.status,
    complete: false,
    message: 'Use polling to check status. Check /runs/:id for updates.'
  });
});

// Retry a failed run
app.post("/runs/:id/retry", auth, writeLimit, async (c) => {
  const env = c.env;
  const runId = c.req.param("id");

  const run = await q1<any>(env, "SELECT * FROM run WHERE id = ?", [runId]);
  if (!run) return c.json({ error: "run_not_found" }, 404);

  // Only allow retry for failed runs
  if (run.status !== 'failed') {
    return c.json({ error: "only_failed_runs_can_be_retried" }, 400);
  }

  // Reset run status
  await q(env, "UPDATE run SET status='queued', error_code=NULL, error_message=NULL WHERE id=?", [runId]);

  // Execute in background
  c.executionCtx.waitUntil(runFlow(env, runId));

  return c.json({ success: true, runId });
});

// ---- Artifacts ----

// Helper: resolve artifact body from R2 or inline DB content
async function resolveArtifactBody(env: Env, art: any): Promise<ReadableStream | ArrayBuffer | string> {
  if (art.r2_key && env.ARTIFACTS) {
    const obj = await env.ARTIFACTS.get(art.r2_key);
    if (obj) return obj.body;
  }
  return art.inline_content ?? "";
}

app.get("/artifacts/:id/download", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const art = await q1<any>(env, "SELECT * FROM artifact WHERE id = ?", [id]);
  if (!art) return c.json({ error: "artifact_not_found" }, 404);

  const body = await resolveArtifactBody(env, art);
  const ext = art.kind === "report" ? "json" : art.kind === "subtitle" ? "srt" : art.kind.startsWith("screenshot") ? "png" : "bin";
  return new Response(body as any, {
    headers: {
      "content-type": art.content_type ?? "application/octet-stream",
      "content-disposition": `attachment; filename="coderail-${id}.${ext}"`
    }
  });
});

// Preview endpoint for inline viewing (especially for screenshots)
app.get("/artifacts/:id/preview", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const art = await q1<any>(env, "SELECT * FROM artifact WHERE id = ?", [id]);
  if (!art) return c.json({ error: "artifact_not_found" }, 404);

  const body = await resolveArtifactBody(env, art);
  return new Response(body as any, {
    headers: {
      "content-type": art.content_type ?? "application/octet-stream",
      "cache-control": "public, max-age=3600"
    }
  });
});

// ---- Projects ----
app.get("/projects", auth, readLimit, async (c) => {
  const env = c.env;
  const orgId = c.req.query("orgId");
  const query = orgId
    ? "SELECT * FROM project WHERE org_id = ? ORDER BY created_at DESC"
    : "SELECT * FROM project ORDER BY created_at DESC";
  const params = orgId ? [orgId] : [];
  const res = await q(env, query, params);
  return c.json({ projects: res.results ?? [] });
});

app.get("/projects/:id", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const project = await q1<any>(env, "SELECT * FROM project WHERE id = ?", [id]);
  if (!project) return c.json({ error: "project_not_found" }, 404);
  return c.json({ project });
});

app.post("/projects", auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateProjectSchema.parse(await c.req.json());
  const id = uuid();
  const now = new Date().toISOString();
  await q(env, `INSERT INTO project (id, org_id, name, base_url, env, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
    [id, body.orgId, body.name, body.baseUrl, body.env, now]
  );
  return c.json({ projectId: id });
});

// ---- Screens ----
app.get("/screens", auth, readLimit, async (c) => {
  const env = c.env;
  const projectId = c.req.query("projectId");
  if (!projectId) return c.json({ error: "projectId required" }, 400);
  const res = await q(env, "SELECT * FROM screen WHERE project_id = ? ORDER BY name ASC", [projectId]);
  return c.json({ screens: res.results ?? [] });
});

app.get("/screens/:id", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const screen = await q1<any>(env, "SELECT * FROM screen WHERE id = ?", [id]);
  if (!screen) return c.json({ error: "screen_not_found" }, 404);
  return c.json({ screen });
});

app.post("/screens", auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateScreenSchema.parse(await c.req.json());
  const id = uuid();
  const now = new Date().toISOString();
  await q(env, `INSERT INTO screen (id, project_id, name, url_path, created_at)
               VALUES (?, ?, ?, ?, ?)`,
    [id, body.projectId, body.name, body.urlPath, now]
  );
  return c.json({ screenId: id });
});

// ---- Elements ----
app.get("/elements", auth, readLimit, async (c) => {
  const env = c.env;
  const screenId = c.req.query("screenId");
  if (!screenId) return c.json({ error: "screenId required" }, 400);
  const res = await q(env, "SELECT * FROM element WHERE screen_id = ? ORDER BY name ASC", [screenId]);
  return c.json({ elements: res.results ?? [] });
});

app.get("/elements/:id", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const element = await q1<any>(env, "SELECT * FROM element WHERE id = ?", [id]);
  if (!element) return c.json({ error: "element_not_found" }, 404);
  return c.json({ element });
});

app.post("/elements", auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateElementSchema.parse(await c.req.json());
  const id = uuid();
  const now = new Date().toISOString();
  
  // Calculate reliability score based on locator type
  const reliabilityScores: Record<string, number> = {
    testid: 1.0, role: 0.8, label: 0.7, css: 0.4, xpath: 0.2
  };
  const score = body.reliabilityScore ?? reliabilityScores[body.locatorPrimary.type] ?? 0.5;
  
  await q(env, `INSERT INTO element (id, screen_id, name, locator_primary, locator_fallbacks, reliability_score, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, body.screenId, body.name, JSON.stringify(body.locatorPrimary), JSON.stringify(body.locatorFallbacks ?? []), score, now, now]
  );
  return c.json({ elementId: id });
});

// ---- Create Flow ----
app.post("/flows", auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateFlowSchema.parse(await c.req.json());
  const flowId = uuid();
  const versionId = uuid();
  const now = new Date().toISOString();
  
  // Create flow
  await q(env, `INSERT INTO flow (id, project_id, name, description, status, current_version, created_at)
               VALUES (?, ?, ?, ?, 'active', 1, ?)`,
    [flowId, body.projectId, body.name, body.description ?? "", now]
  );
  
  // Create initial version
  await q(env, `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
               VALUES (?, ?, 1, ?, 'Initial version', ?)`,
    [versionId, flowId, JSON.stringify(body.definition), now]
  );
  
  return c.json({ flowId, versionId });
});

// ---- Get Flow by ID ----
app.get("/flows/:id", auth, readLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const flow = await q1<any>(env, `
    SELECT f.*, fv.definition
    FROM flow f
    JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = f.current_version
    WHERE f.id = ?
  `, [id]);
  if (!flow) return c.json({ error: "flow_not_found" }, 404);
  return c.json({ flow });
});

// ---- Update Flow (new version) ----
app.put("/flows/:id", auth, writeLimit, async (c) => {
  const env = c.env;
  const id = c.req.param("id");
  const body = await c.req.json();
  
  const flow = await q1<any>(env, "SELECT * FROM flow WHERE id = ?", [id]);
  if (!flow) return c.json({ error: "flow_not_found" }, 404);
  
  const newVersion = flow.current_version + 1;
  const versionId = uuid();
  const now = new Date().toISOString();
  
  // Create new version
  await q(env, `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
    [versionId, id, newVersion, JSON.stringify(body.definition), body.changelog ?? "", now]
  );
  
  // Update flow metadata
  await q(env, `UPDATE flow SET current_version = ?, name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
    [newVersion, body.name, body.description, id]
  );
  
  return c.json({ flowId: id, version: newVersion, versionId });
});

// ---- Waitlist ----
app.post("/waitlist", async (c) => {
  const env = c.env;
  const body = await c.req.json<{ email: string; source?: string }>();
  
  if (!body.email || !body.email.includes('@')) {
    return c.json({ error: "invalid_email" }, 400);
  }
  
  const id = uuid();
  const now = new Date().toISOString();
  
  try {
    await q(env, `INSERT INTO waitlist (id, email, source, created_at) VALUES (?, ?, ?, ?)`,
      [id, body.email.toLowerCase().trim(), body.source ?? 'website', now]
    );
  } catch (e: unknown) {
    // Likely duplicate email - that's fine
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return c.json({ ok: true, message: "already_subscribed" });
    }
    throw e;
  }
  
  return c.json({ ok: true, id });
});

// ---- Billing routes ----
app.route("/billing", billing);

export default app;
