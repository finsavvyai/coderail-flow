#!/usr/bin/env npx tsx
/**
 * CodeRail Flow Recorder - Puppeteer-based
 * 
 * Opens a browser, records your interactions, and saves them as a flow.
 * 
 * Usage:
 *   npx tsx scripts/record-flow.ts <url> [--name "Flow Name"] [--output file.json]
 * 
 * Example:
 *   npx tsx scripts/record-flow.ts http://localhost:3333 --name "Login Flow"
 */

import puppeteer from "puppeteer";
import * as readline from "readline";
import * as fs from "fs";

interface RecordedAction {
  id: string;
  type: "click" | "fill" | "goto" | "select";
  timestamp: number;
  selector?: string;
  value?: string;
  url?: string;
  text?: string;
}

const args = process.argv.slice(2);
const url = args.find(a => a.startsWith("http")) || "http://localhost:3333";
const outputFile = args.includes("--output") 
  ? args[args.indexOf("--output") + 1] 
  : "recorded-flow.json";
const flowName = args.includes("--name")
  ? args[args.indexOf("--name") + 1]
  : "Recorded Flow";

const recordedActions: RecordedAction[] = [];

async function main() {
  console.log("\n🎬 CodeRail Flow Recorder\n");
  console.log(`URL: ${url}`);
  console.log(`Output: ${outputFile}\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();

  // Initial goto
  recordedActions.push({
    id: Date.now().toString(),
    type: "goto",
    timestamp: Date.now(),
    url
  });

  // Inject recording script before page loads
  await page.evaluateOnNewDocument(() => {
    window.addEventListener("load", () => {
      function getSelector(el: Element): string {
        const e = el as HTMLElement;
        if ((e as any).dataset?.testid) return `[data-testid="${(e as any).dataset.testid}"]`;
        if (e.id) return `#${e.id}`;
        if ((e as any).name) return `[name="${(e as any).name}"]`;
        if (e.className && typeof e.className === "string") {
          const cls = e.className.split(" ").filter(c => c).slice(0, 2);
          if (cls.length) return `${e.tagName.toLowerCase()}.${cls.join(".")}`;
        }
        return e.tagName.toLowerCase();
      }

      document.addEventListener("click", (e) => {
        const el = e.target as HTMLElement;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") return;
        (window as any).__recordAction?.({
          type: "click",
          selector: getSelector(el),
          text: (el.innerText || "").slice(0, 40)
        });
      }, true);

      document.addEventListener("change", (e) => {
        const el = e.target as HTMLInputElement;
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          (window as any).__recordAction?.({
            type: "fill",
            selector: getSelector(el),
            value: el.value
          });
        } else if (el.tagName === "SELECT") {
          (window as any).__recordAction?.({
            type: "select",
            selector: getSelector(el),
            value: el.value
          });
        }
      }, true);

      // Visual indicator
      const div = document.createElement("div");
      div.innerHTML = "🔴 Recording - Press Enter in terminal to stop";
      div.style.cssText = "position:fixed;top:10px;right:10px;background:#000;color:#fff;padding:8px 16px;border-radius:20px;font:14px system-ui;z-index:999999";
      document.body.appendChild(div);
    });
  });

  // Receive actions from page
  await page.exposeFunction("__recordAction", (action: Partial<RecordedAction>) => {
    const full: RecordedAction = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: action.type as any,
      ...action
    };
    recordedActions.push(full);
    const icon = action.type === "click" ? "👆" : action.type === "fill" ? "✏️" : "📝";
    console.log(`  ${icon} ${action.type}: ${action.selector || action.text || ""}`);
  });

  // Track navigation
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame() && frame.url() !== "about:blank") {
      const last = recordedActions[recordedActions.length - 1];
      if (last?.url !== frame.url()) {
        recordedActions.push({
          id: Date.now().toString(),
          type: "goto",
          timestamp: Date.now(),
          url: frame.url()
        });
        console.log(`  🌐 goto: ${frame.url()}`);
      }
    }
  });

  await page.goto(url, { waitUntil: "networkidle2" });
  console.log("\n📍 Recording... Interact with the page.\n");

  // Wait for Enter
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise<void>(r => rl.question("Press Enter to stop recording...\n", () => { rl.close(); r(); }));

  console.log("\n⏹️  Stopped.\n");

  // Convert to flow steps
  const steps = recordedActions.map(a => {
    if (a.type === "goto") return { type: "goto", url: a.url };
    if (a.type === "click") return { type: "click", elementId: `el-${a.selector?.replace(/[^a-z0-9]/gi, "-").slice(0, 25)}`, _selector: a.selector };
    if (a.type === "fill") return { type: "fill", elementId: `el-${a.selector?.replace(/[^a-z0-9]/gi, "-").slice(0, 25)}`, value: a.value, _selector: a.selector };
    if (a.type === "select") return { type: "select", elementId: `el-${a.selector?.replace(/[^a-z0-9]/gi, "-").slice(0, 25)}`, value: a.value, _selector: a.selector };
    return { type: "pause", ms: 1000 };
  });

  const flow = {
    name: flowName,
    description: `Recorded ${new Date().toISOString()}`,
    definition: { params: [], steps }
  };

  fs.writeFileSync(outputFile, JSON.stringify(flow, null, 2));
  console.log(`✅ Saved to ${outputFile} (${steps.length} steps)\n`);

  await browser.close();
}

main().catch(console.error);
