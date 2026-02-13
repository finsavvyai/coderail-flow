import type { Env } from "./env";
import { q, q1 } from "./db";
import { uuid } from "./ids";
import { executeFlow, type ExecuteInput, type ElementData } from "@coderail-flow/runner";
import { runFlowStub } from "./runner_stub";

/**
 * Dispatch to the real runner in production, or the stub in dev.
 */
export async function runFlow(env: Env, runId: string) {
  if (env.APP_ENV !== "production") {
    return runFlowStub(env, runId);
  }
  return runFlowReal(env, runId);
}

/**
 * Real flow runner using Browser Rendering + Puppeteer
 */
async function runFlowReal(env: Env, runId: string) {
  const run = await q1<any>(env, "SELECT * FROM run WHERE id = ?", [runId]);
  if (!run) throw new Error("run not found");

  // Mark run as running
  const started = new Date().toISOString();
  await q(env, "UPDATE run SET status='running', started_at=? WHERE id=?", [started, runId]);

  try {
    // Fetch flow definition
    const flow = await q1<any>(
      env,
      `SELECT f.*, fv.definition, p.base_url, p.org_id
       FROM flow f
       JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = ?
       JOIN project p ON p.id = f.project_id
       WHERE f.id = ?`,
      [run.flow_version, run.flow_id]
    );

    if (!flow) throw new Error("Flow not found");

    // Parse flow definition
    const flowDefinition = JSON.parse(flow.definition);

    // Fetch all elements referenced in the flow
    const elementIds = new Set<string>();
    for (const step of flowDefinition.steps) {
      if (step.elementId) {
        elementIds.add(step.elementId);
      }
    }

    const elements: ElementData[] = [];
    if (elementIds.size > 0) {
      const elementRows = await q(
        env,
        `SELECT id, name, locator_primary, locator_fallbacks, reliability_score
         FROM element
         WHERE id IN (${Array.from(elementIds).map(() => '?').join(',')})`,
        Array.from(elementIds)
      );

      for (const row of elementRows.results || []) {
        elements.push(row as any);
      }
    }

    // Fetch all screens referenced in the flow
    const screenIds = new Set<string>();
    for (const step of flowDefinition.steps) {
      if (step.screenId) {
        screenIds.add(step.screenId);
      }
    }

    const screens: Array<{ id: string; url_path: string }> = [];
    if (screenIds.size > 0) {
      const screenRows = await q(
        env,
        `SELECT id, url_path
         FROM screen
         WHERE id IN (${Array.from(screenIds).map(() => '?').join(',')})`,
        Array.from(screenIds)
      );

      for (const row of screenRows.results || []) {
        screens.push(row as any);
      }
    }

    // Parse run params
    const params = JSON.parse(run.params || '{}');

    // Build execution input
    const executeInput: ExecuteInput = {
      browserBinding: env.BROWSER,
      baseUrl: flow.base_url,
      flowDefinition,
      params,
      elements,
      screens,
      r2Bucket: env.ARTIFACTS,
      orgId: flow.org_id,
      projectId: flow.project_id,
      runId
    };

    // Execute the flow!
    const result = await executeFlow(executeInput);

    // Store artifacts
    // If R2 upload was successful, store R2 keys; otherwise store inline
    if (result.artifacts && result.artifacts.length > 0) {
      for (const artifact of result.artifacts) {
        const artifactId = uuid();
        await q(
          env,
          `INSERT INTO artifact (id, run_id, kind, content_type, bytes, r2_key, sha256, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            artifactId,
            runId,
            artifact.kind,
            getContentType(artifact.kind),
            artifact.bytes,
            artifact.r2_key,
            artifact.sha256,
            new Date().toISOString()
          ]
        );
      }
    } else {
      // Fall back to inline storage if R2 is not configured
      // Store report
      const reportId = uuid();
      await q(
        env,
        `INSERT INTO artifact (id, run_id, kind, content_type, bytes, inline_content, created_at)
         VALUES (?, ?, 'report', 'application/json', ?, ?, ?)`,
        [
          reportId,
          runId,
          JSON.stringify(result.reportJson).length,
          JSON.stringify(result.reportJson),
          new Date().toISOString()
        ]
      );

      // Store subtitles
      const srtId = uuid();
      await q(
        env,
        `INSERT INTO artifact (id, run_id, kind, content_type, bytes, inline_content, created_at)
         VALUES (?, ?, 'subtitle', 'text/srt', ?, ?, ?)`,
        [
          srtId,
          runId,
          result.subtitlesSrt.length,
          result.subtitlesSrt,
          new Date().toISOString()
        ]
      );

      // Store screenshots (first one only for MVP to save DB space)
      if (result.screenshots.length > 0) {
        const screenshotId = uuid();
        const firstScreenshot = result.screenshots[0];
        // For inline storage, we'd normally store as base64, but this would be huge
        // For MVP, we'll skip storing screenshots inline
        // In production, always use R2
      }
    }

    // Mark run as succeeded
    const finished = new Date().toISOString();
    await q(env, "UPDATE run SET status='succeeded', finished_at=? WHERE id=?", [finished, runId]);

  } catch (err: any) {
    // Mark run as failed
    const finished = new Date().toISOString();
    await q(
      env,
      "UPDATE run SET status='failed', finished_at=?, error_code=?, error_message=? WHERE id=?",
      [finished, 'EXECUTION_ERROR', err.message || 'Unknown error', runId]
    );

    throw err; // Re-throw for logging
  }
}

/**
 * Get content type for artifact kind
 */
function getContentType(kind: string): string {
  if (kind === 'report') return 'application/json';
  if (kind === 'subtitle') return 'text/srt';
  if (kind.startsWith('screenshot')) return 'image/png';
  if (kind === 'video') return 'video/webm';
  return 'application/octet-stream';
}
