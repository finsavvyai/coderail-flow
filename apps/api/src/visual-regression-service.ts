/**
 * Post-run visual regression comparison service.
 *
 * After a run succeeds, compares each screenshot against stored baselines.
 * Creates visual_diff records for any mismatches.
 */

import type { Env } from './env';
import { q, q1 } from './db';
import { compareScreenshots } from '@coderail-flow/runner';

interface RunContext {
  runId: string;
  flowId: string;
  orgId: string;
  projectId: string;
}

/**
 * Run visual regression checks for all screenshots in a completed run.
 * Compares each screenshot artifact against the stored baseline for that step.
 */
export async function runVisualRegression(env: Env, ctx: RunContext): Promise<void> {
  const baselines = await q(
    env,
    'SELECT * FROM baseline WHERE flow_id = ? ORDER BY step_index ASC',
    [ctx.flowId]
  );

  if (!baselines.results?.length) return;

  const baselineMap = new Map<number, any>();
  for (const b of baselines.results as any[]) {
    baselineMap.set(b.step_index, b);
  }

  const artifacts = await q(
    env,
    "SELECT * FROM artifact WHERE run_id = ? AND kind = 'screenshot' ORDER BY created_at ASC",
    [ctx.runId]
  );

  if (!artifacts.results?.length) return;

  for (let i = 0; i < (artifacts.results as any[]).length; i++) {
    const artifact = (artifacts.results as any[])[i];
    const baseline = baselineMap.get(i);
    if (!baseline) continue;

    await compareStep(env, ctx, baseline, artifact, i);
  }
}

async function compareStep(
  env: Env,
  ctx: RunContext,
  baseline: any,
  artifact: any,
  stepIndex: number
): Promise<void> {
  const now = new Date().toISOString();

  // Fast path: SHA-256 match means identical screenshots
  if (baseline.sha256 && artifact.sha256 && baseline.sha256 === artifact.sha256) {
    await insertDiff(env, ctx.runId, baseline.id, stepIndex, 0, 0.0, 'pending', now);
    return;
  }

  // Fetch both images from R2 for byte comparison
  if (!env.ARTIFACTS) return;

  try {
    const [baselineObj, currentObj] = await Promise.all([
      env.ARTIFACTS.get(baseline.r2_key),
      env.ARTIFACTS.get(artifact.r2_key),
    ]);

    if (!baselineObj || !currentObj) return;

    const [baselineBytes, currentBytes] = await Promise.all([
      baselineObj.arrayBuffer().then((b) => new Uint8Array(b)),
      currentObj.arrayBuffer().then((b) => new Uint8Array(b)),
    ]);

    const result = await compareScreenshots(baselineBytes, currentBytes, {
      threshold: 0.1,
    });

    await insertDiff(
      env,
      ctx.runId,
      baseline.id,
      stepIndex,
      result.mismatchPixels,
      result.mismatchPercentage,
      'pending',
      now
    );
  } catch {
    // Don't fail the run if visual regression check fails
  }
}

async function insertDiff(
  env: Env,
  runId: string,
  baselineId: string,
  stepIndex: number,
  mismatchPixels: number,
  mismatchPercentage: number,
  status: string,
  now: string
): Promise<void> {
  const id = crypto.randomUUID();
  await q(
    env,
    `INSERT INTO visual_diff (id, run_id, baseline_id, step_index, mismatch_pixels, mismatch_percentage, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, runId, baselineId, stepIndex, mismatchPixels, mismatchPercentage, status, now]
  );
}
