// Client for the ASP.NET Core share/vote API. Responses use the
// `{ success, message, data, errors }` envelope.
//
//   POST /api/v1/guests           create a guest identity (when none is stored)
//   GET  /api/v1/shares/{code}    resolve a share code to a poll or a check
//   POST /api/v1/votes            vote by share code (poll or check)
//
// Visitors act as guests: the stored guest token is sent as `X-Guest-Token`.

export type ContentType = 'POLL' | 'CHECK';

export interface SharedOptionDto {
  id: string;
  text: string;
  displayOrder: number;
  /** Null until the backend reveals results to this viewer. */
  voteCount: number | null;
  percentage: number | null;
  whyCount: number | null;
  isSelected: boolean;
}

export interface MyVoteDto {
  optionId: string | null;
  customAnswer: string | null;
  reason: string | null;
}

export interface VotingStateDto {
  canVote: boolean;
  hasVoted: boolean;
  /** ALREADY_VOTED, OWNER, CLOSED, INACTIVE or EXPIRED when voting is blocked. */
  blockedReason: string | null;
  myVote: MyVoteDto | null;
}

export interface VoteStatsDto {
  /** True once enough other people voted AND this viewer has voted (or owns the content). */
  resultsVisible: boolean;
  /** Votes from others needed before results are revealed. */
  minVotesToReveal: number;
  /** Votes from others so far. */
  voteProgress: number;
  totalVotes: number | null;
  customAnswerCount: number | null;
  customAnswerPercentage: number | null;
}

export interface PollDetailsDto {
  pollType: string;
  media: { mediaType: string; mimeType: string; url: string | null } | null;
}

export interface CheckDetailsDto {
  title: string;
  backgroundColor: string;
  sticker: string;
}

export interface SharedContentDto {
  contentType: ContentType;
  contentId: string;
  /** Opaque code carried by shared links (`/vote/{shareCode}`). */
  shareCode: string;
  question: string;
  status: string;
  expiresAt: string | null;
  isOwner: boolean;
  options: SharedOptionDto[];
  voting: VotingStateDto;
  stats: VoteStatsDto;
  poll: PollDetailsDto | null;
  check: CheckDetailsDto | null;
}

export type ContentLoadResult =
  | { kind: 'ok'; content: SharedContentDto }
  | { kind: 'not-found' | 'error' };

export type VoteResult =
  | { kind: 'ok'; content: SharedContentDto | null }
  | { kind: 'auth-required' | 'conflict' | 'rate-limited' | 'invalid' | 'error'; message?: string };

export type VotePhase = 'votable' | 'voted' | 'owner' | 'expired' | 'closed' | 'unavailable';

// Matches the app's PollDeepLink: case-sensitive letters and digits, 6-64 long.
const SHARE_CODE_RE = /^[A-Za-z0-9]{6,64}$/;

export function isShareCode(value: string | undefined): value is string {
  return !!value && SHARE_CODE_RE.test(value);
}

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
}

/** What the viewer can do with the content, from the backend's voting state. */
export function getVotePhase(content: SharedContentDto, now: number = Date.now()): VotePhase {
  const { voting } = content;
  if (voting.hasVoted) return 'voted';
  switch (voting.blockedReason) {
    case 'ALREADY_VOTED':
      return 'voted';
    case 'OWNER':
      return 'owner';
    case 'EXPIRED':
      return 'expired';
    case 'CLOSED':
    case 'INACTIVE':
      return 'closed';
  }
  const status = content.status.toLowerCase();
  if (status === 'closed') return 'closed';
  if (status === 'expired') return 'expired';
  if (content.expiresAt && new Date(content.expiresAt).getTime() <= now) return 'expired';
  return voting.canVote ? 'votable' : 'unavailable';
}

