// Client for the weekly checks, phone-OTP sign-in and "make a check" endpoints.
//
//   GET  /api/v1/checks          this week's checks (anonymous; `used` is per caller)
//   POST /api/v1/auth/send       send a WhatsApp/SMS code
//   POST /api/v1/auth/verify     verify the code and receive tokens
//   POST /api/v1/auth/refresh    exchange the refresh token
//   POST /api/v1/checks/make     make a check from a weekly one (needs sign-in)

import { apiBase, ensureGuestToken, guestHeaders } from './pollApi.ts';
import {
  accessTokenStale,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  type AuthTokens,
} from './authStore.ts';

export interface WeeklyCheck {
  id: string;
  title: string;
  question: string;
  backgroundColor: string;
  sticker: string;
  options: { id: string; text: string }[];
  used: boolean;
}

export interface MadeCheck {
  shareCode: string;
  question: string;
  title: string;
  backgroundColor: string;
  minVotes: number;
  optionTexts: string[];
}

export const DEFAULT_MIN_VOTES = 5;

type Envelope = { success?: unknown; message?: unknown; data?: unknown };

async function readEnvelope(res: Response): Promise<Envelope | null> {
  try {
    return (await res.json()) as Envelope;
  } catch {
    return null;
  }
}

function message(body: Envelope | null, fallback: string): string {
  return body && typeof body.message === 'string' && body.message ? body.message : fallback;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

// ---------------------------------------------------------------- weekly checks

export function parseWeeklyChecks(body: unknown): WeeklyCheck[] | null {
  const env = body as Envelope | null;
  if (!env || env.success !== true || !Array.isArray(env.data)) return null;
  const out: WeeklyCheck[] = [];
  for (const raw of env.data) {
    const c = raw as Record<string, unknown> | null;
    if (!c || typeof c.id !== 'string' || !Array.isArray(c.options)) continue;
    const options = c.options
      .map((o) => o as Record<string, unknown> | null)
      .filter((o): o is Record<string, unknown> => !!o && typeof o.id === 'string' && typeof o.text === 'string')
      .map((o) => ({ id: o.id as string, text: (o.text as string).trim() }))
      .filter((o) => o.text !== '');
    if (options.length === 0) continue;
    out.push({
      id: c.id,
      title: str(c.title),
      question: str(c.question),
      backgroundColor: str(c.backgroundColor),
      sticker: str(c.sticker),
      options,
      used: c.used === true,
    });
  }
  return out;
}

export async function fetchWeeklyChecks(signal?: AbortSignal): Promise<WeeklyCheck[] | null> {
  try {
    await refreshIfStale();
    const guest = await ensureGuestToken();
    const res = await fetch(`${apiBase()}/api/v1/checks`, {
      headers: guestHeaders(guest),
      credentials: 'include',
      signal,
    });
    if (!res.ok) return null;
    return parseWeeklyChecks(await res.json());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- sign-in

export type AuthResult = { ok: true } | { ok: false; kind: 'invalid' | 'not-found' | 'too-many' | 'error'; message: string };

export async function sendOtp(phoneNumber: string, name: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/auth/send`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phoneNumber, name }),
    });
    if (res.ok) return { ok: true };
    const body = await readEnvelope(res);
    if (res.status === 429) return { ok: false, kind: 'too-many', message: message(body, 'Too many attempts. Please wait and try again.') };
    return { ok: false, kind: res.status === 400 ? 'invalid' : 'error', message: message(body, "Couldn't send the code. Please try again.") };
  } catch {
    return { ok: false, kind: 'error', message: "Couldn't reach Yakku. Check your connection and try again." };
  }
}

export async function verifyOtp(phoneNumber: string, otp: string): Promise<AuthResult> {
  try {
    // The guest token lets the backend move this visitor's guest data to the new account.
    const guest = await ensureGuestToken();
    const res = await fetch(`${apiBase()}/api/v1/auth/verify`, {
      method: 'POST',
      headers: guestHeaders(guest, { 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ phoneNumber, otp }),
    });
    const body = await readEnvelope(res);
    if (!res.ok) {
      if (res.status === 429) return { ok: false, kind: 'too-many', message: message(body, 'Too many attempts.') };
      if (res.status === 404) return { ok: false, kind: 'not-found', message: message(body, 'Code not found. Ask for a new one.') };
      if (res.status === 400 || res.status === 401) return { ok: false, kind: 'invalid', message: message(body, 'That code is not right.') };
      return { ok: false, kind: 'error', message: message(body, 'Verification failed. Please try again.') };
    }
    const auth = (body?.data as { auth?: Partial<AuthTokens> } | undefined)?.auth;
    if (!auth || typeof auth.accessToken !== 'string' || typeof auth.refreshToken !== 'string') {
      return { ok: false, kind: 'error', message: 'Verification failed. Please try again.' };
    }
    saveTokens({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      accessTokenExpiresInSeconds: Number(auth.accessTokenExpiresInSeconds) || 900,
    });
    return { ok: true };
  } catch {
    return { ok: false, kind: 'error', message: "Couldn't reach Yakku. Check your connection and try again." };
  }
}

let refreshing: Promise<boolean> | null = null;

/** Exchanges the refresh token for new tokens. Clears the session when the refresh token is rejected. */
export function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(false);
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${apiBase()}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        if (res.status === 400 || res.status === 401) clearTokens();
        return false;
      }
      const data = ((await readEnvelope(res))?.data ?? {}) as Partial<AuthTokens>;
      if (typeof data.accessToken !== 'string' || typeof data.refreshToken !== 'string') return false;
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresInSeconds: Number(data.accessTokenExpiresInSeconds) || 900,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function refreshIfStale(): Promise<void> {
  if (getRefreshToken() && (!getAccessToken() || accessTokenStale())) await refreshSession();
}

// ---------------------------------------------------------------- make a check

export type MakeResult =
  | { ok: true; check: MadeCheck }
  | { ok: false; kind: 'auth-required' | 'used' | 'unavailable' | 'error'; message: string };

export async function makeCheck(checkId: string, checkOptionId: string): Promise<MakeResult> {
  const call = () =>
    fetch(`${apiBase()}/api/v1/checks/make`, {
      method: 'POST',
      headers: guestHeaders(null, { 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ checkId, checkOptionId }),
    });
  try {
    await refreshIfStale();
    if (!getAccessToken()) return { ok: false, kind: 'auth-required', message: 'Please sign in first.' };
    let res = await call();
    if (res.status === 401 && (await refreshSession())) res = await call();
    const body = await readEnvelope(res);
    if (res.status === 401) return { ok: false, kind: 'auth-required', message: 'Please sign in again.' };
    if (res.status === 409) return { ok: false, kind: 'used', message: message(body, "You've already made this check.") };
    if (res.status === 404) return { ok: false, kind: 'unavailable', message: message(body, 'This check is no longer live.') };
    if (!res.ok) return { ok: false, kind: 'error', message: message(body, "Couldn't send your check. Please try again.") };
    const d = (body?.data ?? {}) as Record<string, unknown>;
    if (typeof d.shareCode !== 'string' || !d.shareCode) {
      return { ok: false, kind: 'error', message: "Couldn't send your check. Please try again." };
    }
    const options = Array.isArray(d.options) ? (d.options as Record<string, unknown>[]) : [];
    return {
      ok: true,
      check: {
        shareCode: d.shareCode,
        question: str(d.question),
        title: str(d.title),
        backgroundColor: str(d.backgroundColor),
        minVotes: Number(d.minVotes) > 0 ? Number(d.minVotes) : DEFAULT_MIN_VOTES,
        optionTexts: options.map((o) => str(o.text)).filter(Boolean),
      },
    };
  } catch {
    return { ok: false, kind: 'error', message: "Couldn't reach Yakku. Check your connection and try again." };
  }
}

// ---------------------------------------------------------------- pending "ask my friends" hand-off

// Survives the login → OTP hops and page refreshes, like the app's `onLoggedIn` callback.
export interface PendingCheck {
  check: WeeklyCheck;
  optionId: string;
  name?: string;
  phone?: string;
}

const PENDING_KEY = 'yakku_pending_check';
let pendingMemory: PendingCheck | null = null;

export function savePending(p: PendingCheck): void {
  pendingMemory = p;
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    /* kept in memory only */
  }
}

export function loadPending(): PendingCheck | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw) as PendingCheck;
  } catch {
    /* fall through */
  }
  return pendingMemory;
}

export function clearPending(): void {
  pendingMemory = null;
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* nothing stored */
  }
}

/** Keeps the made check for the "Your card is live" page (also reachable by refresh). */
const MADE_KEY = 'yakku_made_check';

export function saveMade(check: MadeCheck): void {
  try {
    sessionStorage.setItem(MADE_KEY, JSON.stringify(check));
  } catch {
    /* page falls back to the share code alone */
  }
}

export function loadMade(shareCode: string): MadeCheck | null {
  try {
    const raw = sessionStorage.getItem(MADE_KEY);
    if (!raw) return null;
    const made = JSON.parse(raw) as MadeCheck;
    return made.shareCode === shareCode ? made : null;
  } catch {
    return null;
  }
}
