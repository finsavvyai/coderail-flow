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

export type HighlightStyle = 'box' | 'pulse' | 'arrow';

export interface HighlightOptions {
  style?: HighlightStyle;
  color?: string;
  duration?: number;
  label?: string;
}

export interface CaptionOptions {
  placement?: 'top' | 'bottom' | 'center';
  duration?: number;
  style?: 'banner' | 'toast';
}

interface OverlayElement {
  id: string;
  element: HTMLElement;
  type: 'highlight' | 'caption';
}

const OVERLAY_CONTAINER_ID = 'coderail-overlay-container';
const Z_INDEX = 2147483647;

let overlayContainer: HTMLElement | null = null;
let activeOverlays: OverlayElement[] = [];

function ensureContainer(): HTMLElement {
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
  
  // Inject styles
  const styleId = 'coderail-overlay-styles';
  if (!document.getElementById(styleId)) {
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
      .coderail-caption-banner.center { top: 50%; transform: translate(-50%, -50%); }
    `;
    document.head.appendChild(style);
  }
  
  return overlayContainer;
}

function generateId(): string {
  return `coderail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getElementRect(selector: string): DOMRect | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  return element.getBoundingClientRect();
}

/**
 * Highlight an element on the page
 */
export function highlight(
  selector: string,
  options: HighlightOptions = {}
): string | null {
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
  activeOverlays.push({ id, element: highlightEl, type: 'highlight' });
  
  return id;
}

/**
 * Show a caption banner
 */
export function caption(
  text: string,
  options: CaptionOptions = {}
): string {
  const container = ensureContainer();
  const id = generateId();
  const { placement = 'bottom', style = 'banner' } = options;
  
  const captionEl = document.createElement('div');
  captionEl.id = id;
  captionEl.className = `coderail-caption-${style} ${placement}`;
  captionEl.textContent = text;
  
  container.appendChild(captionEl);
  activeOverlays.push({ id, element: captionEl, type: 'caption' });
  
  return id;
}

/**
 * Remove a specific overlay by ID
 */
export function remove(id: string): boolean {
  const index = activeOverlays.findIndex(o => o.id === id);
  if (index === -1) return false;
  
  const overlay = activeOverlays[index];
  overlay.element.remove();
  activeOverlays.splice(index, 1);
  return true;
}

/**
 * Clear all overlays
 */
export function clear(): void {
  activeOverlays.forEach(o => o.element.remove());
  activeOverlays = [];
}

/**
 * Clear only highlights (keep captions)
 */
export function clearHighlights(): void {
  const highlights = activeOverlays.filter(o => o.type === 'highlight');
  highlights.forEach(o => {
    o.element.remove();
    const index = activeOverlays.indexOf(o);
    if (index > -1) activeOverlays.splice(index, 1);
  });
}

/**
 * Clear only captions (keep highlights)
 */
export function clearCaptions(): void {
  const captions = activeOverlays.filter(o => o.type === 'caption');
  captions.forEach(o => {
    o.element.remove();
    const index = activeOverlays.indexOf(o);
    if (index > -1) activeOverlays.splice(index, 1);
  });
}

/**
 * Update highlight position (for scrolling/resizing)
 */
export function updateHighlightPosition(id: string, selector: string): boolean {
  const overlay = activeOverlays.find(o => o.id === id && o.type === 'highlight');
  if (!overlay) return false;
  
  const rect = getElementRect(selector);
  if (!rect) return false;
  
  overlay.element.style.left = `${rect.left - 4}px`;
  overlay.element.style.top = `${rect.top - 4}px`;
  overlay.element.style.width = `${rect.width + 8}px`;
  overlay.element.style.height = `${rect.height + 8}px`;
  
  return true;
}

// Expose globally for injection
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
