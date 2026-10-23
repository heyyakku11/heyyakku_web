// Client for the existing ASP.NET Core poll API. Responses use the
// `{ success, message, data, errors }` envelope; the poll lives in `data`.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PollOptionDto {
  id: string;
  text: string | null;
  sortOrder: number;
  voteCount: number;
  percentage: number;
}

export interface PollDto {
  id: string;
  /** Opaque code carried by shared links (`/vote/{shareCode}`). */
  shareCode: string;
  question: string;
  status: string;
  visibility: string;
  expiresAt: string | null;
  /** While results are locked this is the vote progress, not the full total. */
  totalVoteCount: number;
  /** Votes from others needed before the backend reveals results. */
  minVotes: number;
  /** Votes from others so far (the creator's own vote isn't counted). */
  voteProgress: number;
  /** False below `minVotes`: option counts and percentages are then zeroed by the API. */
  resultsUnlocked: boolean;
  options: PollOptionDto[];
}

/** Used when an older API response omits `minVotes`. */
export const DEFAULT_MIN_VOTES = 5;

export type PollLoadResult =
  | { kind: 'ok'; poll: PollDto }
  | { kind: 'not-found' | 'error' };

export type VoteResult =
  | { kind: 'ok' }
  | { kind: 'auth-required' | 'conflict' | 'rate-limited' | 'error'; message?: string };

export type VotePhase = 'votable' | 'expired' | 'closed' | 'unavailable';

export function isUuid(value: string | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

// Matches the app's PollDeepLink: case-sensitive letters and digits, 6-64 long.
const SHARE_CODE_RE = /^[A-Za-z0-9]{6,64}$/;

export function isShareCode(value: string | undefined): value is string {
  return !!value && SHARE_CODE_RE.test(value);
}

/** A `/vote/:ref` segment is either a share code (app links) or a legacy poll UUID. */
export function isPollRef(value: string | undefined): value is string {
  return isUuid(value) || isShareCode(value);
}

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
}

/** UI-level hint only; the backend remains the authority on vote validity. */
export function getVotePhase(poll: PollDto, now: number = Date.now()): VotePhase {
  if (poll.visibility.toLowerCase() !== 'public') return 'unavailable';
  const status = poll.status.toLowerCase();
  if (status === 'closed') return 'closed';
  if (status === 'expired') return 'expired';
  if (status !== 'active') return 'unavailable';
  if (poll.expiresAt && new Date(poll.expiresAt).getTime() <= now) return 'expired';
  return 'votable';
}

export function parsePoll(body: unknown): PollDto | null {
  if (!body || typeof body !== 'object') return null;
  const env = body as { success?: unknown; data?: unknown };
  if (env.success !== true || !env.data || typeof env.data !== 'object') return null;
  const d = env.data as Record<string, unknown>;
  if (typeof d.id !== 'string' || typeof d.question !== 'string' || !Array.isArray(d.options)) {
    return null;
  }
  const options: PollOptionDto[] = [];
  for (const raw of d.options) {
    const o = raw as Record<string, unknown> | null;
    if (!o || typeof o.id !== 'string') return null;
    options.push({
      id: o.id,
      text: typeof o.text === 'string' ? o.text : null,
      sortOrder: Number(o.sortOrder ?? 0),
      voteCount: Number(o.voteCount ?? 0),
      percentage: Number(o.percentage ?? 0),
    });
  }
  options.sort((a, b) => a.sortOrder - b.sortOrder);
  const userOptions = options.filter((o) => o.text !== null && o.text.trim() !== '');
  return {
    id: d.id,
    shareCode: typeof d.shareCode === 'string' ? d.shareCode : '',
    question: d.question,
    status: String(d.status ?? ''),
    visibility: String(d.visibility ?? ''),
    expiresAt: typeof d.expiresAt === 'string' ? d.expiresAt : null,
    totalVoteCount: Number(d.totalVoteCount ?? 0),
    minVotes: Number(d.minVotes ?? DEFAULT_MIN_VOTES),
    voteProgress: Number(d.voteProgress ?? 0),
    resultsUnlocked: d.resultsUnlocked === true,
    options: userOptions,
  };
}

/** Loads a poll from a share code or a poll UUID, whichever the link carried. */
export async function fetchPoll(pollRef: string, signal?: AbortSignal): Promise<PollLoadResult> {
  const path = isUuid(pollRef)
    ? `/api/v1/polls/${pollRef}`
    : `/api/v1/polls/share/${encodeURIComponent(pollRef)}`;
  try {
    const res = await fetch(`${apiBase()}${path}`, {
      headers: { Accept: 'application/json' },
      signal,
    });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'error' };
    const poll = parsePoll(await res.json());
    return poll ? { kind: 'ok', poll } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export type VoteChoice = { optionId: string } | { customAnswer: string };

const GUEST_TOKEN_KEY = 'yakku_guest_token';

function readGuestToken(): string | null {
  try {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Returns a guest token for visitors without a Yakku account: the stored one, or a new guest identity
 * from POST /api/v1/guests. The API only returns the raw token when it creates a guest.
 */
async function ensureGuestToken(): Promise<string | null> {
  const existing = readGuestToken();
  if (existing) return existing;
  try {
    const res = await fetch(`${apiBase()}/api/v1/guests`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { guestToken?: unknown } };
    const token = body.data?.guestToken;
    if (typeof token !== 'string' || !token) return null;
    try {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    } catch {
      /* storage unavailable: the token still works for this page view */
    }
    return token;
  } catch {
    return null;
  }
}

// POST /api/v1/polls/{id}/votes  body: { pollOptionId } or { customAnswer }
// Visitors vote as guests (X-Guest-Token); the backend decides whether the vote is valid.
export async function submitVote(pollId: string, choice: VoteChoice, reason?: string): Promise<VoteResult> {
  try {
    const guestToken = await ensureGuestToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (guestToken) headers['X-Guest-Token'] = guestToken;
    const res = await fetch(`${apiBase()}/api/v1/polls/${pollId}/votes`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        ...('optionId' in choice ? { pollOptionId: choice.optionId } : { customAnswer: choice.customAnswer }),
        ...(reason?.trim() ? { reason: reason.trim() } : {}),
      }),
    });
    if (res.ok) return { kind: 'ok' };
    if (res.status === 401 || res.status === 403) return { kind: 'auth-required' };
    if (res.status === 429) return { kind: 'rate-limited' };
    let message: string | undefined;
    try {
      const body = (await res.json()) as { message?: unknown };
      if (typeof body.message === 'string') message = body.message;
    } catch {
      /* non-JSON error body */
    }
    return { kind: res.status === 409 ? 'conflict' : 'error', message };
  } catch {
    return { kind: 'error' };
  }
}
