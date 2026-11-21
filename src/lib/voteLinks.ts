/** Canonical web vote URLs use a query param: /vote?share_code=… */

export function votePath(shareCode: string): string {
  return `/vote?share_code=${encodeURIComponent(shareCode)}`;
}

export function voteResultPath(shareCode: string): string {
  return `/vote/result?share_code=${encodeURIComponent(shareCode)}`;
}

export function voteAbsoluteUrl(shareCode: string, origin = typeof window !== 'undefined' ? window.location.origin : ''): string {
  return `${origin}${votePath(shareCode)}`;
}
