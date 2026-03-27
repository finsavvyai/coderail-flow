/**
 * Base64 encoding/decoding helpers for proxy URL scheme.
 *
 * Uses URL-safe base64 (RFC 4648 §5): + → -, / → _, padding stripped.
 */

export function b64Encode(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64Decode(s: string): string {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return atob(b);
}
