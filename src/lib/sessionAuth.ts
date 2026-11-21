import { accessTokenStale, clearTokens, getAccessToken, getRefreshToken, isLoggedIn } from './authStore.ts';
import { refreshSession } from './checkApi.ts';
import { saveAuthNext } from './authRedirect.ts';

/** True when a usable JWT session exists (refreshes a near-expired access token when possible). */
export async function ensureAuthSession(): Promise<boolean> {
  if (!isLoggedIn()) return false;
  if (getAccessToken() && !accessTokenStale()) return true;
  if (!getRefreshToken()) {
    clearTokens();
    return false;
  }
  const ok = await refreshSession();
  if (!ok) clearTokens();
  return ok;
}

/** Saves return path and builds the /auth URL. */
export function authPathFor(next: string): string {
  saveAuthNext(next);
  return `/auth?next=${encodeURIComponent(next)}`;
}
