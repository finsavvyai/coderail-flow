import { RECENT_URLS_KEY, FAVORITE_URLS_KEY, MAX_RECENT } from './FlowRecorder.types';
import { getRecorderRuntimeConfig } from './recorder-runtime';
export function getRecentUrls() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_URLS_KEY) || '[]');
    }
    catch {
        return [];
    }
}
export function addRecentUrl(url) {
    const urls = getRecentUrls().filter((u) => u !== url);
    urls.unshift(url);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(urls.slice(0, MAX_RECENT)));
}
export function getFavoriteUrls() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITE_URLS_KEY) || '[]');
    }
    catch {
        return [];
    }
}
export function toggleFavoriteUrl(url) {
    const favs = getFavoriteUrls();
    const idx = favs.indexOf(url);
    if (idx >= 0)
        favs.splice(idx, 1);
    else
        favs.push(url);
    localStorage.setItem(FAVORITE_URLS_KEY, JSON.stringify(favs));
    return favs;
}
export function removeFavoriteUrl(url) {
    const favs = getFavoriteUrls().filter((u) => u !== url);
    localStorage.setItem(FAVORITE_URLS_KEY, JSON.stringify(favs));
    return favs;
}
export function removeRecentUrl(url) {
    const urls = getRecentUrls().filter((u) => u !== url);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(urls));
    return urls;
}
export function getProxyUrl(targetUrl, apiBase = getRecorderRuntimeConfig(import.meta.env).apiBase) {
    if (!apiBase)
        return null;
    try {
        const parsed = new URL(targetUrl);
        const b64 = btoa(parsed.origin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return `${apiBase}/proxy/${b64}${parsed.pathname}${parsed.search}`;
    }
    catch {
        return null;
    }
}
export function mergeRecordedActions(existingActions, incomingActions) {
    if (incomingActions.length === 0)
        return existingActions;
    const seen = new Set(existingActions.map((action) => action.id));
    const merged = [...existingActions];
    for (const action of incomingActions) {
        if (seen.has(action.id))
            continue;
        seen.add(action.id);
        merged.push(action);
    }
    return merged;
}
export function convertToFlowSteps(actions) {
    return actions.map((action) => {
        const base = {};
        if (action.subtitle)
            base.narrate = action.subtitle;
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
export function getActionDescription(action) {
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
