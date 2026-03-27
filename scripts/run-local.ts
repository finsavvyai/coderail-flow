#!/usr/bin/env npx tsx
/**
 * Local Flow Runner — Real browser automation using standard Puppeteer.
 *
 * Usage:
 *   npx tsx scripts/run-local.ts <flowId> [--params '{"key":"value"}']
 *
 * Prerequisites:
 *   - API running on localhost:8787  (pnpm --filter @coderail-flow/api run dev)
 *   - Demo target served             (npx serve apps/demo-target -l 3333)
 */

import puppeteer, { type Page, type Browser, type ElementHandle } from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ── Config ──────────────────────────────────────────────────────────
const API = process.env.API_URL || "http://localhost:8787";

// ── Helpers ─────────────────────────────────────────────────────────
async function api(method: string, path: string, body?: any) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<any>;
}

function interpolate(template: string, params: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? `{{${key}}}`);
}

// ── Overlay injection (same as production runner) ───────────────────
async function injectOverlay(page: Page) {
  await page.evaluateOnNewDocument(() => {
    (window as any).coderail = {
      highlight: (selector: string, options?: any) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        const container = ensureContainer();
        const el = document.createElement("div");
        el.style.cssText = `
          position:fixed; left:${rect.left - 4}px; top:${rect.top - 4}px;
          width:${rect.width + 8}px; height:${rect.height + 8}px;
          border:3px solid #6366f1; border-radius:8px;
          background:rgba(99,102,241,0.12); pointer-events:none;
          z-index:2147483647;
          ${options?.style === "pulse" ? "animation:coderail-pulse 1.2s infinite;" : ""}
        `;
        container.appendChild(el);
        if (options?.duration) setTimeout(() => el.remove(), options.duration);
        return el;
      },
      caption: (text: string, options?: any) => {
        const container = ensureContainer();
        const el = document.createElement("div");
        el.textContent = text;
        const p = options?.placement || "bottom";
        const pos =
          p === "top" ? "top:24px;left:50%;transform:translateX(-50%);" :
          p === "center" ? "top:50%;left:50%;transform:translate(-50%,-50%);" :
          "bottom:24px;left:50%;transform:translateX(-50%);";
        el.style.cssText = `
          position:fixed; ${pos}
          background:rgba(0,0,0,0.88); color:#fff; padding:14px 28px;
          border-radius:10px; font-size:17px; font-family:system-ui,sans-serif;
          pointer-events:none; z-index:2147483647; max-width:80%; text-align:center;
          box-shadow:0 4px 24px rgba(0,0,0,0.4);
        `;
        container.appendChild(el);
        if (options?.duration) setTimeout(() => el.remove(), options.duration);
        return el;
      },
      clear: () => {
        const c = document.getElementById("coderail-overlay");
        if (c) c.innerHTML = "";
      },
    };
    function ensureContainer() {
      let c = document.getElementById("coderail-overlay");
      if (!c) {
        c = document.createElement("div");
        c.id = "coderail-overlay";
        c.style.cssText =
          "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483646;";
        const s = document.createElement("style");
        s.textContent = `@keyframes coderail-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.04);opacity:.75}}`;
        document.head.appendChild(s);
        document.body.appendChild(c);
      }
      return c;
    }
  });
}

// ── Locator resolution ──────────────────────────────────────────────
interface ElementData {
  id: string;
  name: string;
  locator_primary: string;
  locator_fallbacks?: string;
}

function locatorToSelector(loc: { type: string; value: string; meta?: any }): string {
  switch (loc.type) {
    case "testid":   return `[data-testid="${loc.value}"]`;
    case "role":     return loc.meta?.name ? `[role="${loc.value}"][aria-label="${loc.meta.name}"]` : `[role="${loc.value}"]`;
    case "label":    return `[aria-label="${loc.value}"]`;
    case "css":      return loc.value;
    case "xpath":    return loc.value; // handled separately
    default:         return loc.value;
  }
}

