// Cookie validation, expiry checking, and display formatting utilities

/** Validate cookie format - checks if uploaded JSON has valid cookie structure */
export function validateCookieFormat(cookies: any): cookies is Array<{
  name: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}> {
  if (!Array.isArray(cookies)) return false;
  for (const cookie of cookies) {
    if (!cookie || typeof cookie !== 'object') return false;
    if (typeof cookie.name !== 'string' || !cookie.name) return false;
    if (typeof cookie.value !== 'string') return false;
  }
  return true;
}

/** Check if any cookies are expired */
export function areCookiesExpired(cookies: Array<{ expires?: string }>): boolean {
  if (!cookies || cookies.length === 0) return false;
  const now = new Date();
  for (const cookie of cookies) {
    if (cookie.expires) {
      if (new Date(cookie.expires) < now) return true;
    }
  }
  return false;
}

/** Get earliest cookie expiry date */
export function getCookiesExpiry(cookies: Array<{ expires?: string }>): Date | null {
  if (!cookies || cookies.length === 0) return null;
  let earliest: Date | null = null;
  for (const cookie of cookies) {
    if (cookie.expires) {
      const expiryDate = new Date(cookie.expires);
      if (!earliest || expiryDate < earliest) earliest = expiryDate;
    }
  }
  return earliest;
}

/** Mask sensitive cookie values for display */
export function maskCookieValue(value: string, visibleChars: number = 4): string {
  if (value.length <= visibleChars) return '*'.repeat(value.length);
  return value.slice(0, visibleChars) + '*'.repeat(value.length - visibleChars);
}

/** Format cookies for display (with masked values) */
export function formatCookiesForDisplay(
  cookies: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>
): Array<{
  name: string;
  value: string;
  domain?: string;
  path?: string;
}> {
  return cookies.map((cookie) => ({
    ...cookie,
    value: maskCookieValue(cookie.value),
  }));
}
