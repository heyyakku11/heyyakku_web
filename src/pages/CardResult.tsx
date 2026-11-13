import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { bgOf, ck } from '../components/checkUi.tsx';
import { isShareCode } from '../lib/pollApi.ts';
import { fetchSharedResult, type SharedResultDto } from '../lib/resultApi.ts';

type Load = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; result: SharedResultDto };

// The shared result of an ended card: the question and how the circle answered, as percentages.
// Opened from the "Share your result" link (/result/{shareCode}); it never shows the voting form.
function Page({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: ck.body, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: '22px 22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <span style={{ fontFamily: ck.heading, fontSize: 22, fontWeight: 800, color: ck.ink }}>
          Yakku<span style={{ color: ck.accent }}>.</span>
        </span>
        {children}
      </div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        background: '#fff',
        color: ck.accent,
        borderRadius: 14,
        padding: '5px 10px',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.6,
      }}
    >
      {children}
    </span>
  );
}

const primaryButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
  borderRadius: 28,
  background: ck.accent,
  color: '#fff',
  fontFamily: ck.body,
  fontSize: 17,
  fontWeight: 700,
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
} as const;

function Notice({ title, body, to, action }: { title: string; body: string; to?: string; action?: string }) {
  return (
    <Page bg={ck.defaultBg}>
      <h1 style={{ margin: '24px 0 0', fontFamily: ck.heading, fontSize: 30, fontWeight: 800, color: ck.ink }}>{title}</h1>
      <p style={{ margin: 0, color: ck.muted, fontSize: 15, lineHeight: 1.4 }}>{body}</p>
      <div style={{ flex: 1 }} />
      <Link to={to ?? '/'} style={primaryButton}>
        {action ?? 'Back to Yakku'}
      </Link>
    </Page>
  );
}

export function CardResult() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isShareCode(shareCode)) return;
    const controller = new AbortController();
    fetchSharedResult(shareCode, controller.signal).then((r) => {
      if (controller.signal.aborted) return;
      setLoad(r.kind === 'ok' ? r : { kind: r.kind });
    });
    return () => controller.abort();
  }, [shareCode, reloadKey]);

  if (!isShareCode(shareCode)) {
    return <Notice title="Not found" body="This link may have been removed or might be broken." />;
  }
  if (load.kind === 'loading') {
    return (
      <Page bg={ck.defaultBg}>
        <p role="status" style={{ textAlign: 'center', color: ck.muted }}>
          Loading…
        </p>
      </Page>
    );
  }
  if (load.kind === 'not-found') {
    return <Notice title="Not found" body="This card may have been removed or the link might be broken." />;
  }
  if (load.kind === 'error') {
    return (
      <Page bg={ck.defaultBg}>
        <h1 style={{ margin: '24px 0 0', fontFamily: ck.heading, fontSize: 30, fontWeight: 800, color: ck.ink }}>
          Couldn't load this
        </h1>
        <p style={{ margin: 0, color: ck.muted, fontSize: 15 }}>Something went wrong while contacting Yakku.</p>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          style={primaryButton}
          onClick={() => {
            setLoad({ kind: 'loading' });
            setReloadKey((k) => k + 1);
          }}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ ...primaryButton, background: '#fff', color: ck.ink, border: `1.6px solid ${ck.ink}` }}
        >
          Back to Yakku
        </button>
      </Page>
    );
  }

  const { result } = load;
  const bg = bgOf(result.backgroundColor ?? undefined);
  const tag = (result.title ?? 'Poll').toUpperCase();

  // Still taking votes: this link is for the result, so point to the voting page instead.
  if (result.isLive) {
    return (
      <Page bg={bg}>
        <Pill>{tag}</Pill>
        <h1 style={{ margin: 0, fontFamily: ck.heading, fontSize: 34, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, color: ck.ink }}>
          {result.question}
        </h1>
        <p style={{ margin: 0, color: ck.muted, fontSize: 15, lineHeight: 1.4 }}>
          Voting is still on, so there is no result yet. Cast your vote and check back when it ends.
        </p>
        <div style={{ flex: 1 }} />
        <Link to={`/vote/${encodeURIComponent(result.shareCode)}`} style={primaryButton}>
          Vote now
        </Link>
      </Page>
    );
  }

  return (
    <Page bg={bg}>
      <Pill>{tag}</Pill>
      <h1 style={{ margin: 0, fontFamily: ck.heading, fontSize: 34, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, color: ck.ink }}>
        {result.question}
      </h1>
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5, color: ck.accent }}>
        {result.resultsAvailable ? 'HOW THEY VOTED · ENDED' : 'VOTING ENDED'}
      </span>

      {result.resultsAvailable ? (
        <div role="list" aria-label="Results" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {result.options.map((option) => {
            const lead = option.isLeading;
            return (
              <div
                key={`${option.displayOrder}-${option.text}`}
                role="listitem"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 20,
                  border: `1.6px solid ${ck.ink}`,
                  background: lead ? ck.ink : '#fff',
                  boxShadow: `0 3px 0 ${lead ? ck.accent : ck.ink}`,
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: `${Math.min(100, Math.max(0, option.percentage))}%`,
                    background: lead ? 'rgba(208, 46, 98, 0.55)' : 'rgba(208, 46, 98, 0.16)',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '14px 16px',
                    color: lead ? '#fff' : ck.ink,
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  <span>{option.text}</span>
                  <span style={{ fontFamily: ck.heading, fontWeight: 800, fontSize: 17 }}>
                    {Math.round(option.percentage)}%
                  </span>
                </div>
              </div>
            );
          })}
          {result.customAnswerPercentage ? (
            <p style={{ margin: 0, fontSize: 13, color: ck.muted }}>
              {Math.round(result.customAnswerPercentage)}% wrote their own answer.
            </p>
          ) : null}
        </div>
      ) : (
        <p style={{ margin: 0, color: ck.muted, fontSize: 15, lineHeight: 1.4 }}>
          Not enough people voted to show a result.
        </p>
      )}

      <div style={{ flex: 1 }} />
      <Link to="/" style={primaryButton}>
        Ask your own on Yakku
      </Link>
      <span style={{ textAlign: 'center', fontSize: 12.5, color: ck.muted }}>
        Anonymous. No names, counts or reasons are shown.
      </span>
    </Page>
  );
}

export default CardResult;
