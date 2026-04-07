/**
 * Visual regression comparison engine.
 *
 * Compares two screenshot byte arrays and returns diff metrics.
 * Uses SHA-256 fast path then byte-level comparison with threshold.
 */

export interface CompareOptions {
  /** Mismatch threshold (0.0 - 1.0). Default 0.1 (10%) */
  threshold?: number;
}

export interface CompareResult {
  match: boolean;
  mismatchPixels: number;
  mismatchPercentage: number;
  totalPixels: number;
}

/**
 * Compare two screenshot byte arrays.
 * Uses SHA-256 hash for fast identical-match, then byte-level diff.
 *
 * @param baseline - Baseline screenshot bytes (PNG)
 * @param current  - Current screenshot bytes (PNG)
 * @param options  - Comparison options
 */
export async function compareScreenshots(
  baseline: Uint8Array,
  current: Uint8Array,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const threshold = options.threshold ?? 0.1;

  // Fast path: identical bytes via hash
  if (baseline.length === current.length) {
    const baselineHash = await sha256(baseline);
    const currentHash = await sha256(current);

    if (baselineHash === currentHash) {
      return {
        match: true,
        mismatchPixels: 0,
        mismatchPercentage: 0,
        totalPixels: baseline.length,
      };
    }
  }

  // Byte-level comparison
  const maxLen = Math.max(baseline.length, current.length);
  let mismatchBytes = 0;

  for (let i = 0; i < maxLen; i++) {
    const a = i < baseline.length ? baseline[i] : 0;
    const b = i < current.length ? current[i] : 0;
    if (a !== b) mismatchBytes++;
  }

  const mismatchPercentage = maxLen > 0 ? mismatchBytes / maxLen : 0;

  return {
    match: mismatchPercentage <= threshold,
    mismatchPixels: mismatchBytes,
    mismatchPercentage,
    totalPixels: maxLen,
  };
}

/**
 * Capture a PNG screenshot via CDP for reliable pixel comparison.
 */
export async function captureComparisonScreenshot(
  cdpSession: any
): Promise<Uint8Array> {
  const shot = await cdpSession.send('Page.captureScreenshot', {
    format: 'png',
  });
  const binaryString = atob(shot.data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    data as unknown as ArrayBuffer
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
