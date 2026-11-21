// Remembers where to send the visitor after /auth succeeds (e.g. /vote/result?share_code=…).

const KEY = 'yakku_auth_next';

export function saveAuthNext(path: string): void {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* ignore */
  }
}

export function takeAuthNext(fallback = '/'): string {
  try {
    const value = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function peekAuthNext(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  } catch {
    /* ignore */
  }
  return null;
}
