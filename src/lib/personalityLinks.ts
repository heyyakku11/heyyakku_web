/** Canonical personality vote URLs: /personality?share_code=… */

export function personalityPath(shareCode: string): string {
  return `/personality?share_code=${encodeURIComponent(shareCode)}`;
}

export function personalityAbsoluteUrl(
  shareCode: string,
  origin = typeof window !== 'undefined' ? window.location.origin : '',
): string {
  return `${origin}${personalityPath(shareCode)}`;
}
