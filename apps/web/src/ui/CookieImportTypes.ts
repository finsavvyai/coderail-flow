export interface ImportCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  expires?: string;
}

export interface CookieImportModalProps {
  projectId: string;
  onSave: (profile: { name: string; cookies: ImportCookie[] }) => Promise<void>;
  onCancel: () => void;
}

export interface CookieExpiryStatus {
  status: string;
  color: string;
}

export function getCookieExpiryStatus(cookie: ImportCookie): CookieExpiryStatus {
  if (!cookie.expires) return { status: 'session', color: 'text-gray-500' };

  const expiry = new Date(cookie.expires);
  const now = new Date();
  const daysUntilExpiry = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiry < 0) {
    return { status: 'Expired', color: 'text-red-600' };
  } else if (daysUntilExpiry < 7) {
    const s = daysUntilExpiry !== 1 ? 's' : '';
    return { status: `Expires in ${daysUntilExpiry} day${s}`, color: 'text-orange-600' };
  } else {
    return { status: `Expires in ${daysUntilExpiry} days`, color: 'text-green-600' };
  }
}

export function validateCookieArray(json: unknown): ImportCookie[] {
  if (!Array.isArray(json)) {
    throw new Error('Invalid format: Expected an array of cookies');
  }

  for (const cookie of json) {
    if (!cookie.name || typeof cookie.name !== 'string') {
      throw new Error('Invalid cookie: missing or invalid "name" field');
    }
    if (typeof cookie.value !== 'string') {
      throw new Error('Invalid cookie: missing or invalid "value" field');
    }
  }

  return json as ImportCookie[];
}
