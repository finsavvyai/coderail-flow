/**
 * SRT Subtitle Generator
 *
 * Generates SubRip (.srt) subtitles from flow narration timeline.
 */

export interface NarrationEntry {
  text: string;
  startMs: number;
  endMs: number;
}

/**
 * Generate SRT format subtitle file
 */
export function generateSRT(narrations: NarrationEntry[]): string {
  if (narrations.length === 0) {
    return '';
  }

  const lines: string[] = [];

  narrations.forEach((entry, index) => {
    // SRT format:
    // 1
    // 00:00:00,000 --> 00:00:03,000
    // Text here
    //
    lines.push(String(index + 1));
    lines.push(`${formatTimestamp(entry.startMs)} --> ${formatTimestamp(entry.endMs)}`);
    lines.push(entry.text);
    lines.push(''); // Empty line between entries
  });

  return lines.join('\n');
}

/**
 * Format milliseconds to SRT timestamp format: HH:MM:SS,mmm
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

/**
 * Pad number with leading zeros
 */
function pad(num: number, length: number): string {
  return String(num).padStart(length, '0');
}

/**
 * Build narration timeline from executed steps
 * Estimates timing based on step type (3s default per narration)
 */
export function buildNarrationTimeline(steps: Array<{ type: string; narrate?: string }>, startTimeMs = 0): NarrationEntry[] {
  const narrations: NarrationEntry[] = [];
  let currentTimeMs = startTimeMs;

  // Default duration per narration (3 seconds)
  const DEFAULT_DURATION_MS = 3000;

  for (const step of steps) {
    if (step.narrate && step.narrate.trim()) {
      const duration = estimateNarrationDuration(step.narrate, DEFAULT_DURATION_MS);

      narrations.push({
        text: step.narrate,
        startMs: currentTimeMs,
        endMs: currentTimeMs + duration
      });

      currentTimeMs += duration;
    } else {
      // For steps without narration, add a small time gap
      currentTimeMs += 500; // 500ms gap for non-narrated steps
    }
  }

  return narrations;
}

/**
 * Estimate narration duration based on text length
 * Longer text = longer duration (simple heuristic)
 */
function estimateNarrationDuration(text: string, baseDuration: number): number {
  // Very simple heuristic:
  // - Short text (< 30 chars): 2s
  // - Medium text (30-80 chars): 3s
  // - Long text (> 80 chars): 4s

  const length = text.length;

  if (length < 30) return 2000;
  if (length < 80) return baseDuration;
  return 4000;
}
