/**
 * Local dev runner service.
 *
 * Launches a real Puppeteer browser to execute flow steps,
 * takes per-step screenshots, and returns results via HTTP.
 *
 * Usage: pnpm dev:runner
 */

import http from 'node:http';
import puppeteer, { type Browser, type Page } from 'puppeteer';

const PORT = Number(process.env.RUNNER_PORT || 8788);

interface FlowStep {
  type: string;
  url?: string;
  screenId?: string;
  narrate?: string;
  elementId?: string;
  value?: string;
  text?: string;
  ms?: number;
  selector?: string;
  keys?: string;
  placement?: string;
  direction?: string;
  pixels?: number;
  script?: string;
  [key: string]: any;
}

interface RunRequest {
  runId: string;
  definition: { steps: FlowStep[] };
  baseUrl?: string;
  screens?: Array<{ id: string; url_path: string }>;
  elements?: Array<{ id: string; locator_primary: string }>;
}

interface StepResult {
  idx: number;
  type: string;
  status: 'ok' | 'failed';
  durationMs: number;
  screenshot?: string; // base64
  error?: string;
  narration?: string;
}

async function executeStep(page: Page, step: FlowStep, input: RunRequest): Promise<void> {
  switch (step.type) {
    case 'goto':
    case 'navigate': {
      let targetUrl = step.url || '';
      if (!targetUrl && step.screenId && input.screens) {
        const screen = input.screens.find((s) => s.id === step.screenId);
        if (screen && input.baseUrl) {
          targetUrl = input.baseUrl + screen.url_path;
        }
      }
      if (!targetUrl) throw new Error('goto step requires a url or screenId');
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      break;
    }
    case 'click': {
      const sel = resolveSelector(step, input);
      await page.waitForSelector(sel, { visible: true, timeout: 10000 });
      await page.click(sel);
      break;
    }
    case 'fill': {
      const sel = resolveSelector(step, input);
      await page.waitForSelector(sel, { visible: true, timeout: 10000 });
      await page.click(sel, { clickCount: 3 });
      await page.type(sel, step.value || '');
      break;
    }
    case 'hover': {
      const sel = resolveSelector(step, input);
      await page.waitForSelector(sel, { visible: true, timeout: 10000 });
      await page.hover(sel);
      break;
    }
    case 'select': {
      const sel = resolveSelector(step, input);
      await page.select(sel, step.value || '');
      break;
    }
    case 'keyboard': {
      if (step.keys) await page.keyboard.press(step.keys);
      break;
    }
    case 'waitFor': {
      const sel = resolveSelector(step, input);
      await page.waitForSelector(sel, { timeout: 30000 });
      break;
    }
    case 'pause':
      await new Promise((r) => setTimeout(r, step.ms || 1000));
      break;
    case 'caption':
      // No-op in local runner — just a narration step
      await new Promise((r) => setTimeout(r, 500));
      break;
    case 'screenshot':
      // Screenshot is taken after every step anyway
      break;
    case 'scroll':
      await page.evaluate((dir: string, px: number) => {
        if (dir === 'top') window.scrollTo(0, 0);
        else if (dir === 'bottom') window.scrollTo(0, document.body.scrollHeight);
        else if (dir === 'down') window.scrollBy(0, px);
        else if (dir === 'up') window.scrollBy(0, -px);
      }, step.direction || 'down', step.pixels || 300);
      break;
    case 'executeScript':
      if (step.script) await page.evaluate(step.script);
      break;
    case 'assertText': {
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (!bodyText.includes(step.text || '')) {
        throw new Error(`Expected text "${step.text}" not found on page`);
      }
      break;
    }
    case 'assertUrl': {
      const currentUrl = page.url();
      if (step.pattern && !currentUrl.includes(step.pattern)) {
        throw new Error(`URL "${currentUrl}" does not match pattern "${step.pattern}"`);
      }
      break;
    }
    default:
      console.log(`  ⚠ Unsupported step type "${step.type}", skipping`);
  }
}

function resolveSelector(step: FlowStep, input: RunRequest): string {
  // If step has a direct selector, use it
  if (step.selector) return step.selector;

  // Try to resolve from elements DB
  if (step.elementId && input.elements) {
    const el = input.elements.find((e) => e.id === step.elementId);
    if (el) {
      try {
        const locator = JSON.parse(el.locator_primary);
        if (locator.type === 'css') return locator.value;
        if (locator.type === 'testid') return `[data-testid="${locator.value}"]`;
        if (locator.type === 'role') return `[role="${locator.value}"]`;
        if (locator.type === 'label') return `[aria-label="${locator.value}"]`;
        return locator.value;
      } catch {
        return `[data-testid="${step.elementId}"]`;
      }
    }
  }

  // Fallback: use elementId as data-testid
  if (step.elementId) return `[data-testid="${step.elementId}"]`;

  throw new Error(`Cannot resolve selector for step type "${step.type}"`);
}

