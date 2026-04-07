import { describe, it, expect } from 'vitest';
import { compareScreenshots } from './visual-compare';

describe('compareScreenshots', () => {
  it('returns match for identical byte arrays', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await compareScreenshots(data, data);
    expect(result.match).toBe(true);
    expect(result.mismatchPixels).toBe(0);
    expect(result.mismatchPercentage).toBe(0);
  });

  it('detects mismatch between different arrays', async () => {
    const baseline = new Uint8Array([1, 2, 3, 4, 5]);
    const current = new Uint8Array([1, 2, 9, 9, 5]);
    const result = await compareScreenshots(baseline, current, { threshold: 0.01 });
    expect(result.match).toBe(false);
    expect(result.mismatchPixels).toBe(2);
    expect(result.mismatchPercentage).toBeCloseTo(0.4);
  });

  it('respects threshold — high threshold passes with diffs', async () => {
    const baseline = new Uint8Array([1, 2, 3, 4, 5]);
    const current = new Uint8Array([1, 2, 9, 4, 5]);
    const result = await compareScreenshots(baseline, current, { threshold: 0.5 });
    expect(result.match).toBe(true);
    expect(result.mismatchPercentage).toBeCloseTo(0.2);
  });

  it('handles different-length arrays', async () => {
    const baseline = new Uint8Array([1, 2, 3]);
    const current = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await compareScreenshots(baseline, current, { threshold: 0.01 });
    expect(result.match).toBe(false);
    expect(result.mismatchPixels).toBe(2);
    expect(result.totalPixels).toBe(5);
  });

  it('handles empty arrays', async () => {
    const empty = new Uint8Array([]);
    const result = await compareScreenshots(empty, empty);
    expect(result.match).toBe(true);
    expect(result.mismatchPercentage).toBe(0);
  });

  it('uses default threshold of 0.1', async () => {
    const baseline = new Uint8Array(100).fill(0);
    const current = new Uint8Array(100).fill(0);
    // Change 5 out of 100 bytes (5% < 10% threshold)
    for (let i = 0; i < 5; i++) current[i] = 255;
    const result = await compareScreenshots(baseline, current);
    expect(result.match).toBe(true);
    expect(result.mismatchPercentage).toBeCloseTo(0.05);
  });
});
