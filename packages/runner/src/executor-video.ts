/**
 * Video frame utilities for flow execution.
 *
 * Handles screenshot-to-bytes conversion and video frame compilation.
 */

export function screenshotToBytes(screenshot: string | Buffer): Uint8Array {
  if (typeof screenshot === 'string') {
    return new Uint8Array(Buffer.from(screenshot, 'base64'));
  }
  return new Uint8Array(screenshot);
}

export async function captureOptimizedScreenshot(cdpSession: any): Promise<Uint8Array> {
  const shot = await cdpSession.send('Page.captureScreenshot', {
    format: 'webp',
    quality: 70,
  });
  return screenshotToBytes(shot.data);
}

/**
 * Compile video frames into a simple animated format.
 * Returns JPEG frames concatenated with metadata for playback.
 * (Full WebM encoding would require ffmpeg which isn't available in Workers)
 */
export async function compileVideoFromFrames(
  frames: Array<{ data: string; timestamp: number }>
): Promise<Uint8Array> {
  const frameBuffers: Uint8Array[] = [];

  for (const frame of frames) {
    const binaryString = atob(frame.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    frameBuffers.push(bytes);
  }

  let totalSize = 4;
  for (const fb of frameBuffers) {
    totalSize += 4 + fb.length;
  }

  const result = new Uint8Array(totalSize);
  const view = new DataView(result.buffer);

  view.setUint32(0, frameBuffers.length, true);

  let offset = 4;
  for (const fb of frameBuffers) {
    view.setUint32(offset, fb.length, true);
    offset += 4;
    result.set(fb, offset);
    offset += fb.length;
  }

  return result;
}
