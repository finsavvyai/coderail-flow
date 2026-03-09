export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---- Token provider ----
// Set by the app root once Clerk is initialized via setTokenProvider()
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>) {
  _getToken = fn;
}

export async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (_getToken) {
    const token = await _getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Generic API request helper
export async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  return res.json();
}