async function resolveElement(
  page: Page,
  elData: ElementData,
  params: Record<string, any>,
): Promise<{ handle: ElementHandle; selector: string }> {
  const primary = JSON.parse(elData.locator_primary);
  const selector = locatorToSelector(primary);
  const interpolated = interpolate(selector, params);

  let handle = await page.$(interpolated);
  if (handle) return { handle, selector: interpolated };

  // Try fallbacks
  const fallbacks: any[] = JSON.parse(elData.locator_fallbacks || "[]");
  for (const fb of fallbacks) {
    const fbSel = locatorToSelector(fb);
    const fbInterp = interpolate(fbSel, params);
    handle = await page.$(fbInterp);
    if (handle) return { handle, selector: fbInterp };
  }

  throw new Error(`Element "${elData.name}" not found. Tried: ${interpolated}`);
}

// ── SRT generation ──────────────────────────────────────────────────
interface NarrationEntry {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
}

function generateSRT(entries: NarrationEntry[]): string {
  return entries
    .map((e) => {
      const fmt = (ms: number) => {
        const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
        const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
        const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
        const ms2 = String(ms % 1000).padStart(3, "0");
        return `${h}:${m}:${s},${ms2}`;
      };
      return `${e.index}\n${fmt(e.startMs)} --> ${fmt(e.endMs)}\n${e.text}\n`;
    })
    .join("\n");
}

// ── Step execution ──────────────────────────────────────────────────
interface StepResult {
  idx: number;
  type: string;
  status: "ok" | "failed";
  narrate?: string;
  durationMs: number;
  error?: string;
}

