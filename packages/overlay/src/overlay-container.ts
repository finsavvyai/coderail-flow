/**
 * Overlay container management.
 *
 * Creates and caches the fixed-position container element and injects
 * the CSS keyframes and class rules needed by highlights and captions.
 */

import { OVERLAY_CONTAINER_ID, Z_INDEX, OverlayElement } from './overlay-types';

let overlayContainer: HTMLElement | null = null;
let activeOverlays: OverlayElement[] = [];

/**
 * Return the mutable list of active overlays (shared state).
 */
export function getActiveOverlays(): OverlayElement[] {
  return activeOverlays;
}

/**
 * Replace the active overlays list (used by clear helpers).
 */
export function setActiveOverlays(next: OverlayElement[]): void {
  activeOverlays = next;
}

/**
 * Ensure the overlay container and its stylesheet exist in the DOM.
 */
export function ensureContainer(): HTMLElement {
  if (overlayContainer && document.body.contains(overlayContainer)) {
    return overlayContainer;
  }

  overlayContainer = document.createElement('div');
  overlayContainer.id = OVERLAY_CONTAINER_ID;
  overlayContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: ${Z_INDEX};
    overflow: hidden;
  `;
  document.body.appendChild(overlayContainer);

  injectStyles();

  return overlayContainer;
}

/**
 * Generate a unique overlay element ID.
 */
export function generateId(): string {
  return `coderail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Resolve a CSS selector to its bounding rectangle.
 */
export function getElementRect(selector: string): DOMRect | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  return element.getBoundingClientRect();
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function injectStyles(): void {
  const styleId = 'coderail-overlay-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes coderail-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
    @keyframes coderail-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes coderail-glow {
      0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
      50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
    }
    .coderail-highlight-box {
      position: absolute;
      border: 3px solid #3b82f6;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.1);
      animation: coderail-fade-in 0.3s ease-out;
      pointer-events: none;
    }
    .coderail-highlight-pulse {
      position: absolute;
      border: 3px solid #3b82f6;
      border-radius: 8px;
      background: rgba(59, 130, 246, 0.15);
      animation: coderail-pulse 1.5s ease-in-out infinite, coderail-glow 1.5s ease-in-out infinite;
      color: #3b82f6;
      pointer-events: none;
    }
    .coderail-highlight-label {
      position: absolute;
      top: -28px;
      left: 0;
      background: #3b82f6;
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      white-space: nowrap;
    }
    .coderail-caption-banner {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 18px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      max-width: 80%;
      text-align: center;
      animation: coderail-fade-in 0.3s ease-out;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .coderail-caption-banner.top { top: 40px; }
    .coderail-caption-banner.bottom { bottom: 40px; }
    .coderail-caption-banner.center {
      top: 50%;
      transform: translate(-50%, -50%);
    }
  `;
  document.head.appendChild(style);
}
