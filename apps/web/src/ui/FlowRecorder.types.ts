export interface RecordedAction {
  id: string;
  type: 'click' | 'fill' | 'goto' | 'select' | 'scroll';
  timestamp: number;
  selector?: string;
  value?: string;
  url?: string;
  text?: string;
  tagName?: string;
  placeholder?: string;
  subtitle?: string;
}

export interface FlowStep {
  type: string;
  [key: string]: any;
}

export interface FlowRecorderProps {
  onSaveFlow: (steps: FlowStep[], name: string) => void;
  onCancel: () => void;
}

export type RecorderMode = 'iframe' | 'window';

export const RECENT_URLS_KEY = 'coderail_recent_urls';
export const FAVORITE_URLS_KEY = 'coderail_favorite_urls';
export const MAX_RECENT = 10;
export const API_BASE = import.meta.env.VITE_API_URL || '';

export const RECORDER_STYLES = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes subtitleFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
