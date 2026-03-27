// Element Mapper Overlay - highlighting and tooltip for element selection

import {
  injectMapperStyles,
  getElementInfo as getInfo,
  createTooltipElement,
} from './element-mapper-tooltip';

export interface ElementInfo {
  tagName: string;
  id: string;
  classes: string[];
  text: string;
  ariaLabel?: string;
  role?: string;
}

export interface OverlayOptions {
  onHover?: (element: HTMLElement) => void;
  onClick?: (element: HTMLElement) => void;
  highlightColor?: string;
}

export class ElementMapperOverlay {
  private active = false;
  private currentElement: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private options: OverlayOptions;

  constructor(options: OverlayOptions = {}) {
    this.options = { highlightColor: '#f59e0b', ...options };
  }

  private highlightElement(element: HTMLElement) {
    if (this.currentElement && this.currentElement !== element) {
      this.currentElement.classList.remove('coderail-element-highlight');
    }
    element.classList.add('coderail-element-highlight');
    this.currentElement = element;
  }

  private showTooltip(element: HTMLElement, x: number, y: number) {
    if (this.tooltip) this.tooltip.remove();
    const info = getInfo(element);
    this.tooltip = createTooltipElement(info, x, y);
    document.body.appendChild(this.tooltip);
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  private handleMouseOver = (e: MouseEvent) => {
    if (!this.active) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'HTML' || target.tagName === 'BODY') return;
    e.stopPropagation();
    this.highlightElement(target);
    this.showTooltip(target, e.clientX, e.clientY);
    if (this.options.onHover) this.options.onHover(target);
  };

  private handleMouseOut = (e: MouseEvent) => {
    if (!this.active) return;
    const target = e.target as HTMLElement;
    if (target !== this.currentElement) return;
    e.stopPropagation();
    this.hideTooltip();
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.active) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'HTML' || target.tagName === 'BODY') return;
    e.preventDefault();
    e.stopPropagation();
    this.hideTooltip();
    if (this.options.onClick) this.options.onClick(target);
  };

  start() {
    if (this.active) return;
    this.active = true;
    injectMapperStyles(this.options.highlightColor!);
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('click', this.handleClick, true);
    document.body.style.cursor = 'crosshair';
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    if (this.currentElement) {
      this.currentElement.classList.remove('coderail-element-highlight');
      this.currentElement = null;
    }
    this.hideTooltip();
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('click', this.handleClick, true);
    document.body.style.cursor = '';
  }

  isActive(): boolean {
    return this.active;
  }

  destroy() {
    this.stop();
    const styles = document.getElementById('coderail-mapper-styles');
    if (styles) styles.remove();
  }
}

export function createElementMapper(options?: OverlayOptions): ElementMapperOverlay {
  return new ElementMapperOverlay(options);
}
