import { describe, it, expect } from 'vitest';
import { runHooks, buildBeforeStepPayload, buildAfterStepPayload } from './hook-pipeline';
import type { HookHandler } from './hook-pipeline';

describe('runHooks', () => {
  it('returns allow when no hooks registered', async () => {
    const payload = buildBeforeStepPayload('flow-1', 'run-1', 'click', 0, {});
    const result = await runHooks([], payload);
    expect(result.outcome).toBe('allow');
    expect(result.messages).toEqual([]);
  });

  it('runs all hooks and collects messages', async () => {
    const hook1: HookHandler = async () => ({ outcome: 'allow', messages: ['hook1 ok'] });
    const hook2: HookHandler = async () => ({ outcome: 'allow', messages: ['hook2 ok'] });

    const payload = buildBeforeStepPayload('flow-1', 'run-1', 'click', 0, {});
    const result = await runHooks([hook1, hook2], payload);
    expect(result.outcome).toBe('allow');
    expect(result.messages).toEqual(['hook1 ok', 'hook2 ok']);
  });

  it('stops on deny and returns accumulated messages', async () => {
    const hook1: HookHandler = async () => ({ outcome: 'allow', messages: ['ok'] });
    const deny: HookHandler = async () => ({ outcome: 'deny', messages: ['blocked'] });
    const hook3: HookHandler = async () => ({ outcome: 'allow', messages: ['unreachable'] });

    const payload = buildBeforeStepPayload('flow-1', 'run-1', 'js-eval', 2, {});
    const result = await runHooks([hook1, deny, hook3], payload);
    expect(result.outcome).toBe('deny');
    expect(result.messages).toEqual(['ok', 'blocked']);
  });

  it('warn outcome does not block execution', async () => {
    const warn: HookHandler = async () => ({ outcome: 'warn', messages: ['caution'] });
    const allow: HookHandler = async () => ({ outcome: 'allow', messages: [] });

    const payload = buildBeforeStepPayload('flow-1', 'run-1', 'navigate', 0, {});
    const result = await runHooks([warn, allow], payload);
    expect(result.outcome).toBe('allow');
    expect(result.messages).toContain('caution');
  });
});

describe('buildBeforeStepPayload', () => {
  it('builds correct payload', () => {
    const payload = buildBeforeStepPayload('f1', 'r1', 'click', 3, { selector: '#btn' });
    expect(payload.event).toBe('beforeStep');
    expect(payload.flowId).toBe('f1');
    expect(payload.runId).toBe('r1');
    expect(payload.stepType).toBe('click');
    expect(payload.stepIndex).toBe(3);
    expect(payload.input).toEqual({ selector: '#btn' });
    expect(payload.timestamp).toBeGreaterThan(0);
  });
});

describe('buildAfterStepPayload', () => {
  it('builds correct payload with output', () => {
    const payload = buildAfterStepPayload(
      'f1',
      'r1',
      'type',
      1,
      { text: 'hello' },
      { status: 'ok' },
      false
    );
    expect(payload.event).toBe('afterStep');
    expect(payload.output).toEqual({ status: 'ok' });
    expect(payload.isError).toBe(false);
  });
});
