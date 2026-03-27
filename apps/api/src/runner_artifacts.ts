import type { Env } from './env';
import { q } from './db';
import { uuid } from './ids';

export async function persistRunSteps(env: Env, runId: string, reportJson: any): Promise<void> {
  const steps = Array.isArray(reportJson?.steps) ? reportJson.steps : [];
  if (steps.length === 0) return;

  await q(env, 'DELETE FROM run_step WHERE run_id = ?', [runId]);

  for (const step of steps) {
    const stepId = uuid();
    const idx = Number(step?.idx ?? 0);
    const type = String(step?.type ?? 'unknown');
    const status = String(step?.status ?? 'pending');
    const durationMs = Number(step?.durationMs ?? 0);

    await q(
      env,
      `INSERT INTO run_step (id, run_id, idx, type, status, started_at, finished_at, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stepId,
        runId,
        idx,
        type,
        status,
        null,
        null,
        JSON.stringify({
          durationMs,
          narrate: step?.narrate,
          errorMessage: step?.errorMessage,
        }),
      ]
    );
  }
}

export function getContentType(kind: string): string {
  if (kind === 'report') return 'application/json';
  if (kind === 'subtitle') return 'text/srt';
  if (kind.startsWith('screenshot')) return 'image/webp';
  if (kind === 'video') return 'video/webm';
  return 'application/octet-stream';
}

interface ExecutionArtifact {
  kind: string;
  bytes: number;
  r2_key: string;
  sha256: string;
}

interface ExecutionResult {
  reportJson: any;
  subtitlesSrt: string;
  screenshots: any[];
  artifacts?: ExecutionArtifact[];
}

export async function storeArtifacts(
  env: Env,
  runId: string,
  result: ExecutionResult
): Promise<void> {
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
          new Date().toISOString(),
        ]
      );
    }
    return;
  }

  // Fall back to inline storage if R2 is not configured
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
      new Date().toISOString(),
    ]
  );

  const srtId = uuid();
  await q(
    env,
    `INSERT INTO artifact (id, run_id, kind, content_type, bytes, inline_content, created_at)
     VALUES (?, ?, 'subtitle', 'text/srt', ?, ?, ?)`,
    [srtId, runId, result.subtitlesSrt.length, result.subtitlesSrt, new Date().toISOString()]
  );

  // Screenshots skipped for inline storage (too large for DB)
  // In production, always use R2
}
