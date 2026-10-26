// Session tokens for a signed-in Yakku user (issued by POST /api/v1/auth/verify).
// Visitors who never sign in keep using the guest token managed in pollApi.ts.

const ACCESS_KEY = 'yakku_access_token';
const REFRESH_KEY = 'yakku_refresh_token';
const ACCESS_EXPIRES_KEY = 'yakku_access_expires_at';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

let memoryAccess: string | null = null;

export function saveTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(ACCESS_EXPIRES_KEY, String(Date.now() + tokens.accessTokenExpiresInSeconds * 1000));
  } catch {
    /* storage unavailable: the session lasts only for this page view */
    memoryAccess = tokens.accessToken;
  }
}

export function getAccessToken(): string | null {
  return read(ACCESS_KEY) ?? memoryAccess;
}

export function getRefreshToken(): string | null {
  return read(REFRESH_KEY);
}

/** True when the stored access token is missing or about to expire (so a refresh is worth trying). */
export function accessTokenStale(): boolean {
  const expires = Number(read(ACCESS_EXPIRES_KEY));
  return !expires || expires - 30_000 <= Date.now();
}

export function isLoggedIn(): boolean {
  return !!getAccessToken() || !!getRefreshToken();
}

export function clearTokens(): void {
  memoryAccess = null;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_KEY);
  } catch {
    /* storage unavailable */
  }
}
