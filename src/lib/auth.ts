// Scans read public data only; no repo access is needed (or asked for)
export const OAUTH_SCOPE = 'read:user';
export const OAUTH_STATE_COOKIE = 'gh_oauth_state';
export const OAUTH_TOKEN_COOKIE = 'gh_oauth_token';
export const OAUTH_LOGIN_COOKIE = 'gh_oauth_login';

export type TokenSource = 'none' | 'pat' | 'oauth';

export interface OAuthSession {
  authenticated: boolean;
  login: string | null;
  tokenSource: 'oauth' | null;
}

export const EMPTY_OAUTH_SESSION: OAuthSession = {
  authenticated: false,
  login: null,
  tokenSource: null,
};

export function getCookieOptions(url: URL) {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: url.protocol === 'https:',
  };
}

export function getBasePath(): string {
  return import.meta.env.BASE_URL || '/';
}

export function buildAppUrl(url: URL, path: string): URL {
  return new URL(path.replace(/^\/+/, ''), new URL(getBasePath(), url));
}
