import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AfterVote } from '../components/AfterVote.tsx';
import { FlagIcon, ReportCardFlow } from '../components/ReportCardFlow.tsx';
import { VoteEdgeCase } from '../components/VoteEdgeCase.tsx';
import { isShareCode } from '../lib/pollApi.ts';
import {
  REQUIRED_TRAITS,
  fetchSharedCard,
  fetchTraits,
  submitPersonalityVote,
  type PersonalityTrait,
  type SharedPersonalityCard,
} from '../lib/personalityApi.ts';
import { personalityPath } from '../lib/personalityLinks.ts';

type Load =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error' }
  | { kind: 'ok'; card: SharedPersonalityCard; traits: PersonalityTrait[] };

type EdgeState = 'already-answered' | 'closed' | 'unavailable' | null;

const ui = {
  primary: '#D02E62',
  ink: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  page: '#FFD6E0',
  card: '#FFFFFF',
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  brand: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const buttonBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 52,
  borderRadius: 999,
  fontFamily: ui.font,
  fontSize: 16,
  fontWeight: 700,
  textDecoration: 'none',
  boxSizing: 'border-box',
  border: 'none',
};

function YakkuMark() {
  return (
    <Link to="/" aria-label="Yakku home" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none', color: ui.ink }}>
      <span
        style={{
          fontFamily: ui.brand,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: -0.6,
          lineHeight: 1,
        }}
      >
        Yakku
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 2,
          background: ui.primary,
          marginLeft: 2,
          alignSelf: 'flex-end',
          marginBottom: 4,
        }}
      />
    </Link>
  );
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5 20.5 20.5M10.2 10.4a2.5 2.5 0 0 0 3.4 3.4M9.5 5.4A10.4 10.4 0 0 1 12 5c5.2 0 8.8 4.1 9.8 6.2a1.2 1.2 0 0 1 0 1.2c-.4.8-1.3 2.2-2.8 3.5M6.2 6.8C4.4 8.2 3.3 9.8 2.8 10.8a1.2 1.2 0 0 0 0 1.2C3.8 14 7.4 18 12 18c1.2 0 2.3-.3 3.3-.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chrome({ onReport, children }: { onReport?: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: ui.page,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: ui.font,
        color: ui.ink,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 20px max(28px, env(safe-area-inset-bottom))',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
            flexShrink: 0,
          }}
        >
          <YakkuMark />
          {onReport ? (
            <button
              type="button"
              onClick={onReport}
              aria-label="Report this card"
              style={{
                width: 40,
                height: 40,
                border: 'none',
                background: 'transparent',
                color: 'rgba(27, 20, 24, 0.45)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 12,
              }}
            >
              <FlagIcon size={22} />
            </button>
          ) : (
            <span style={{ width: 40 }} />
          )}
        </header>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</main>
      </div>
    </div>
  );
}

