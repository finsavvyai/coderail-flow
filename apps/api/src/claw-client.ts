/**
 * Claw Gateway client — shared AI proxy for CodeRailFlow.
 *
 * Calls the Claw Gateway to access AI features (prompt completion,
 * screenshot analysis, narration) without embedding provider keys.
 */

import type { Env } from './env';

interface ClawEnv {
  CLAW_API_KEY?: string;
  CLAW_ENDPOINT?: string;
  CLAW_PROJECT_ID?: string;
}

interface ClawPromptOptions {
  system?: string;
  maxTokens?: number;
}

/**
 * Send a prompt to the Claw Gateway and return the text response.
 * Throws if the gateway is not configured or returns an error.
 */
export async function clawPrompt(
  env: ClawEnv,
  prompt: string,
  options?: ClawPromptOptions
): Promise<string> {
  if (!env.CLAW_API_KEY || !env.CLAW_ENDPOINT || !env.CLAW_PROJECT_ID) {
    throw new Error('Claw Gateway not configured');
  }

  const res = await fetch(`${env.CLAW_ENDPOINT}/v1/prompt`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CLAW_API_KEY}`,
      'X-Project-Id': env.CLAW_PROJECT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      system: options?.system,
      maxTokens: options?.maxTokens ?? 2048,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Claw Gateway error ${res.status}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}

/** Check whether the Claw Gateway env vars are all present. */
export function isClawConfigured(env: ClawEnv): boolean {
  return !!(env.CLAW_API_KEY && env.CLAW_ENDPOINT && env.CLAW_PROJECT_ID);
}
