// Vercel Node.js function: server-rendered Open Graph preview for /poll/:id.
// Routed via vercel.json (/poll/:id -> /api/poll?id=:id). Crawlers (WhatsApp etc.)
// read the meta tags from this raw HTML; real browsers follow the link/redirect
// to the React voting page at /vote/:id.
import type { IncomingMessage, ServerResponse } from 'node:http';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UPSTREAM_TIMEOUT_MS = 5000;
const DEFAULT_IMAGE_PATH = '/yakku_hero.png';
const SITE_NAME = 'Yakku';

export interface SharedPoll {
  id: string;
  shareCode: string;
  question: string;
  status: string;
  visibility: string;
  imageUrl: string | null;
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

/** Share codes are letters and digits only (see the app's PollDeepLink). */
export function isShareCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9]{6,64}$/.test(value);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(value: string, max: number): string {
  const chars = Array.from(value.trim().replace(/\s+/g, ' '));
  return chars.length <= max ? chars.join('') : `${chars.slice(0, max - 1).join('')}…`;
}

/** Reads the poll from the `{ success, data }` envelope; returns null when malformed. */
export function parsePollEnvelope(body: unknown): SharedPoll | null {
  if (!body || typeof body !== 'object') return null;
  const envelope = body as { success?: unknown; data?: unknown };
  if (envelope.success !== true || !envelope.data || typeof envelope.data !== 'object') return null;
  const data = envelope.data as Record<string, unknown>;
  if (!isUuid(data.id)) return null;
  if (typeof data.question !== 'string' || data.question.trim() === '') return null;

  let imageUrl: string | null = null;
  const media = data.media as { mediaType?: unknown; url?: unknown } | null | undefined;
  if (
    media &&
    typeof media.url === 'string' &&
    media.url.startsWith('https://') &&
    String(media.mediaType).toLowerCase() === 'image'
  ) {
    imageUrl = media.url;
  }

  return {
    id: data.id,
    shareCode: isShareCode(data.shareCode) ? data.shareCode : '',
    question: data.question,
    status: String(data.status ?? '').toLowerCase(),
    visibility: String(data.visibility ?? '').toLowerCase(),
    imageUrl,
  };
}

/** Only public, published polls may be exposed through unauthenticated metadata. */
export function isShareable(poll: SharedPoll): boolean {
  return poll.visibility === 'public' && poll.status !== 'draft' && poll.status !== '';
}

export function renderPreviewHtml(opts: {
  poll: SharedPoll | null;
  pollId: string;
  siteUrl: string;
}): string {
  const { poll, pollId, siteUrl } = opts;
  const pollUrl = `${siteUrl}/poll/${pollId}`;
  const voteUrl = `${siteUrl}/vote/${poll?.shareCode || pollId}`;

  const title = poll ? truncate(poll.question, 120) : `${SITE_NAME} — Anonymous Polling`;
  const description = !poll
    ? 'Create and answer anonymous polls on Yakku.'
    : poll.status === 'active'
      ? 'Cast your anonymous vote on Yakku. Tap to see the options.'
      : 'See this poll on Yakku.';
  const image = poll?.imageUrl ?? `${siteUrl}${DEFAULT_IMAGE_PATH}`;
  const imageAlt = poll ? `Yakku poll: ${truncate(poll.question, 100)}` : 'Yakku anonymous polling';
  const target = poll ? voteUrl : siteUrl;

  const e = escapeHtml;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${e(description)}">
${poll ? '' : '<meta name="robots" content="noindex">\n'}<link rel="canonical" href="${e(pollUrl)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${e(title)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${e(pollUrl)}">
<meta property="og:image" content="${e(image)}">
<meta property="og:image:alt" content="${e(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${e(title)}">
<meta name="twitter:description" content="${e(description)}">
<meta name="twitter:image" content="${e(image)}">
<meta http-equiv="refresh" content="0;url=${e(target)}">
</head>
<body>
<h1>${e(title)}</h1>
<p><a href="${e(target)}">${poll ? 'Open the poll and vote' : 'Go to Yakku'}</a></p>
</body>
</html>`;
}

function send(res: ServerResponse, status: number, html: string, cache: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(html);
}

function resolveSiteUrl(req: IncomingMessage): string {
  const configured = process.env.PUBLIC_SITE_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    const withScheme = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return withScheme.replace(/\/+$/, '');
  }
  return `https://${req.headers.host ?? 'localhost'}`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const siteUrl = resolveSiteUrl(req);
  const rawId = new URL(req.url ?? '/', 'http://localhost').searchParams.get('id');

  if (!isUuid(rawId) && !isShareCode(rawId)) {
    send(res, 404, renderPreviewHtml({ poll: null, pollId: '', siteUrl }), 'public, s-maxage=60');
    return;
  }
  // UUIDs are case-insensitive; share codes are not.
  const pollId = isUuid(rawId) ? rawId.toLowerCase() : rawId;
  const apiBase = (process.env.POLL_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
  const generic = renderPreviewHtml({ poll: null, pollId, siteUrl });

  if (!apiBase) {
    console.error('poll preview: POLL_API_BASE_URL is not configured');
    send(res, 200, generic, 'no-store');
    return;
  }

  try {
    const upstream = await fetch(
      isUuid(pollId)
        ? `${apiBase}/api/v1/polls/${pollId}`
        : `${apiBase}/api/v1/polls/share/${encodeURIComponent(pollId)}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      },
    );
    if (upstream.status === 404) {
      send(res, 404, generic, 'public, s-maxage=60');
      return;
    }
    if (!upstream.ok) {
      send(res, 200, generic, 'no-store');
      return;
    }
    const poll = parsePollEnvelope(await upstream.json());
    if (!poll || (isUuid(pollId) ? poll.id.toLowerCase() !== pollId : poll.shareCode !== pollId) || !isShareable(poll)) {
      // Private/draft/malformed: reveal nothing about the poll.
      send(res, poll ? 404 : 200, generic, poll ? 'public, s-maxage=60' : 'no-store');
      return;
    }
    send(
      res,
      200,
      renderPreviewHtml({ poll, pollId, siteUrl }),
      'public, s-maxage=60, stale-while-revalidate=300',
    );
  } catch (err) {
    // Timeout / network failure: log a short reason only, never echo it to the client.
    console.error('poll preview: upstream failure', err instanceof Error ? err.name : 'unknown');
    send(res, 200, generic, 'no-store');
  }
}