function Notice({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  return (
    <Chrome>
      <div
        style={{
          background: 'rgba(255,255,255,0.72)',
          borderRadius: 16,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, color: ui.ink, margin: 0, fontFamily: ui.heading }}>{title}</h1>
        <p style={{ fontSize: 14, color: ui.muted, margin: 0, lineHeight: 1.4 }}>{body}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {retry && (
            <button type="button" onClick={retry} style={{ ...buttonBase, background: ui.primary, color: '#fff', cursor: 'pointer' }}>
              Try again
            </button>
          )}
          <Link to="/" style={{ ...buttonBase, border: '1.5px solid rgba(27, 20, 24, 0.12)', color: ui.ink, background: ui.card }}>
            Back to Yakku
          </Link>
        </div>
      </div>
    </Chrome>
  );
}

/** Old path links `/personality/{code}` → `/personality?share_code={code}`. */
export function LegacyPersonalityRedirect() {
  const { shareCode } = useParams<{ shareCode: string }>();
  if (!shareCode || !isShareCode(shareCode)) return <Navigate to="/" replace />;
  return <Navigate to={personalityPath(shareCode)} replace />;
}

// "Describe me in 3 words": a friend (guest or signed in) picks 3 traits for the card's owner.
export function PersonalityVote() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('share_code') ?? undefined;
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [edge, setEdge] = useState<EdgeState>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isShareCode(shareCode)) return;
    const controller = new AbortController();
    Promise.all([fetchSharedCard(shareCode, controller.signal), fetchTraits(controller.signal)]).then(([card, traits]) => {
      if (controller.signal.aborted) return;
      if (card.kind !== 'ok') setLoad({ kind: card.kind });
      else if (!traits || traits.length === 0) setLoad({ kind: 'error' });
      else setLoad({ kind: 'ok', card: card.card, traits });
    });
    return () => controller.abort();
  }, [shareCode, reloadKey]);

  if (!isShareCode(shareCode)) {
    return <VoteEdgeCase kind="unavailable" askHref="/live-check" />;
  }

  if (load.kind === 'loading') {
    return (
      <Chrome>
        <p role="status" style={{ textAlign: 'center', fontSize: 14, color: ui.muted, marginTop: 48 }}>
          Loading…
        </p>
      </Chrome>
    );
  }

  if (load.kind === 'not-found') {
    return <VoteEdgeCase kind="unavailable" askHref="/live-check" />;
  }

  if (load.kind === 'error') {
    return (
      <Notice
        title="Couldn't load this"
        body="Something went wrong while contacting Yakku. Please try again."
        retry={() => {
          setLoad({ kind: 'loading' });
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  const { card, traits } = load;
  const toLanding = () => navigate('/');
  const askOwn = () => navigate('/live-check');

  const edgeKind: EdgeState =
    edge ??
    (card.hasVoted
      ? 'already-answered'
      : card.isOwner || !card.canVote
        ? card.isOwner
          ? 'unavailable'
          : 'closed'
        : null);

  if (edgeKind) {
    return <VoteEdgeCase kind={edgeKind} onAsk={askOwn} />;
  }

  if (sent) {
    return (
      <AfterVote
        title="Sent. Anonymously."
        subtitle="They'll never know it was you."
        seeResults={{
          label: 'See what others are saying',
          sub: "Nobody ever knows it's you",
          onClick: toLanding,
        }}
        yourTurn={{
          label: 'Your Turn',
          sub: 'Find out what your friends say about you',
          onClick: askOwn,
        }}
        onDismiss={toLanding}
        dismissLabel="Not now"
      />
    );
  }

  const toggle = (id: string) => {
    setError(null);
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < REQUIRED_TRAITS ? [...cur, id] : cur));
  };

  const send = async () => {
    if (picked.length !== REQUIRED_TRAITS || inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setError(null);
    const result = await submitPersonalityVote(shareCode, picked);
    inFlight.current = false;
    setSending(false);
    switch (result.kind) {
      case 'ok':
        setSent(true);
        break;
      case 'conflict':
        setEdge('already-answered');
        break;
      case 'invalid':
        setError(result.message ?? 'Your vote could not be accepted. Please check your picks and try again.');
        break;
      case 'rate-limited':
        setError('Too many attempts. Please wait a moment and try again.');
        break;
      case 'auth-required':
        setError('Your vote could not be accepted right now. Please try again in a moment.');
        break;
      default:
        setError('Your vote could not be submitted. Please try again.');
    }
  };

  const ready = picked.length === REQUIRED_TRAITS;
  const ownerName = card.ownerAnonymousName.trim();
  const title = ownerName ? `Describe ${ownerName} in 3 words` : 'Describe me in 3 words';

  return (
    <>
      <Chrome onReport={() => setReportOpen(true)}>
        <span
          style={{
            alignSelf: 'flex-start',
            background: '#fff',
            color: ui.primary,
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.3,
            lineHeight: 1.2,
          }}
        >
          WHO YOU ARE
        </span>

        <h1
          style={{
            margin: '14px 0 0',
            fontFamily: ui.heading,
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: -1.2,
            lineHeight: 1.05,
            color: ui.ink,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: '14px 0 0',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: ready ? ui.ink : ui.primary,
          }}
        >
          {picked.length} of {REQUIRED_TRAITS} picked
        </p>

        <div
          role="group"
          aria-label="Personality traits"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px 10px',
            marginTop: 18,
            overflowY: 'auto',
            flex: 1,
            alignContent: 'flex-start',
            paddingBottom: 8,
            minHeight: 120,
          }}
        >
          {traits.map((t) => {
            const on = picked.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 999,
                  border: `1.5px solid ${ui.ink}`,
                  background: on ? ui.ink : '#fff',
                  color: on ? '#fff' : ui.ink,
                  boxShadow: `0 3px 0 ${on ? ui.primary : ui.ink}`,
                  padding: '11px 16px',
                  fontFamily: ui.font,
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  cursor: 'pointer',
                  maxWidth: '100%',
                  transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease',
                }}
              >
                {on ? <CheckIcon /> : null}
                {t.name}
              </button>
            );
          })}
        </div>

        {error && (
          <p role="alert" style={{ margin: '8px 0 0', color: '#B42318', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={send}
          disabled={!ready || sending}
          style={{
            ...buttonBase,
            marginTop: 16,
            height: 54,
            background: ui.primary,
            color: '#fff',
            cursor: ready && !sending ? 'pointer' : 'default',
            opacity: ready && !sending ? 1 : 0.45,
            flexShrink: 0,
          }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>

        <p
          style={{
            margin: '14px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontSize: 12,
            fontWeight: 600,
            color: ui.muted,
            flexShrink: 0,
          }}
        >
          <EyeOffIcon />
          <span>Anonymous. They&apos;ll never know it was you.</span>
        </p>
      </Chrome>

      <ReportCardFlow
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        payload={{
          shareCode: card.shareCode || shareCode,
          contentType: 'PERSONALITY',
          contentId: card.shareCode || shareCode,
          question: title,
        }}
      />
    </>
  );
}

export default PersonalityVote;