async function handleRun(req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  for await (const chunk of req) body += chunk;

  let input: RunRequest;
  try {
    input = JSON.parse(body);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const steps = input.definition?.steps || [];
  console.log(`\n🚀 Executing run ${input.runId} with ${steps.length} step(s)`);

  let browser: Browser | null = null;
  const results: StepResult[] = [];

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const start = Date.now();
      console.log(`  ▶ Step ${i + 1}/${steps.length}: ${step.type}${step.url ? ` → ${step.url}` : ''}`);

      try {
        await executeStep(page, step, input);

        // Take screenshot after each step
        const screenshotBuf = await page.screenshot({ encoding: 'base64' }) as string;

        results.push({
          idx: i,
          type: step.type,
          status: 'ok',
          durationMs: Date.now() - start,
          screenshot: screenshotBuf,
          narration: step.narrate || step.text,
        });
        console.log(`  ✅ Step ${i + 1} completed (${Date.now() - start}ms)`);
      } catch (err: any) {
        // Try to capture error screenshot
        let errorScreenshot: string | undefined;
        try {
          errorScreenshot = await page.screenshot({ encoding: 'base64' }) as string;
        } catch {}

        results.push({
          idx: i,
          type: step.type,
          status: 'failed',
          durationMs: Date.now() - start,
          screenshot: errorScreenshot,
          error: err.message,
          narration: step.narrate || step.text,
        });
        console.log(`  ❌ Step ${i + 1} failed: ${err.message}`);
        break; // Stop on first failure
      }
    }

    // Keep browser open briefly so user can see final state
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err: any) {
    console.error('Browser launch error:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message, steps: results }));
    return;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const allOk = results.every((r) => r.status === 'ok');
  console.log(`${allOk ? '🎉' : '💥'} Run ${input.runId} ${allOk ? 'succeeded' : 'failed'} (${results.length} steps)\n`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: allOk ? 'succeeded' : 'failed',
    steps: results,
  }));
}

// ─── Recording session ───────────────────────────────────────────────
interface RecordedAction {
  id: string;
  type: 'click' | 'fill' | 'goto' | 'select' | 'scroll';
  timestamp: number;
  selector?: string;
  value?: string;
  url?: string;
  text?: string;
  tagName?: string;
  placeholder?: string;
}

interface RecordingSession {
  browser: Browser;
  page: Page;
  actions: RecordedAction[];
  lastPollIndex: number;
}

let activeRecording: RecordingSession | null = null;
let actionIdCounter = 0;

function genActionId(): string {
  return `act-${Date.now()}-${++actionIdCounter}`;
}

