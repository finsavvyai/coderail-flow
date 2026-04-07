// Element mapper tooltip and style injection

import type { ElementInfo } from './element-mapper';

/** Inject mapper overlay styles into the document */
export function injectMapperStyles(highlightColor: string): void {
  if (document.getElementById('coderail-mapper-styles')) return;

  const style = document.createElement('style');
  style.id = 'coderail-mapper-styles';
  style.textContent = `
    .coderail-element-highlight {
      outline: 3px solid ${highlightColor} !important;
      outline-offset: 2px;
      cursor: crosshair !important;
      background-color: rgba(245, 158, 11, 0.1) !important;
    }

    .coderail-element-tooltip {
      position: fixed !important;
      background: #1f2937 !important;
      color: #fff !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-family: system-ui, -apple-system, sans-serif !important;
      z-index: 999999 !important;
      pointer-events: none !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
      max-width: 300px !important;
    }

    .coderail-element-tooltip strong {
      display: block !important;
      margin-bottom: 4px !important;
      color: ${highlightColor} !important;
    }

    .coderail-element-tooltip code {
      background: #374151 !important;
      padding: 2px 6px !important;
      border-radius: 3px !important;
      font-family: monospace !important;
      font-size: 11px !important;
      display: block !important;
      margin: 2px 0 !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
  `;
  document.head.appendChild(style);
}

/** Get element information for display */
export function getElementInfo(element: HTMLElement): ElementInfo {
  return {
    tagName: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: element.className
      ? typeof element.className === 'string'
        ? element.className.split(' ').filter((c) => c)
        : []
      : [],
    text: element.textContent?.slice(0, 50) || '',
    ariaLabel: element.getAttribute('aria-label') || undefined,
    role: element.getAttribute('role') || undefined,
  };
}

/** Escape HTML to prevent XSS */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Create tooltip element with element info */
export function createTooltipElement(info: ElementInfo, x: number, y: number): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.className = 'coderail-element-tooltip';
  tooltip.innerHTML = `
    <strong>${info.tagName}</strong>
    ${info.id ? `ID: <code>${escapeHtml(info.id)}</code>` : ''}
    ${info.classes.length > 0 ? `Class: <code>${escapeHtml(info.classes.slice(0, 3).join(' '))}</code>` : ''}
    ${info.text ? `Text: <code>${escapeHtml(info.text)}</code>` : ''}
  `;
  tooltip.style.left = `${x + 15}px`;
  tooltip.style.top = `${y + 15}px`;
  return tooltip;
}
