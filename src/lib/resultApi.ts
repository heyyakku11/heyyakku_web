// Client for the public result of a shared card.
//
//   GET /api/v1/shares/{code}/result   percentages only, once the card has ended with enough votes
//
// Anonymous: no guest token or sign-in is needed to read it.

import { apiBase } from './pollApi.ts';

export interface ResultOptionDto {
  text: string;
  displayOrder: number;
  percentage: number;
  isLeading: boolean;
}

export interface SharedResultDto {
  contentType: 'POLL' | 'CHECK';
  shareCode: string;
  question: string;
  /** The check's type name (Mirror Check...); null for a poll. */
  title: string | null;
  backgroundColor: string | null;
  /** True when the card ended with enough votes; otherwise `options` is empty. */
  resultsAvailable: boolean;
  /** True while the card still takes votes. */
  isLive: boolean;
  expiresAt: string | null;
  minVotesToReveal: number;
  options: ResultOptionDto[];
  customAnswerPercentage: number | null;
}

export type ResultLoad = { kind: 'ok'; result: SharedResultDto } | { kind: 'not-found' | 'error' };

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function parseSharedResult(body: unknown): SharedResultDto | null {
  const data = (body as { data?: unknown } | null)?.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== 'object' || typeof data.question !== 'string') return null;
  const options = Array.isArray(data.options) ? (data.options as Record<string, unknown>[]) : [];
  return {
    contentType: data.contentType === 'CHECK' ? 'CHECK' : 'POLL',
    shareCode: String(data.shareCode ?? ''),
    question: data.question,
    title: typeof data.title === 'string' ? data.title : null,
    backgroundColor: typeof data.backgroundColor === 'string' ? data.backgroundColor : null,
    resultsAvailable: data.resultsAvailable === true,
    isLive: data.isLive === true,
    expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : null,
    minVotesToReveal: num(data.minVotesToReveal),
    customAnswerPercentage:
      data.customAnswerPercentage === null || data.customAnswerPercentage === undefined
        ? null
        : num(data.customAnswerPercentage),
    options: options
      .map((o) => ({
        text: String(o.text ?? ''),
        displayOrder: num(o.displayOrder),
        percentage: num(o.percentage),
        isLeading: o.isLeading === true,
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

export async function fetchSharedResult(shareCode: string, signal?: AbortSignal): Promise<ResultLoad> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/shares/${encodeURIComponent(shareCode)}/result`, { signal });
    if (res.status === 404) return { kind: 'not-found' };
    if (!res.ok) return { kind: 'error' };
    const result = parseSharedResult(await res.json());
    return result ? { kind: 'ok', result } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}
