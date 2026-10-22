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
    options,
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

// POST /api/v1/polls/{id}/votes  body: { pollOptionId }
// The endpoint is [Authorize]d (JWT bearer) on the backend; there is no web
// sign-in flow yet, so an unauthenticated call surfaces as `auth-required`.
export async function submitVote(pollId: string, optionId: string): Promise<VoteResult> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/polls/${pollId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ pollOptionId: optionId }),
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

/** Canonical shared link: the same `/vote/{shareCode}` URL the app produces. */
export function publicPollUrl(poll: Pick<PollDto, 'id' | 'shareCode'>): string {
  const origin = (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/+$/, '');
  return `${origin}/vote/${poll.shareCode || poll.id}`;
}

export function whatsAppShareUrl(poll: Pick<PollDto, 'id' | 'shareCode' | 'question'>): string {
  const text = `${poll.question}\n${publicPollUrl(poll)}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
