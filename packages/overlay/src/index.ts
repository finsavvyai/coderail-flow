/**
 * CodeRail Flow Overlay Library
 *
 * Injected into the browser during flow execution to render:
 * - Highlight boxes around elements
 * - Caption banners for narration
 * - Pulse animations for attention
 *
 * Constraints:
 * - pointer-events: none (no interaction interference)
 * - very high z-index
 * - no layout shifts
 */

// Re-export types
export type { HighlightStyle, HighlightOptions, CaptionOptions } from './overlay-types';

// Re-export highlight functions
export { highlight, updateHighlightPosition, clearHighlights } from './overlay-highlight';

// Re-export caption functions
export { caption, clearCaptions } from './overlay-caption';

// Re-export container utilities (for advanced usage)
export { getActiveOverlays } from './overlay-container';

// Re-export element mapper (NEW)
export { ElementMapperOverlay, createElementMapper } from './element-mapper';
export type { ElementInfo, OverlayOptions } from './element-mapper';

// Re-export locator utilities (NEW)
export {
  extractLocators,
  testLocator,
  getElementInfo,
  type Locator,
  type LocatorStrategy,
  type ElementLocatorResult,
} from './locator-extractor';

import { highlight, updateHighlightPosition, clearHighlights } from './overlay-highlight';
import { caption, clearCaptions } from './overlay-caption';
import { getActiveOverlays, setActiveOverlays } from './overlay-container';

/**
 * Remove a specific overlay by ID.
 */
export function remove(id: string): boolean {
  const overlays = getActiveOverlays();
  const index = overlays.findIndex((o) => o.id === id);
  if (index === -1) return false;

  const overlay = overlays[index];
  overlay.element.remove();
  overlays.splice(index, 1);
  return true;
}

/**
 * Clear all overlays (highlights and captions).
 */
export function clear(): void {
  getActiveOverlays().forEach((o) => o.element.remove());
  setActiveOverlays([]);
}

// ---------------------------------------------------------------------------
// Expose globally for browser injection
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    coderail: {
      highlight: typeof highlight;
      caption: typeof caption;
      remove: typeof remove;
      clear: typeof clear;
      clearHighlights: typeof clearHighlights;
      clearCaptions: typeof clearCaptions;
      updateHighlightPosition: typeof updateHighlightPosition;
    };
  }
}

if (typeof window !== 'undefined') {
  window.coderail = {
    highlight,
    caption,
    remove,
    clear,
    clearHighlights,
    clearCaptions,
    updateHighlightPosition,
  };
}

export default {
  highlight,
  caption,
  remove,
  clear,
  clearHighlights,
  clearCaptions,
  updateHighlightPosition,
};
