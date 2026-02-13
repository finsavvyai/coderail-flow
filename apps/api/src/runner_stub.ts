import type { Env } from "./env";
import { q, q1 } from "./db";
import { uuid } from "./ids";

/**
 * MVP stub runner:
 * - marks run succeeded
 * - creates a JSON report artifact in DB (not R2) for easy local dev
 * Replace with real execution using Browser Rendering + R2 uploads.
 */
export async function runFlowStub(env: Env, runId: string) {
  const run = await q1<any>(env, "SELECT * FROM run WHERE id = ?", [runId]);
  if (!run) throw new Error("run not found");

  // Fake “execution”
  const started = new Date().toISOString();
  await q(env, "UPDATE run SET status='running', started_at=? WHERE id=?", [started, runId]);

  const report = {
    runId,
    flowId: run.flow_id,
    flowVersion: run.flow_version,
    status: "succeeded",
    runnerVersion: "stub-0.1",
    steps: [
      { idx: 0, type: "caption", status: "ok", text: "Hello from CodeRail Flow stub runner." }
    ],
    generatedAt: new Date().toISOString()
  };

  const artifactId = uuid();
  await q(env, `INSERT INTO artifact (id, run_id, kind, content_type, bytes, sha256, created_at, inline_content)
              VALUES (?, ?, 'report', 'application/json', ?, '', ?, ?)`,
    [artifactId, runId, JSON.stringify(report).length, new Date().toISOString(), JSON.stringify(report)]
  );

  const finished = new Date().toISOString();
  await q(env, "UPDATE run SET status='succeeded', finished_at=? WHERE id=?", [finished, runId]);
}