async function executeStep(
  page: Page,
  step: any,
  elements: ElementData[],
  screens: any[],
  baseUrl: string,
  params: Record<string, any>,
): Promise<void> {
  switch (step.type) {
    case "goto": {
      if (step.narrate) {
        await page.evaluate((t: string) => (window as any).coderail?.caption(t, { placement: "bottom", duration: 3000 }), step.narrate);
        await sleep(800);
      }
      let url: string;
      if (step.url) {
        url = interpolate(step.url, params);
      } else if (step.screenId) {
        const scr = screens.find((s: any) => s.id === step.screenId);
        if (!scr) throw new Error(`Screen not found: ${step.screenId}`);
        url = baseUrl + scr.url_path;
      } else {
        throw new Error("goto requires url or screenId");
      }
      await page.goto(url, { waitUntil: "networkidle2" });
      if (step.narrate) await sleep(1000);
      break;
    }

    case "caption": {
      await page.evaluate(
        (t: string, p: string) => (window as any).coderail?.caption(t, { placement: p, duration: 4000 }),
        step.text, step.placement || "bottom",
      );
      await sleep(3000);
      break;
    }

    case "pause": {
      await sleep(step.ms || 1000);
      break;
    }

    case "fill": {
      const elData = elements.find((e) => e.id === step.elementId);
      if (!elData) throw new Error(`Element not found: ${step.elementId}`);
      if (step.narrate) {
        await page.evaluate((t: string) => (window as any).coderail?.caption(t, { placement: "bottom", duration: 2000 }), step.narrate);
        await sleep(800);
      }
      const { handle, selector } = await resolveElement(page, elData, params);
      const value = interpolate(step.value, params);
      await handle.type(value, { delay: 60 });
      await page.evaluate((s: string) => (window as any).coderail?.highlight(s, { style: "box", duration: 1500 }), selector);
      await sleep(800);
      break;
    }

    case "click": {
      const elData = elements.find((e) => e.id === step.elementId);
      if (!elData) throw new Error(`Element not found: ${step.elementId}`);
      if (step.narrate) {
        await page.evaluate((t: string) => (window as any).coderail?.caption(t, { placement: "bottom", duration: 2000 }), step.narrate);
        await sleep(800);
      }
      const { handle, selector } = await resolveElement(page, elData, params);
      await page.evaluate((s: string) => (window as any).coderail?.highlight(s, { style: "pulse", duration: 1000 }), selector);
      await sleep(600);
      await handle.click();
      await sleep(600);
      break;
    }

    case "waitFor": {
      const elData = elements.find((e) => e.id === step.elementId);
      if (!elData) throw new Error(`Element not found: ${step.elementId}`);
      const { selector } = await resolveElement(page, elData, params);
      await page.waitForSelector(selector, { visible: true, timeout: 15000 });
      break;
    }

    case "highlight": {
      const elData = elements.find((e) => e.id === step.elementId);
      if (!elData) throw new Error(`Element not found: ${step.elementId}`);
      if (step.narrate) {
        await page.evaluate((t: string) => (window as any).coderail?.caption(t, { placement: "bottom", duration: 3000 }), step.narrate);
      }
      const { selector } = await resolveElement(page, elData, params);
      await page.evaluate(
        (s: string, st: string) => (window as any).coderail?.highlight(s, { style: st, duration: 3000 }),
        selector, step.style || "box",
      );
      await sleep(3000);
      break;
    }

    default:
      throw new Error(`Unknown step type: ${step.type}`);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  const flowId = process.argv[2];
  if (!flowId) {
    console.error("Usage: npx tsx scripts/run-local.ts <flowId> [--params '{...}']");
    process.exit(1);
  }

  let params: Record<string, any> = {};
  const paramsIdx = process.argv.indexOf("--params");
  if (paramsIdx !== -1 && process.argv[paramsIdx + 1]) {
    params = JSON.parse(process.argv[paramsIdx + 1]);
  }

  console.log(`\n⚡ CodeRail Flow — Local Runner`);
  console.log(`   Flow: ${flowId}`);
  console.log(`   Params: ${JSON.stringify(params)}\n`);

  // 1. Create run via API (external=true skips the stub runner)
  console.log("→ Creating run...");
  const { runId } = await api("POST", "/runs?external=true", { flowId, params });
  console.log(`  Run ID: ${runId}`);

  // 2. Fetch flow definition
  const { flow } = await api("GET", `/flows/${flowId}`);
  const definition = typeof flow.definition === "string" ? JSON.parse(flow.definition) : flow.definition;
  console.log(`  Flow: "${flow.name}" — ${definition.steps.length} steps`);

  // 3. Fetch project for base_url
  const project = await api("GET", `/projects/${flow.project_id}`).then((r: any) => r.project);
  console.log(`  Target: ${project.base_url}`);

  // 4. Fetch screens + elements
  const { screens } = await api("GET", `/screens?projectId=${project.id}`);
  const allElements: ElementData[] = [];
  for (const scr of screens) {
    const { elements } = await api("GET", `/elements?screenId=${scr.id}`);
    allElements.push(...elements);
  }
  console.log(`  Screens: ${screens.length} | Elements: ${allElements.length}\n`);

  // 5. Launch real browser
  console.log("🌐 Launching browser...");
  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await injectOverlay(page);

  // 6. Execute steps
  const stepResults: StepResult[] = [];
  const screenshots: Array<{ stepIndex: number; bytes: Buffer }> = [];
  const narrations: NarrationEntry[] = [];
  let narrationIdx = 1;
  let timeMs = 0;
  const runStart = Date.now();

  // Mark run as running
  console.log("\n🚀 Executing steps...\n");

  for (let i = 0; i < definition.steps.length; i++) {
    const step = definition.steps[i];
    const stepStart = Date.now();
    const narrate = step.narrate || step.text;
    const desc = narrate || `${step.type} step`;
    process.stdout.write(`  [${i + 1}/${definition.steps.length}] ${step.type}: ${desc.substring(0, 60)}...`);

    try {
      await executeStep(page, step, allElements, screens, project.base_url, params);

      const durMs = Date.now() - stepStart;
      stepResults.push({ idx: i, type: step.type, status: "ok", narrate, durationMs: durMs });

      // Take screenshot
      const screenshotBuf = await page.screenshot({ type: "png" }) as Buffer;
      screenshots.push({ stepIndex: i, bytes: screenshotBuf });

      // Build narration entry
      if (narrate) {
        const dur = Math.max(durMs, 2000);
        narrations.push({ index: narrationIdx++, text: narrate, startMs: timeMs, endMs: timeMs + dur });
        timeMs += dur;
      } else {
        timeMs += durMs;
      }

      console.log(` ✅ (${durMs}ms)`);
    } catch (err: any) {
      const durMs = Date.now() - stepStart;
      stepResults.push({ idx: i, type: step.type, status: "failed", narrate, durationMs: durMs, error: err.message });
      // Error screenshot
      try {
        const errShot = await page.screenshot({ type: "png" }) as Buffer;
        screenshots.push({ stepIndex: i, bytes: errShot });
      } catch {}
      console.log(` ❌ ${err.message}`);
      break; // Stop on first failure
    }
  }

  const totalDuration = Date.now() - runStart;
  await browser.close();

  // 7. Build report
  const report = {
    runId,
    flowId,
    flowName: flow.name,
    status: stepResults.every((s) => s.status === "ok") ? "succeeded" : "failed",
    runnerVersion: "local-puppeteer-1.0",
    duration: totalDuration,
    stepsExecuted: stepResults.length,
    stepsFailed: stepResults.filter((s) => s.status === "failed").length,
    steps: stepResults,
    params,
    generatedAt: new Date().toISOString(),
  };

  // 8. Generate SRT
  const srt = generateSRT(narrations);

  // 9. Save artifacts locally
  const outDir = path.join(process.cwd(), "artifacts", runId);
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(outDir, "subtitles.srt"), srt);
  for (let i = 0; i < screenshots.length; i++) {
    fs.writeFileSync(path.join(outDir, `screenshot-step-${screenshots[i].stepIndex}.png`), screenshots[i].bytes);
  }

  console.log(`\n📁 Artifacts saved to: ${outDir}`);
  console.log(`   • report.json (${JSON.stringify(report).length} bytes)`);
  console.log(`   • subtitles.srt (${srt.length} bytes)`);
  console.log(`   • ${screenshots.length} screenshots`);

  // 10. Upload artifacts to API (inline content for local D1)
  console.log("\n📤 Uploading artifacts to API...");

  // Upload report
  await uploadInlineArtifact(runId, "report", "application/json", JSON.stringify(report));
  // Upload SRT
  await uploadInlineArtifact(runId, "subtitle", "text/srt", srt);
  // Upload screenshots as base64 inline
  for (let i = 0; i < screenshots.length; i++) {
    await uploadInlineArtifact(
      runId,
      `screenshot-${screenshots[i].stepIndex}`,
      "image/png",
      screenshots[i].bytes.toString("base64"),
    );
  }

  // 11. Mark run complete via API
  const finalStatus = report.status;
  try {
    await api("POST", `/internal/runs/${runId}/complete`, {
      status: finalStatus,
      errorMessage: finalStatus === "failed" ? stepResults.find(s => s.status === "failed")?.error : undefined,
    });
  } catch (e: any) {
    console.log(`   ⚠️  Could not mark run complete: ${e.message}`);
  }

  console.log(`\n${finalStatus === "succeeded" ? "✅" : "❌"} Run ${finalStatus} in ${totalDuration}ms`);
  console.log(`   View in dashboard: http://localhost:5173/app\n`);
}

async function uploadInlineArtifact(runId: string, kind: string, contentType: string, content: string) {
  // Direct D1 insert via a custom endpoint — we'll add this to the API
  try {
    await api("POST", "/internal/artifacts", { runId, kind, contentType, content });
    console.log(`   ✅ ${kind}`);
  } catch (e: any) {
    console.log(`   ⚠️  ${kind}: ${e.message} (will save locally only)`);
  }
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err.message);
  process.exit(1);
});
