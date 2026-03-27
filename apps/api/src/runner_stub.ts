import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';

const LOCAL_RUNNER_URL = 'http://localhost:8788/execute';

/**
 * Dev runner: delegates to local-runner service (Puppeteer) when available,
 * falls back to simulated execution otherwise.
 */
export async function runFlowStub(env: Env, runId: string) {
  const run = await q1<any>(env, 'SELECT * FROM run WHERE id = ?', [runId]);
  if (!run) throw new Error('run not found');

  const started = new Date().toISOString();
  await q(env, "UPDATE run SET status='running', started_at=? WHERE id=?", [started, runId]);

  // Load definition from flow_version table
  const fv = await q1<{ definition: string }>(
    env,
    'SELECT definition FROM flow_version WHERE flow_id = ? AND version = ?',
    [run.flow_id, run.flow_version]
  );
  const definition = fv?.definition ? JSON.parse(fv.definition) : null;

  try {
    // Try local runner service first (real Puppeteer browser)
    const result = await runViaLocalRunner(runId, definition, env, run);
    await persistResults(env, runId, run, result.steps, result.status);
  } catch {
    // Local runner not available — fall back to simulation
    await runSimulated(env, runId, run, definition);
  }
}

async function runViaLocalRunner(
  runId: string,
  definition: any,
  env: Env,
  run: any
): Promise<{ status: string; steps: any[] }> {
  // Load project base_url for the flow
  const project = await q1<{ base_url: string }>(
    env,
    `SELECT p.base_url FROM project p
     JOIN flow f ON f.project_id = p.id
     WHERE f.id = ?`,
    [run.flow_id]
  );

  const res = await fetch(LOCAL_RUNNER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId,
      definition,
      baseUrl: project?.base_url || '',
    }),
  });

  if (!res.ok) throw new Error('Local runner returned error');
  return (await res.json()) as { status: string; steps: any[] };
}

async function runSimulated(env: Env, runId: string, run: any, definition: any) {
  const steps = definition?.steps || [];
  const stepResults: any[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepId = uuid();
    const stepStarted = new Date().toISOString();

    await q(
      env,
      `INSERT INTO run_step (id, run_id, idx, type, status, started_at, detail)
                 VALUES (?, ?, ?, ?, 'running', ?, ?)`,
      [stepId, runId, i, step.type || 'unknown', stepStarted, JSON.stringify(step)]
    );

    const stepFinished = new Date().toISOString();
    await q(env, `UPDATE run_step SET status = 'ok', finished_at = ? WHERE id = ?`, [
      stepFinished,
      stepId,
    ]);

    stepResults.push({ idx: i, type: step.type, status: 'ok' });
  }

  await persistResults(env, runId, run, stepResults, 'succeeded');
}

async function persistResults(
  env: Env,
  runId: string,
  run: any,
  stepResults: any[],
  status: string
) {
  const report = {
    runId,
    flowId: run.flow_id,
    flowVersion: run.flow_version,
    status,
    runnerVersion: status === 'succeeded' ? 'local-puppeteer-0.1' : 'stub-0.2',
    steps: stepResults,
    generatedAt: new Date().toISOString(),
  };

  // Store per-step run_step records and screenshot artifacts
  for (const step of stepResults) {
    const stepId = uuid();
    const now = new Date().toISOString();
    await q(
      env,
      `INSERT INTO run_step (id, run_id, idx, type, status, started_at, finished_at, detail)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        stepId,
        runId,
        step.idx,
        step.type,
        step.status === 'ok' ? 'ok' : 'failed',
        now,
        now,
        JSON.stringify({ narration: step.narration, error: step.error }),
      ]
    );

    if (step.screenshot) {
      const artId = uuid();
      await q(
        env,
        `INSERT INTO artifact (id, run_id, kind, content_type, bytes, sha256, created_at, inline_content)
                  VALUES (?, ?, 'screenshot', 'image/png', ?, '', ?, ?)`,
        [artId, runId, step.screenshot.length, now, step.screenshot]
      );
    }
  }

  // Store JSON report
  const artifactId = uuid();
  const reportJson = JSON.stringify(report);
  await q(
    env,
    `INSERT INTO artifact (id, run_id, kind, content_type, bytes, sha256, created_at, inline_content)
              VALUES (?, ?, 'report', 'application/json', ?, '', ?, ?)`,
    [artifactId, runId, reportJson.length, new Date().toISOString(), reportJson]
  );

  const finished = new Date().toISOString();
  if (status === 'succeeded') {
    await q(env, "UPDATE run SET status='succeeded', finished_at=? WHERE id=?", [finished, runId]);
  } else {
    const failedStep = stepResults.find((s) => s.status === 'failed');
    await q(
      env,
      "UPDATE run SET status='failed', finished_at=?, error_code=?, error_message=? WHERE id=?",
      [finished, 'EXECUTION_ERROR', failedStep?.error || 'Step failed', runId]
    );
  }
}
