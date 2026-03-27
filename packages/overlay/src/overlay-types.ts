/**
 * Types, interfaces, and constants for the CodeRail overlay system.
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

export interface OverlayElement {
  id: string;
  element: HTMLElement;
  type: 'highlight' | 'caption';
}

export const OVERLAY_CONTAINER_ID = 'coderail-overlay-container';
export const Z_INDEX = 2147483647;
