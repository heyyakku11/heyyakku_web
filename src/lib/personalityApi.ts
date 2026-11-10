// Personality-card voting client.
//   GET  /api/v1/personality/traits                      public trait list
//   GET  /api/v1/personality-cards/{shareCode}           the card as a voter sees it
//   POST /api/v1/personality-cards/{shareCode}/votes     { traitIds: [3 ids] }
// Callers are signed-in users (bearer token) or guests (X-Guest-Token), same as polls and checks.

import { apiBase, ensureGuestToken, guestHeaders } from './pollApi.ts';

export const REQUIRED_TRAITS = 3;

export interface PersonalityTrait {
  id: string;
  name: string;
}

export interface SharedPersonalityCard {
  shareCode: string;
  ownerAnonymousName: string;
  status: string;
  isOwner: boolean;
  hasVoted: boolean;
  canVote: boolean;
  totalVotes: number;
  requiredVotes: number;
}

export type CardLoad = { kind: 'ok'; card: SharedPersonalityCard } | { kind: 'not-found' | 'error' };
export type PersonalityVoteResult =
  | { kind: 'ok' }
  | { kind: 'auth-required' | 'conflict' | 'rate-limited' | 'invalid' | 'error'; message?: string };

async function envelopeData(res: Response): Promise<unknown> {
  try {
    const body = (await res.json()) as { success?: unknown; data?: unknown };
    return body.success === true ? body.data : null;
  } catch {
    return null;
  }
}

export function parseTraits(raw: unknown): PersonalityTrait[] | null {
  if (!Array.isArray(raw)) return null;
  const out: PersonalityTrait[] = [];
  for (const t of raw as Array<Record<string, unknown> | null>) {
    if (t && typeof t.id === 'string' && typeof t.name === 'string' && t.name.trim()) {
      out.push({ id: t.id, name: t.name });
    }
  }
  return out;
}

export async function fetchTraits(signal?: AbortSignal): Promise<PersonalityTrait[] | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/personality/traits`, { headers: { Accept: 'application/json' }, signal });
    return res.ok ? parseTraits(await envelopeData(res)) : null;
  } catch {
    return null;
  }
}

export function parseCard(raw: unknown): SharedPersonalityCard | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.shareCode !== 'string') return null;
  return {
    shareCode: d.shareCode,
    ownerAnonymousName: typeof d.ownerAnonymousName === 'string' ? d.ownerAnonymousName : '',
    status: String(d.status ?? ''),
    isOwner: d.isOwner === true,
    hasVoted: d.hasVoted === true,
    canVote: d.canVote === true,
    totalVotes: Number(d.totalVotes) || 0,
    requiredVotes: Number(d.requiredVotes) || 0,
  };
}

export async function fetchSharedCard(shareCode: string, signal?: AbortSignal): Promise<CardLoad> {
  try {
    const guestToken = await ensureGuestToken();
    const res = await fetch(`${apiBase()}/api/v1/personality-cards/${encodeURIComponent(shareCode)}`, {
      headers: guestHeaders(guestToken),
      credentials: 'include',
      signal,
    });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'error' };
    const card = parseCard(await envelopeData(res));
    return card ? { kind: 'ok', card } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export async function submitPersonalityVote(shareCode: string, traitIds: string[]): Promise<PersonalityVoteResult> {
  if (traitIds.length !== REQUIRED_TRAITS) return { kind: 'invalid' };
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const guestToken = await ensureGuestToken();
      const res = await fetch(`${apiBase()}/api/v1/personality-cards/${encodeURIComponent(shareCode)}/votes`, {
        method: 'POST',
        headers: guestHeaders(guestToken, { 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ traitIds }),
      });
      if (res.ok) return { kind: 'ok' };
      if (res.status === 401 && attempt === 0) {
        // Stale guest identity: drop it and retry once with a fresh guest.
        try {
          localStorage.removeItem('yakku_guest_token');
          localStorage.removeItem('yakku_guest_expires_at');
        } catch {
          /* storage unavailable */
        }
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
