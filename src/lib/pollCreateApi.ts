// Signed-in poll create for the web "Create your own" flow.
// POST /api/v1/polls then POST /api/v1/votes (JWT) for the owner's guess — same as the app.

import { getAccessToken, accessTokenStale, getRefreshToken } from './authStore.ts';
import { DEFAULT_CARD_THEME } from './defaultCardTheme.ts';
import { apiBase, guestHeaders } from './pollApi.ts';
import { refreshSession } from './checkApi.ts';

export const QUESTION_MAX = 200;
export const OPTION_MAX = 120;
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 3;

export interface CreatedPoll {
  id: string;
  shareCode: string;
  question: string;
  optionTexts: string[];
  backgroundColor: string;
  minVotes: number;
}

export type CreatePollResult =
  | { ok: true; poll: CreatedPoll }
  | { ok: false; kind: 'auth-required' | 'invalid' | 'error'; message: string };

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

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

async function refreshIfStale(): Promise<void> {
  if (getRefreshToken() && (!getAccessToken() || accessTokenStale())) await refreshSession();
}

async function authFetch(path: string, init: RequestInit): Promise<Response> {
  await refreshIfStale();
  if (!getAccessToken()) throw new Error('auth-required');
  const call = () =>
    fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        ...guestHeaders(null, { 'Content-Type': 'application/json' }),
        ...(init.headers as Record<string, string> | undefined),
      },
      credentials: 'include',
    });
  let res = await call();
  if (res.status === 401 && (await refreshSession())) res = await call();
  return res;
}

/**
 * Creates a text poll and casts the owner's guess (JWT), matching the app's createTextPoll.
 */
export async function createTextPoll(input: {
  question: string;
  options: string[];
  selectedOptionIndex: number;
}): Promise<CreatePollResult> {
  const question = input.question.trim();
  const options = input.options.map((o) => o.trim()).filter(Boolean);
  if (!question) return { ok: false, kind: 'invalid', message: 'Add a question first.' };
  if (question.length > QUESTION_MAX) {
    return { ok: false, kind: 'invalid', message: `Question must be at most ${QUESTION_MAX} characters.` };
  }
  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    return { ok: false, kind: 'invalid', message: `Add ${MIN_OPTIONS}–${MAX_OPTIONS} options.` };
  }
  if (options.some((o) => o.length > OPTION_MAX)) {
    return { ok: false, kind: 'invalid', message: `Each option must be at most ${OPTION_MAX} characters.` };
  }
  if (input.selectedOptionIndex < 0 || input.selectedOptionIndex >= options.length) {
    return { ok: false, kind: 'invalid', message: 'Pick your guess first.' };
  }

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const createRes = await authFetch('/api/v1/polls', {
      method: 'POST',
      body: JSON.stringify({
        question,
        contentType: 'question',
        expiresAt,
        options: options.map((text, i) => ({ text, displayOrder: i + 1 })),
      }),
    });
    const createBody = await readEnvelope(createRes);
    if (createRes.status === 401) {
      return { ok: false, kind: 'auth-required', message: 'Please sign in first.' };
    }
    if (!createRes.ok) {
      return {
        ok: false,
        kind: createRes.status === 400 ? 'invalid' : 'error',
        message: message(createBody, "Couldn't create your card. Please try again."),
      };
    }

    const d = (createBody?.data ?? {}) as Record<string, unknown>;
    const shareCode = str(d.shareCode);
    if (!shareCode) {
      return { ok: false, kind: 'error', message: "Couldn't create your card. Please try again." };
    }

    const rawOptions = Array.isArray(d.options) ? (d.options as Record<string, unknown>[]) : [];
    const sorted = [...rawOptions].sort(
      (a, b) => Number(a.displayOrder ?? a.sortOrder ?? 0) - Number(b.displayOrder ?? b.sortOrder ?? 0),
    );
    const optionTexts = sorted.map((o) => str(o.text)).filter(Boolean);
    const picked = sorted[input.selectedOptionIndex];
    const optionId = picked && typeof picked.id === 'string' ? picked.id : null;

    if (optionId) {
      const voteRes = await authFetch('/api/v1/votes', {
        method: 'POST',
        body: JSON.stringify({ shareCode, optionId }),
      });
      // Guess cast failure still leaves a shareable card; surface soft error only if create failed.
      if (voteRes.status === 401) {
        return { ok: false, kind: 'auth-required', message: 'Please sign in again.' };
      }
    }

    return {
      ok: true,
      poll: {
        id: str(d.id) || shareCode,
        shareCode,
        question: str(d.question) || question,
        optionTexts: optionTexts.length ? optionTexts : options,
        backgroundColor: DEFAULT_CARD_THEME.backgroundColor,
        minVotes: Number(d.minVotes) > 0 ? Number(d.minVotes) : 3,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.message === 'auth-required') {
      return { ok: false, kind: 'auth-required', message: 'Please sign in first.' };
    }
    return { ok: false, kind: 'error', message: "Couldn't reach Yakku. Check your connection and try again." };
  }
}
