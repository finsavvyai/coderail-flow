import { getWebRuntimeConfig } from './runtime-config';
const runtimeConfig = getWebRuntimeConfig(import.meta.env);
const rawApiBase = runtimeConfig.apiBase;
export const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;
export function apiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${normalizedPath}`;
}
export function apiAbsoluteUrl(path) {
    return new URL(apiUrl(path), window.location.origin).toString();
}
// ---- Token provider ----
// Set by authenticated app routes once the Auth.js session has been established.
let _getToken = null;
export function setTokenProvider(fn) {
    _getToken = fn;
}
export async function getApiToken() {
    return _getToken ? _getToken() : null;
}
export async function authHeaders() {
    const headers = { 'content-type': 'application/json' };
    if (_getToken) {
        const token = await _getToken();
        if (token)
            headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
// Generic API request helper
export async function apiRequest(path, options = {}) {
    const headers = await authHeaders();
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? window.setTimeout(() => controller.abort(), 15_000) : undefined;
    try {
        const res = await fetch(apiUrl(path), {
            ...options,
            headers: { ...headers, ...options.headers },
            signal: options.signal ?? controller?.signal,
        });
        if (!res.ok) {
            let error = res.statusText;
            try {
                const body = await res.json();
                error = body?.message || body?.error || error;
            }
            catch {
                const text = await res.text();
                error = text || error;
            }
            throw new Error(error || `Request failed (${res.status})`);
        }
        if (res.status === 204)
            return null;
        const contentType = res.headers.get('content-type') || '';
        return contentType.includes('application/json') ? res.json() : res.text();
    }
    catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.', { cause: error });
        }
        throw error;
    }
    finally {
        if (timeoutId)
            window.clearTimeout(timeoutId);
    }
}
