/**
 * Helper functions for auth profile route handlers.
 */

import {
  decryptCookies,
  formatCookiesForDisplay,
  getCookiesExpiry,
  areCookiesExpired,
  type EncryptedData,
} from '../cookie-encryption';

export interface ProfileRow {
  id: string;
  project_id: string;
  name: string;
  cookies: string;
  created_at: string;
  updated_at: string;
}

/**
 * Format a list of encrypted profile rows into safe display objects.
 */
export async function formatProfilesForList(
  profiles: ProfileRow[],
  masterSecret: string
): Promise<FormattedProfile[]> {
  return Promise.all(
    profiles.map(async (profile) => {
      const encrypted = JSON.parse(profile.cookies) as EncryptedData;
      const cookies: any[] = await decryptCookies(encrypted, profile.project_id, masterSecret);
      return {
        id: profile.id,
        project_id: profile.project_id,
        name: profile.name,
        cookies_count: cookies.length,
        cookies_preview: formatCookiesForDisplay(cookies as any).slice(0, 5),
        expires_at: getCookiesExpiry(cookies as any)?.toISOString() || null,
        is_expired: areCookiesExpired(cookies as any),
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    })
  );
}

export interface FormattedProfile {
  id: string;
  project_id: string;
  name: string;
  cookies_count: number;
  cookies_preview: any[];
  expires_at: string | null;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Decrypt and format a single profile for detailed view.
 */
export async function formatProfileForDetail(
  profile: ProfileRow & { org_id: string },
  masterSecret: string
) {
  const cookies: any[] = await decryptCookies(
    JSON.parse(profile.cookies) as EncryptedData,
    profile.project_id,
    masterSecret
  );

  return {
    id: profile.id,
    project_id: profile.project_id,
    name: profile.name,
    cookies_count: cookies.length,
    cookies: formatCookiesForDisplay(cookies as any),
    expires_at: getCookiesExpiry(cookies as any)?.toISOString() || null,
    is_expired: areCookiesExpired(cookies as any),
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}
