// @ts-nocheck
type Json = Record<string, any>;

type RunRow = {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed";
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string;
};

type RunDetailResponse = {
  run: RunRow;
  artifacts?: Array<{ id: string; kind: string }>;
};

type BenchmarkConfig = {
  apiBase: string;
  flowId?: string;
  totalRuns: number;
  concurrency: number;
  benchmarkRuns: number;
  pollMs: number;
  timeoutMs: number;
  outputFile: string;
  externalRunner: boolean;
};

const DEFAULTS: BenchmarkConfig = {
  apiBase: process.env.API_BASE || "http://localhost:8787",
  flowId: process.env.FLOW_ID,
  totalRuns: Number(process.env.TOTAL_RUNS || "100"),
  concurrency: Number(process.env.CONCURRENCY || "100"),
  benchmarkRuns: Number(process.env.BENCHMARK_RUNS || "5"),
  pollMs: Number(process.env.POLL_MS || "1000"),
  timeoutMs: Number(process.env.TIMEOUT_MS || "180000"),
  outputFile: process.env.PERF_OUTPUT || "artifacts/perf/benchmark-latest.json",
  externalRunner: process.env.EXTERNAL_RUNNER === "true",
};

async function api(path: string, init?: RequestInit): Promise<any> {
  const token = process.env.API_TOKEN;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${DEFAULTS.apiBase}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    throw new Error(`${init?.method || "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function resolveFlowId(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const data = (await api("/flows")) as { flows?: Array<{ id: string }> };
  const first = data.flows?.[0]?.id;
  if (!first) throw new Error("No flows found. Create at least one flow or pass FLOW_ID.");
  return first;
}

async function createRun(flowId: string): Promise<{ runId: string; latencyMs: number }> {
  const started = Date.now();
  const query = DEFAULTS.externalRunner ? "?external=true" : "";
  const body = JSON.stringify({ flowId, params: {} });
  const data = await api(`/runs${query}`, { method: "POST", body });
  return { runId: data.runId as string, latencyMs: Date.now() - started };
}

async function getRun(runId: string): Promise<RunDetailResponse> {
  return api(`/runs/${runId}`) as Promise<RunDetailResponse>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCompletion(runId: string, pollMs: number, timeoutMs: number): Promise<RunRow> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { run } = await getRun(runId);
    if (run.status === "succeeded" || run.status === "failed") return run;
    await sleep(pollMs);
  }
  throw new Error(`Run ${runId} did not complete within ${timeoutMs}ms`);
}

function parseDurationMs(run: RunRow): number | null {
  if (!run.started_at || !run.finished_at) return null;
  const start = Date.parse(run.started_at);
  const end = Date.parse(run.finished_at);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return Math.max(0, end - start);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarize(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  return {
    count: sorted.length,
    min: sorted[0] ?? 0,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1] ?? 0,
    avg: sorted.length ? Math.round(sum / sorted.length) : 0,
  };
}

async function runSequentialBenchmark(flowId: string) {
  const runDurations: number[] = [];
  const apiLatencies: number[] = [];

  for (let i = 0; i < DEFAULTS.benchmarkRuns; i++) {
    const created = await createRun(flowId);
    apiLatencies.push(created.latencyMs);

    const finished = await waitForCompletion(created.runId, DEFAULTS.pollMs, DEFAULTS.timeoutMs);
    const duration = parseDurationMs(finished);
    if (duration !== null) runDurations.push(duration);

    console.log(`benchmark run ${i + 1}/${DEFAULTS.benchmarkRuns}: ${finished.status} (${duration ?? "n/a"}ms)`);
  }

  return {
    benchmarkRuns: DEFAULTS.benchmarkRuns,
    apiCreateLatency: summarize(apiLatencies),
    runDuration: summarize(runDurations),
  };
}

async function runConcurrentLoad(flowId: string) {
  const queue = Array.from({ length: DEFAULTS.totalRuns }, (_, i) => i);
  const apiLatencies: number[] = [];
  let created = 0;
  let failed = 0;

  const workers = Array.from({ length: Math.max(1, DEFAULTS.concurrency) }, async () => {
    while (queue.length) {
      queue.pop();
      try {
        const res = await createRun(flowId);
        apiLatencies.push(res.latencyMs);
        created += 1;
      } catch {
        failed += 1;
      }
    }
  });

  const started = Date.now();
  await Promise.all(workers);
  const elapsedMs = Date.now() - started;

  return {
    requestedRuns: DEFAULTS.totalRuns,
    createdRuns: created,
    failedCreates: failed,
    concurrency: DEFAULTS.concurrency,
    elapsedMs,
    throughputPerSec: elapsedMs > 0 ? Number((created / (elapsedMs / 1000)).toFixed(2)) : 0,
    apiCreateLatency: summarize(apiLatencies),
  };
}

function compareWithPrevious(current: Json, previous: Json | null): Json {
  if (!previous) return { hasPrevious: false };

  const prevP50 = Number(previous?.sequential?.runDuration?.p50 || 0);
  const curP50 = Number(current?.sequential?.runDuration?.p50 || 0);

  if (!prevP50 || !curP50) return { hasPrevious: true, comparable: false };

  const diffMs = curP50 - prevP50;
  const diffPct = Number((((curP50 - prevP50) / prevP50) * 100).toFixed(2));

  return {
    hasPrevious: true,
    comparable: true,
    previousP50Ms: prevP50,
    currentP50Ms: curP50,
    diffMs,
    diffPct,
    improved: diffMs < 0,
  };
}

async function loadPreviousReport(path: string): Promise<Json | null> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as Json;
  } catch {
    return null;
  }
}

async function saveReport(path: string, report: Json): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname } = await import("node:path");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(report, null, 2), "utf8");
}

async function main() {
  const flowId = await resolveFlowId(DEFAULTS.flowId);
  console.log(`Using flow: ${flowId}`);
  console.log(`API base: ${DEFAULTS.apiBase}`);

  const previous = await loadPreviousReport(DEFAULTS.outputFile);
  const sequential = await runSequentialBenchmark(flowId);
  const concurrent = await runConcurrentLoad(flowId);

  const report = {
    generatedAt: new Date().toISOString(),
    config: {
      flowId,
      apiBase: DEFAULTS.apiBase,
      benchmarkRuns: DEFAULTS.benchmarkRuns,
      totalRuns: DEFAULTS.totalRuns,
      concurrency: DEFAULTS.concurrency,
      externalRunner: DEFAULTS.externalRunner,
    },
    sequential,
    concurrent,
  };

  const comparison = compareWithPrevious(report, previous);
  const reportWithComparison = { ...report, comparison };

  await saveReport(DEFAULTS.outputFile, reportWithComparison);

  console.log("\n=== Benchmark Summary ===");
  console.log(`Run duration p50: ${sequential.runDuration.p50}ms`);
  console.log(`Run duration p95: ${sequential.runDuration.p95}ms`);
  console.log(`Create-run p95: ${concurrent.apiCreateLatency.p95}ms`);
  console.log(`Throughput: ${concurrent.throughputPerSec}/sec`);
  if ((comparison as any).comparable) {
    console.log(`Change vs previous p50: ${(comparison as any).diffMs}ms (${(comparison as any).diffPct}%)`);
  }
  console.log(`Report: ${DEFAULTS.outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
