/**
 * Highlight overlay functions.
 *
 * Draws border boxes (static or pulsing) around DOM elements
 * identified by CSS selectors.
 */

import { HighlightOptions } from './overlay-types';
import {
  ensureContainer,
  generateId,
  getElementRect,
  getActiveOverlays,
  setActiveOverlays,
} from './overlay-container';

/**
 * Highlight an element on the page.
 *
 * Returns the overlay ID (for later removal) or `null` if the selector
 * did not match any element.
 */
export function highlight(selector: string, options: HighlightOptions = {}): string | null {
  const rect = getElementRect(selector);
  if (!rect) {
    console.warn(`[CodeRail] Element not found: ${selector}`);
    return null;
  }

  const container = ensureContainer();
  const id = generateId();
  const { style = 'box', color = '#3b82f6', label } = options;

  const highlightEl = document.createElement('div');
  highlightEl.id = id;
  highlightEl.className = style === 'pulse' ? 'coderail-highlight-pulse' : 'coderail-highlight-box';
  highlightEl.style.cssText = `
    left: ${rect.left - 4}px;
    top: ${rect.top - 4}px;
    width: ${rect.width + 8}px;
    height: ${rect.height + 8}px;
    border-color: ${color};
    ${style === 'pulse' ? `color: ${color};` : ''}
  `;

  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className = 'coderail-highlight-label';
    labelEl.textContent = label;
    labelEl.style.background = color;
    highlightEl.appendChild(labelEl);
  }

  container.appendChild(highlightEl);
  getActiveOverlays().push({ id, element: highlightEl, type: 'highlight' });

  return id;
}

/**
 * Update a highlight's position to track a (possibly scrolled) element.
 */
export function updateHighlightPosition(id: string, selector: string): boolean {
  const overlay = getActiveOverlays().find((o) => o.id === id && o.type === 'highlight');
  if (!overlay) return false;

  const rect = getElementRect(selector);
  if (!rect) return false;

  overlay.element.style.left = `${rect.left - 4}px`;
  overlay.element.style.top = `${rect.top - 4}px`;
  overlay.element.style.width = `${rect.width + 8}px`;
  overlay.element.style.height = `${rect.height + 8}px`;

  return true;
}

/**
 * Clear all highlight overlays (captions are preserved).
 */
export function clearHighlights(): void {
  const overlays = getActiveOverlays();
  const highlights = overlays.filter((o) => o.type === 'highlight');
  highlights.forEach((o) => {
    o.element.remove();
  });
  setActiveOverlays(overlays.filter((o) => o.type !== 'highlight'));
}
