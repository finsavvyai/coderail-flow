/**
 * Hook pipeline for flow execution lifecycle.
 *
 * Adapted from Claw-Code's PreToolUse/PostToolUse hook system.
 * Supports beforeStep/afterStep hooks with allow/deny/warn outcomes.
 */

export type HookEvent = 'beforeStep' | 'afterStep';

export interface HookPayload {
  event: HookEvent;
  stepType: string;
  stepIndex: number;
  flowId: string;
  runId: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  isError?: boolean;
  timestamp: number;
}

export type HookOutcome = 'allow' | 'deny' | 'warn';

export interface HookResult {
  outcome: HookOutcome;
  messages: string[];
}

export type HookHandler = (payload: HookPayload) => Promise<HookResult>;

/**
 * Webhook-based hook handler.
 * Sends POST to a URL, interprets response status as outcome.
 *   200 = allow, 403 = deny, other = warn
 */
export function createWebhookHook(url: string, timeoutMs = 5000): HookHandler {
  return async (payload) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      const body = await res.text().catch(() => '');

      if (res.status === 200) return { outcome: 'allow', messages: body ? [body] : [] };
      if (res.status === 403) return { outcome: 'deny', messages: [body || 'Hook denied'] };
      return { outcome: 'warn', messages: [`Hook returned ${res.status}: ${body}`] };
    } catch (err: any) {
      return { outcome: 'warn', messages: [`Hook failed: ${err.message}`] };
    }
  };
}

export interface HookConfig {
  beforeStep: HookHandler[];
  afterStep: HookHandler[];
}

/**
 * Run all hooks for an event. Returns combined result.
 * A single deny stops execution. Warnings accumulate.
 */
export async function runHooks(
  hooks: HookHandler[],
  payload: HookPayload
): Promise<HookResult> {
  if (hooks.length === 0) {
    return { outcome: 'allow', messages: [] };
  }

  const allMessages: string[] = [];

  for (const hook of hooks) {
    const result = await hook(payload);
    allMessages.push(...result.messages);

    if (result.outcome === 'deny') {
      return { outcome: 'deny', messages: allMessages };
    }
  }

  return { outcome: 'allow', messages: allMessages };
}

/**
 * Build hook payload for a beforeStep event.
 */
export function buildBeforeStepPayload(
  flowId: string,
  runId: string,
  stepType: string,
  stepIndex: number,
  input: Record<string, unknown>
): HookPayload {
  return {
    event: 'beforeStep',
    stepType,
    stepIndex,
    flowId,
    runId,
    input,
    timestamp: Date.now(),
  };
}

/**
 * Build hook payload for an afterStep event.
 */
export function buildAfterStepPayload(
  flowId: string,
  runId: string,
  stepType: string,
  stepIndex: number,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  isError: boolean
): HookPayload {
  return {
    event: 'afterStep',
    stepType,
    stepIndex,
    flowId,
    runId,
    input,
    output,
    isError,
    timestamp: Date.now(),
  };
}
