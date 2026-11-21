import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type VoteEdgeKind = 'already-answered' | 'closed' | 'unavailable';

const ui = {
  primary: '#D02E62',
  ink: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  page: '#FFF8F5',
  card: '#FFFFFF',
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  brand: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const COPY: Record<VoteEdgeKind, { title: string; body: string }> = {
  'already-answered': {
    title: "You've already answered this one",
    body: "One answer per person keeps it fair. They'll never know it was you.",
  },
  closed: {
    title: 'This card has closed',
    body: 'Cards stay open for 24 hours. The answers are in.',
  },
  unavailable: {
    title: "This card isn't available",
    body: 'It may have been deleted, or the link is wrong.',
  },
};

function YakkuMark() {
  return (
    <Link to="/" aria-label="Yakku home" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none', color: ui.ink }}>
      <span style={{ fontFamily: ui.brand, fontSize: 28, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1 }}>Yakku</span>
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

function AlreadyIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#C8EFD8',
        color: '#1B1418',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ClosedIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: '#F3D7A0',
        color: '#6B4A1E',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="2.2" />
        <path d="M12 7.75V12l3.25 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function UnavailableIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 72,
        height: 72,
        borderRadius: 22,
        background: '#E8D7F5',
        color: '#5B2D8E',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4.6 20.2 19.2H3.8L12 4.6Z"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
        <path d="M12 10.2v4.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="16.7" r="1.15" fill="currentColor" />
      </svg>
    </span>
  );
}

function EdgeIcon({ kind }: { kind: VoteEdgeKind }) {
  if (kind === 'already-answered') return <AlreadyIcon />;
  if (kind === 'closed') return <ClosedIcon />;
  return <UnavailableIcon />;
}

const askBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 54,
  borderRadius: 999,
  background: ui.primary,
  color: '#fff',
  fontFamily: ui.font,
  fontSize: 16,
  fontWeight: 700,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

/**
 * In-page edge states for /vote?share_code=…: already answered, closed, or unavailable.
 * Kept as a sub-panel of the vote screen (same chrome + Ask your own CTA).
 */
export function VoteEdgeCase({
  kind,
  askHref = '/live-check',
  onAsk,
}: {
  kind: VoteEdgeKind;
  askHref?: string;
  onAsk?: () => void;
}) {
  const copy = COPY[kind];
  const ask: ReactNode = onAsk ? (
    <button type="button" onClick={onAsk} style={askBtn}>
      Ask your own
    </button>
  ) : (
    <Link to={askHref} style={askBtn}>
      Ask your own
    </Link>
  );

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
          padding: '18px 20px 28px',
        }}
      >
        <header style={{ marginBottom: 18, flexShrink: 0 }}>
          <YakkuMark />
        </header>

        <div
          style={{
            flex: 1,
            background: ui.card,
            borderRadius: 28,
            boxShadow: '0 10px 30px rgba(27, 20, 24, 0.06)',
            padding: '48px 28px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <EdgeIcon kind={kind} />
          <h1
            style={{
              margin: '28px 0 12px',
              fontFamily: ui.heading,
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -0.5,
              lineHeight: 1.2,
              color: ui.ink,
              maxWidth: 280,
            }}
          >
            {copy.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.45,
              color: ui.muted,
              maxWidth: 280,
              fontWeight: 500,
            }}
          >
            {copy.body}
          </p>
          <div style={{ flex: 1, minHeight: 48 }} />
          {ask}
        </div>
      </div>
    </div>
  );
}

export default VoteEdgeCase;