/** True while the vote-count limit has not been reached and results stay hidden. */
export function resultsLocked(content: SharedContentDto): boolean {
  return !content.stats.resultsVisible;
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function nullableNum(value: unknown): number | null {
  return value === null || value === undefined ? null : num(value);
}

function str(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function parseSharedContent(body: unknown): SharedContentDto | null {
  if (!body || typeof body !== 'object') return null;
  const env = body as { success?: unknown; data?: unknown };
  if (env.success !== true || !env.data || typeof env.data !== 'object') return null;
  const d = env.data as Record<string, unknown>;
  const contentType = String(d.contentType ?? '').toUpperCase();
  if (contentType !== 'POLL' && contentType !== 'CHECK') return null;
  if (typeof d.contentId !== 'string' || typeof d.question !== 'string' || !Array.isArray(d.options)) {
    return null;
  }

  const options: SharedOptionDto[] = [];
  for (const raw of d.options) {
    const o = raw as Record<string, unknown> | null;
    if (!o || typeof o.id !== 'string') return null;
    const text = typeof o.text === 'string' ? o.text : '';
    if (text.trim() === '') continue;
    options.push({
      id: o.id,
      text,
      displayOrder: num(o.displayOrder),
      voteCount: nullableNum(o.voteCount),
      percentage: nullableNum(o.percentage),
      whyCount: nullableNum(o.whyCount),
      isSelected: o.isSelected === true,
    });
  }
  options.sort((a, b) => a.displayOrder - b.displayOrder);

  const v = (d.voting ?? {}) as Record<string, unknown>;
  const mv = v.myVote as Record<string, unknown> | null | undefined;
  const s = (d.stats ?? {}) as Record<string, unknown>;
  const p = d.poll as Record<string, unknown> | null | undefined;
  const pm = p?.media as Record<string, unknown> | null | undefined;
  const c = d.check as Record<string, unknown> | null | undefined;

  return {
    contentType,
    contentId: d.contentId,
    shareCode: typeof d.shareCode === 'string' ? d.shareCode : '',
    question: d.question,
    status: String(d.status ?? ''),
    expiresAt: str(d.expiresAt),
    isOwner: d.isOwner === true,
    options,
    voting: {
      canVote: v.canVote === true,
      hasVoted: v.hasVoted === true,
      blockedReason: str(v.blockedReason),
      myVote: mv
        ? { optionId: str(mv.optionId), customAnswer: str(mv.customAnswer), reason: str(mv.reason) }
        : null,
    },
    stats: {
      resultsVisible: s.resultsVisible === true,
      minVotesToReveal: num(s.minVotesToReveal),
      voteProgress: num(s.voteProgress),
      totalVotes: nullableNum(s.totalVotes),
      customAnswerCount: nullableNum(s.customAnswerCount),
      customAnswerPercentage: nullableNum(s.customAnswerPercentage),
    },
    poll: p
      ? {
          pollType: String(p.pollType ?? 'question'),
          media: pm
            ? { mediaType: String(pm.mediaType ?? ''), mimeType: String(pm.mimeType ?? ''), url: str(pm.url) }
            : null,
        }
      : null,
    check: c
      ? {
          title: String(c.title ?? ''),
          backgroundColor: String(c.backgroundColor ?? ''),
          sticker: String(c.sticker ?? ''),
        }
      : null,
  };
}

// ---------------------------------------------------------------- guest identity

const GUEST_TOKEN_KEY = 'yakku_guest_token';
const GUEST_EXPIRES_KEY = 'yakku_guest_expires_at';

function readGuestToken(): string | null {
  try {
    const token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) return null;
    const expires = localStorage.getItem(GUEST_EXPIRES_KEY);
    if (expires && new Date(expires).getTime() <= Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

function clearGuestToken(): void {
  try {
    localStorage.removeItem(GUEST_TOKEN_KEY);
    localStorage.removeItem(GUEST_EXPIRES_KEY);
  } catch {
    /* storage unavailable */
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
    const body = (await res.json()) as { data?: { guestToken?: unknown; expiresAt?: unknown } };
    const token = body.data?.guestToken;
    if (typeof token !== 'string' || !token) return null;
    try {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
      const expiresAt = body.data?.expiresAt;
      if (typeof expiresAt === 'string') localStorage.setItem(GUEST_EXPIRES_KEY, expiresAt);
    } catch {
      /* storage unavailable: the token still works for this page view */
    }
    return token;
  } catch {
    return null;
  }
}

function guestHeaders(token: string | null, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  if (token) headers['X-Guest-Token'] = token;
  return headers;
}

// ---------------------------------------------------------------- shared content

/** Loads the poll or check behind a share code, creating a guest first if the visitor has none. */
export async function fetchSharedContent(shareCode: string, signal?: AbortSignal): Promise<ContentLoadResult> {
  try {
    const guestToken = await ensureGuestToken();
    const res = await fetch(`${apiBase()}/api/v1/shares/${encodeURIComponent(shareCode)}`, {
      headers: guestHeaders(guestToken),
      credentials: 'include',
      signal,
    });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'error' };
    const content = parseSharedContent(await res.json());
    return content ? { kind: 'ok', content } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export type VoteChoice = { optionId: string } | { customAnswer: string };

// POST /api/v1/votes  body: { shareCode, optionId | customAnswer, reason? }
// The backend decides whether the vote is valid and returns the content as the voter now sees it.
export async function submitVote(shareCode: string, choice: VoteChoice, reason?: string): Promise<VoteResult> {
  const body = JSON.stringify({
    shareCode,
    ...('optionId' in choice ? { optionId: choice.optionId } : { customAnswer: choice.customAnswer }),
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const guestToken = await ensureGuestToken();
      const res = await fetch(`${apiBase()}/api/v1/votes`, {
        method: 'POST',
        headers: guestHeaders(guestToken, { 'Content-Type': 'application/json' }),
        credentials: 'include',
        body,
      });
      if (res.ok) {
        let content: SharedContentDto | null = null;
        try {
          content = parseSharedContent(await res.json());
        } catch {
          /* the vote counted; the page falls back to reloading the content */
        }
        return { kind: 'ok', content };
      }
      if (res.status === 401 && attempt === 0) {
        // Stale or expired guest identity: drop it and retry once with a fresh guest.
        clearGuestToken();
        continue;
      }
      if (res.status === 401 || res.status === 403) return { kind: 'auth-required' };
      if (res.status === 429) return { kind: 'rate-limited' };
      let message: string | undefined;
      try {
        const err = (await res.json()) as { message?: unknown };
        if (typeof err.message === 'string') message = err.message;
      } catch {
        /* non-JSON error body */
      }
      if (res.status === 409) return { kind: 'conflict', message };
      if (res.status === 400 || res.status === 404) return { kind: 'invalid', message };
      return { kind: 'error', message };
    }
    return { kind: 'auth-required' };
  } catch {
    return { kind: 'error' };
  }
}
