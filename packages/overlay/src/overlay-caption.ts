/**
 * Caption overlay functions.
 *
 * Renders positioned text banners (top / bottom / center) for narration
 * during flow playback.
 */

import { CaptionOptions } from './overlay-types';
import {
  ensureContainer,
  generateId,
  getActiveOverlays,
  setActiveOverlays,
} from './overlay-container';

/**
 * Show a caption banner.
 *
 * Returns the overlay ID for later removal.
 */
export function caption(text: string, options: CaptionOptions = {}): string {
  const container = ensureContainer();
  const id = generateId();
  const { placement = 'bottom', style = 'banner' } = options;

  const captionEl = document.createElement('div');
  captionEl.id = id;
  captionEl.className = `coderail-caption-${style} ${placement}`;
  captionEl.textContent = text;

  container.appendChild(captionEl);
  getActiveOverlays().push({ id, element: captionEl, type: 'caption' });

  return id;
}

/**
 * Clear all caption overlays (highlights are preserved).
 */
export function clearCaptions(): void {
  const overlays = getActiveOverlays();
  const captions = overlays.filter((o) => o.type === 'caption');
  captions.forEach((o) => {
    o.element.remove();
  });
  setActiveOverlays(overlays.filter((o) => o.type !== 'caption'));
}
