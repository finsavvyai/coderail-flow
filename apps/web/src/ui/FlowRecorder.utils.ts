import { RECENT_URLS_KEY, FAVORITE_URLS_KEY, MAX_RECENT, API_BASE } from './FlowRecorder.types';
import type { RecordedAction, FlowStep } from './FlowRecorder.types';

export function getRecentUrls(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_URLS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addRecentUrl(url: string): void {
  const urls = getRecentUrls().filter((u) => u !== url);
  urls.unshift(url);
  localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(urls.slice(0, MAX_RECENT)));
}

export function getFavoriteUrls(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_URLS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavoriteUrl(url: string): string[] {
  const favs = getFavoriteUrls();
  const idx = favs.indexOf(url);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(url);
  localStorage.setItem(FAVORITE_URLS_KEY, JSON.stringify(favs));
  return favs;
}

export function removeFavoriteUrl(url: string): string[] {
  const favs = getFavoriteUrls().filter((u) => u !== url);
  localStorage.setItem(FAVORITE_URLS_KEY, JSON.stringify(favs));
  return favs;
}

export function removeRecentUrl(url: string): string[] {
  const urls = getRecentUrls().filter((u) => u !== url);
  localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(urls));
  return urls;
}

export function getProxyUrl(targetUrl: string): string {
  try {
    const parsed = new URL(targetUrl);
    const b64 = btoa(parsed.origin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${API_BASE}/proxy/${b64}${parsed.pathname}${parsed.search}`;
  } catch {
    return targetUrl;
  }
}

export function convertToFlowSteps(actions: RecordedAction[]): FlowStep[] {
  return actions.map((action) => {
    const base: Record<string, any> = {};
    if (action.subtitle) base.narrate = action.subtitle;
    switch (action.type) {
      case 'goto':
        return { ...base, type: 'goto', url: action.url };
      case 'click':
        return {
          ...base,
          type: 'click',
          elementId: `el-${action.selector?.replace(/[^a-zA-Z0-9]/g, '-')}`,
          _selector: action.selector,
        };
      case 'fill':
        return {
          ...base,
          type: 'fill',
          elementId: `el-${action.selector?.replace(/[^a-zA-Z0-9]/g, '-')}`,
          value: action.value || '',
          _selector: action.selector,
        };
      case 'select':
        return {
          ...base,
          type: 'select',
          elementId: `el-${action.selector?.replace(/[^a-zA-Z0-9]/g, '-')}`,
          value: action.value || '',
          _selector: action.selector,
        };
      default:
        return { ...base, type: 'pause', ms: 1000 };
    }
  });
}

export function getActionDescription(action: RecordedAction): string {
  switch (action.type) {
    case 'goto':
      return `Navigate to ${action.url}`;
    case 'click':
      return `Click ${action.text?.slice(0, 30) || action.selector || 'element'}`;
    case 'fill': {
      const val = action.value?.slice(0, 20) || '';
      const ellipsis = (action.value?.length || 0) > 20 ? '...' : '';
      return `Fill "${val}${ellipsis}" into ${action.placeholder || action.selector}`;
    }
    case 'select':
      return `Select "${action.value}" from ${action.selector}`;
    default:
      return action.type;
  }
}
