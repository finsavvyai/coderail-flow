import { describe, it, expect } from 'vitest';
import { generateSRT, buildNarrationTimeline } from './subtitle.js';

describe('generateSRT', () => {
  it('returns empty string for empty array', () => {
    expect(generateSRT([])).toBe('');
  });

  it('generates correct SRT for a single entry', () => {
    const result = generateSRT([{ text: 'Hello world', startMs: 0, endMs: 3000 }]);
    expect(result).toBe('1\n00:00:00,000 --> 00:00:03,000\nHello world\n');
  });

  it('generates sequential index numbers for multiple entries', () => {
    const entries = [
      { text: 'First', startMs: 0, endMs: 2000 },
      { text: 'Second', startMs: 2000, endMs: 5000 },
    ];
    const result = generateSRT(entries);
    expect(result).toContain('1\n00:00:00,000');
    expect(result).toContain('2\n00:00:02,000');
  });

  it('formats timestamps with hours, minutes, seconds, and milliseconds', () => {
    const result = generateSRT([{ text: 'Test', startMs: 3_661_500, endMs: 3_665_000 }]);
    // 3661500ms = 1h 1m 1s 500ms
    expect(result).toContain('01:01:01,500');
    // 3665000ms = 1h 1m 5s 0ms
    expect(result).toContain('01:01:05,000');
  });

  it('pads single-digit hours, minutes, and seconds', () => {
    const result = generateSRT([{ text: 'T', startMs: 1000, endMs: 2000 }]);
    expect(result).toContain('00:00:01,000 --> 00:00:02,000');
  });

  it('pads milliseconds to 3 digits', () => {
    const result = generateSRT([{ text: 'T', startMs: 5, endMs: 50 }]);
    expect(result).toContain('00:00:00,005 --> 00:00:00,050');
  });

  it('separates entries with blank lines', () => {
    const entries = [
      { text: 'A', startMs: 0, endMs: 1000 },
      { text: 'B', startMs: 1000, endMs: 2000 },
    ];
    const result = generateSRT(entries);
    const lines = result.split('\n');
    // After each text there should be an empty line
    expect(lines[3]).toBe('');
  });
});

describe('buildNarrationTimeline', () => {
  it('returns empty array for empty steps', () => {
    expect(buildNarrationTimeline([])).toEqual([]);
  });

  it('skips steps without narrate', () => {
    const steps = [{ type: 'click' }, { type: 'goto' }];
    expect(buildNarrationTimeline(steps)).toEqual([]);
  });

  it('skips steps with empty narrate string', () => {
    const steps = [
      { type: 'click', narrate: '' },
      { type: 'click', narrate: '   ' },
    ];
    expect(buildNarrationTimeline(steps)).toEqual([]);
  });

  it('uses 2000ms duration for short text (< 30 chars)', () => {
    const steps = [{ type: 'click', narrate: 'Click here' }]; // 10 chars
    const result = buildNarrationTimeline(steps);
    expect(result).toHaveLength(1);
    expect(result[0].endMs - result[0].startMs).toBe(2000);
  });

  it('uses 3000ms duration for medium text (30-79 chars)', () => {
    const narrate = 'A'.repeat(50); // 50 chars
    const steps = [{ type: 'click', narrate }];
    const result = buildNarrationTimeline(steps);
    expect(result[0].endMs - result[0].startMs).toBe(3000);
  });

  it('uses 4000ms duration for long text (>= 80 chars)', () => {
    const narrate = 'A'.repeat(80); // exactly 80 chars
    const steps = [{ type: 'click', narrate }];
    const result = buildNarrationTimeline(steps);
    expect(result[0].endMs - result[0].startMs).toBe(4000);
  });

  it('adds 500ms gap for non-narrated steps', () => {
    const steps = [
      { type: 'click' }, // 500ms gap
      { type: 'click', narrate: 'Hello' }, // startMs = 500
    ];
    const result = buildNarrationTimeline(steps);
    expect(result[0].startMs).toBe(500);
  });

  it('respects custom startTimeMs', () => {
    const steps = [{ type: 'click', narrate: 'Hi' }];
    const result = buildNarrationTimeline(steps, 5000);
    expect(result[0].startMs).toBe(5000);
  });

  it('chains entries back-to-back', () => {
    const steps = [
      { type: 'click', narrate: 'Step one' }, // short → 2000ms
      { type: 'click', narrate: 'Step two' }, // short → 2000ms
    ];
    const result = buildNarrationTimeline(steps);
    expect(result[0].startMs).toBe(0);
    expect(result[0].endMs).toBe(2000);
    expect(result[1].startMs).toBe(2000);
    expect(result[1].endMs).toBe(4000);
  });
});