async function handleRecordStart(req: http.IncomingMessage, res: http.ServerResponse) {
  if (activeRecording) {
    // Close existing session
    await activeRecording.browser.close().catch(() => {});
    activeRecording = null;
  }

  let body = '';
  for await (const chunk of req) body += chunk;
  let input: { url: string };
  try {
    input = JSON.parse(body);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON — need { url }' }));
    return;
  }

  if (!input.url) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'url is required' }));
    return;
  }

  console.log(`\n🎬 Starting recording session → ${input.url}`);

  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const session: RecordingSession = {
      browser,
      page,
      actions: [{ id: genActionId(), type: 'goto', timestamp: Date.now(), url: input.url }],
      lastPollIndex: 0,
    };

    // Inject action capture script into every frame
    await page.evaluateOnNewDocument(() => {
      const CR = '__coderail_recorder__';
      if ((window as any)[CR]) return;
      (window as any)[CR] = true;

      function selectorFor(el: Element): string {
        if (el.id) return `#${el.id}`;
        const testId = el.getAttribute('data-testid');
        if (testId) return `[data-testid="${testId}"]`;
        const name = el.getAttribute('name');
        if (name) return `[name="${name}"]`;
        // Build a basic CSS path
        const tag = el.tagName.toLowerCase();
        const parent = el.parentElement;
        if (!parent) return tag;
        const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
        if (siblings.length === 1) return `${selectorFor(parent)} > ${tag}`;
        const idx = siblings.indexOf(el) + 1;
        return `${selectorFor(parent)} > ${tag}:nth-child(${idx})`;
      }

      function sendAction(action: any) {
        // Post to opener or parent (for CDP capture via binding)
        (window as any).__coderail_emit__?.(JSON.stringify(action));
      }

      document.addEventListener('click', (e) => {
        const el = e.target as Element;
        if (!el) return;
        sendAction({
          type: 'click',
          selector: selectorFor(el),
          text: (el as HTMLElement).innerText?.slice(0, 80),
          tagName: el.tagName.toLowerCase(),
        });
      }, true);

      document.addEventListener('change', (e) => {
        const el = e.target as HTMLInputElement | HTMLSelectElement;
        if (!el) return;
        if (el.tagName === 'SELECT') {
          sendAction({
            type: 'select',
            selector: selectorFor(el),
            value: el.value,
            tagName: 'select',
          });
        } else {
          sendAction({
            type: 'fill',
            selector: selectorFor(el),
            value: el.value,
            tagName: el.tagName.toLowerCase(),
            placeholder: (el as HTMLInputElement).placeholder,
          });
        }
      }, true);
    });

    // Expose a binding so the injected script can send actions back to Node
    await page.exposeFunction('__coderail_emit__', (jsonStr: string) => {
      try {
        const data = JSON.parse(jsonStr);
        const action: RecordedAction = {
          id: genActionId(),
          type: data.type,
          timestamp: Date.now(),
          selector: data.selector,
          value: data.value,
          text: data.text,
          tagName: data.tagName,
          placeholder: data.placeholder,
          url: data.url,
        };
        session.actions.push(action);
        console.log(`  📝 Recorded: ${action.type} ${action.selector || action.url || ''}`);
      } catch {}
    });

    // Capture navigation events
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        const lastAction = session.actions[session.actions.length - 1];
        // Avoid duplicate goto for the initial navigation
        if (lastAction?.type !== 'goto' || lastAction.url !== url) {
          session.actions.push({
            id: genActionId(),
            type: 'goto',
            timestamp: Date.now(),
            url,
          });
          console.log(`  📝 Recorded: goto ${url}`);
        }
      }
    });

    // Detect browser close
    browser.on('disconnected', () => {
      if (activeRecording?.browser === browser) {
        console.log('  🛑 Browser closed by user');
        activeRecording = null;
      }
    });

    await page.goto(input.url, { waitUntil: 'networkidle2', timeout: 30000 });
    activeRecording = session;

    console.log('  ✅ Recording session started — interact with the browser');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'recording', actionsCount: session.actions.length }));
  } catch (err: any) {
    console.error('  ❌ Failed to start recording:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

function handleRecordActions(_req: http.IncomingMessage, res: http.ServerResponse) {
  if (!activeRecording) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ recording: false, actions: [] }));
    return;
  }

  // Return only new actions since last poll
  const newActions = activeRecording.actions.slice(activeRecording.lastPollIndex);
  activeRecording.lastPollIndex = activeRecording.actions.length;

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      recording: true,
      actions: newActions,
      totalCount: activeRecording.actions.length,
    })
  );
}

async function handleRecordScreenshot(_req: http.IncomingMessage, res: http.ServerResponse) {
  if (!activeRecording) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No active recording session' }));
    return;
  }

  try {
    const screenshot = (await activeRecording.page.screenshot({ encoding: 'base64' })) as string;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ screenshot }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

async function handleRecordStop(_req: http.IncomingMessage, res: http.ServerResponse) {
  if (!activeRecording) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ recording: false, actions: [] }));
    return;
  }

  const allActions = activeRecording.actions;
  console.log(`  🛑 Stopping recording — ${allActions.length} action(s) captured`);

  await activeRecording.browser.close().catch(() => {});
  activeRecording = null;

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ recording: false, actions: allActions }));
}

// ─── HTTP Server ─────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/execute') {
    await handleRun(req, res);
    return;
  }

  // Recording endpoints
  if (req.method === 'POST' && req.url === '/record/start') {
    await handleRecordStart(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/record/actions') {
    handleRecordActions(req, res);
    return;
  }
  if (req.method === 'GET' && req.url === '/record/screenshot') {
    await handleRecordScreenshot(req, res);
    return;
  }
  if (req.method === 'POST' && req.url === '/record/stop') {
    await handleRecordStop(req, res);
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'coderail-local-runner',
        recording: !!activeRecording,
      })
    );
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n⚡ CodeRail Flow local runner listening on http://localhost:${PORT}`);
  console.log(`   POST /execute           — run a flow definition`);
  console.log(`   POST /record/start      — start recording session`);
  console.log(`   GET  /record/actions     — poll new recorded actions`);
  console.log(`   GET  /record/screenshot  — get live screenshot`);
  console.log(`   POST /record/stop        — stop recording session`);
  console.log(`   GET  /health             — health check\n`);
});
