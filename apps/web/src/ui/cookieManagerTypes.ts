export interface CookieEntry {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  expires?: number;
}

export interface AuthProfile {
  id: string;
  name: string;
  projectId: string;
  cookies: CookieEntry[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
