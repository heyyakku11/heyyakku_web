import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeeklyChecks, type WeeklyCheck } from '../lib/checkApi.ts';
import { CHECK_STICKER } from '../lib/checkTheme.ts';
import { androidStoreUrl, iosStoreUrl, mobilePlatform } from '../lib/openApp.ts';
import { authPathFor, ensureAuthSession } from '../lib/sessionAuth.ts';

/** After signup, return here to write a custom poll. */
const CREATE_OWN_NEXT = '/create';

const ui = {
  accent: '#D02E62',
  ink: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.5)',
  cream: '#FFF9F6',
  cardInk: '#3A1818',
  border: '#111111',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

function openStore(): void {
  const platform = mobilePlatform();
  window.open(platform === 'ios' ? iosStoreUrl : androidStoreUrl, '_blank', 'noopener,noreferrer');
}

const cardShell: CSSProperties = {
  flex: '0 0 min(70vw, 286px)',
  width: 'min(70vw, 286px)',
  aspectRatio: '1 / 1.05',
  scrollSnapAlign: 'center',
  borderRadius: 32,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

function LiveCheckCard({ check, onAsk }: { check: WeeklyCheck; onAsk: () => void }) {
  const theme = check.theme;
  const heading = (theme.heading || check.title || 'Check').toUpperCase();
  return (
    <article
      style={{
        ...cardShell,
        position: 'relative',
        background: theme.background,
        border: `1.5px solid ${ui.border}`,
        boxShadow: `0 0 0 1px ${ui.border}, 5px 5px 0 0 ${ui.border}`,
        padding: '18px 16px 16px',
        color: theme.questionColor || ui.ink,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.8,
            color: theme.headingColor || ui.cardInk,
            maxWidth: '52%',
            overflowWrap: 'anywhere',
          }}
        >
          {heading}
        </span>
        <span
          aria-hidden="true"
          style={{
            transform: 'rotate(6deg)',
            background: '#fff',
            border: `1.3px solid ${ui.border}`,
            borderRadius: 10,
            padding: '6px 10px',
            fontFamily: ui.script,
            color: theme.stickerColor || ui.accent,
            fontSize: 13,
            lineHeight: 1.15,
            textAlign: 'center',
            maxWidth: 108,
            flexShrink: 0,
          }}
        >
          {theme.sticker || CHECK_STICKER}
        </span>
      </div>
      <h2
        style={{
          margin: '20px 0 auto',
          fontFamily: ui.heading,
          fontSize: 'clamp(20px, 5.6vw, 26px)',
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: -0.5,
          overflowWrap: 'anywhere',
        }}
      >
        {check.question}
      </h2>
      <button
        type="button"
        onClick={onAsk}
        style={{
          alignSelf: 'flex-start',
          marginTop: 14,
          height: 34,
          padding: '0 14px',
          borderRadius: 999,
          border: 'none',
          background: ui.border,
          color: '#fff',
          fontFamily: ui.body,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Ask this
      </button>
    </article>
  );
}

function DownloadIdeasCard() {
  return (
    <article
      style={{
        ...cardShell,
        background: '#fff',
        border: `1.5px dashed ${ui.border}`,
        boxShadow: `5px 5px 0 0 ${ui.border}`,
        padding: '20px 16px 16px',
        color: ui.ink,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: ui.accent }}>MORE CHECKS</span>
      <h2 style={{ margin: '14px 0 16px', fontFamily: ui.heading, fontSize: 28, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
        Get more ideas
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[
          { label: 'Real talk', bg: '#C9E4FF' },
          { label: 'Just for fun', bg: '#FFE58A' },
          { label: 'Mirror check', bg: '#FFD0E0' },
          { label: 'Questions worth asking', bg: '#FFC9A8' },
        ].map((tag) => (
          <span
            key={tag.label}
            style={{
              background: tag.bg,
              borderRadius: 999,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: ui.ink,
            }}
          >
            {tag.label}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={openStore}
        style={{
          marginTop: 'auto',
          width: '100%',
          height: 52,
          border: 'none',
          borderRadius: 999,
          background: ui.accent,
          color: '#fff',
          fontFamily: ui.body,
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Download the app
      </button>
    </article>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 7, padding: '10px 0 0' }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 20 : 7,
            height: 7,
            borderRadius: 999,
            background: i === active ? ui.accent : 'rgba(27, 20, 24, 0.16)',
            transition: 'width 160ms ease',
          }}
        />
      ))}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20l4.2-.8L19 8.4a2 2 0 00-2.8-2.8L5.4 16.4 4 20z"
        stroke={ui.accent}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M14.5 6.5l3 3" stroke={ui.accent} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Live weekly checks carousel for post-vote "Pick a question". Shows every live check, including used ones. */
export function LiveCheck() {
  const navigate = useNavigate();
  const scroller = useRef<HTMLDivElement>(null);
  const [checks, setChecks] = useState<WeeklyCheck[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchWeeklyChecks(controller.signal).then((list) => {
      if (controller.signal.aborted) return;
      setFailed(list === null);
      setChecks(list);
    });
    return () => controller.abort();
  }, [reloadKey]);

  const openCreateOwn = () => {
    void ensureAuthSession().then((ok) => {
      if (ok) navigate(CREATE_OWN_NEXT);
      else navigate(authPathFor(CREATE_OWN_NEXT));
    });
  };

  const slideCount = (checks?.length ?? 0) + 1; // + download CTA

  const onScroll = () => {
    const el = scroller.current;
    if (!el || !checks) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    children.forEach((child, i) => {
      const center = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: ui.cream,
        fontFamily: ui.body,
        color: ui.ink,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          padding: '12px 0 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0 20px' }}>
          <button
            type="button"
            aria-label="Back"
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: ui.ink, padding: 0, lineHeight: 1 }}
          >
            ‹
          </button>
          <h1 style={{ margin: '14px 0 6px', fontFamily: ui.heading, fontSize: 30, fontWeight: 800, letterSpacing: -0.7, lineHeight: 1.15 }}>
            Pick a question for your friends
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: ui.muted }}>Swipe through. Tap one to ask it.</p>
        </div>

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column' }}>
          {failed && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: ui.muted, marginBottom: 12 }}>Could not load live checks.</p>
              <button
                type="button"
                onClick={() => {
                  setChecks(null);
                  setFailed(false);
                  setReloadKey((k) => k + 1);
                }}
                style={{
                  height: 44,
                  padding: '0 18px',
                  borderRadius: 999,
                  border: `1.5px solid ${ui.accent}`,
                  background: 'transparent',
                  color: ui.accent,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
            </div>
          )}

          {!failed && checks === null && (
            <p role="status" style={{ textAlign: 'center', color: ui.muted, marginTop: 48 }}>
              Loading…
            </p>
          )}

          {!failed && checks && (
            <>
              <div
                ref={scroller}
                onScroll={onScroll}
                style={{
                  display: 'flex',
                  gap: 16,
                  overflowX: 'auto',
                  // Extra right/bottom padding so the hard offset border is not clipped.
                  padding: '6px 20px 14px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                }}
              >
                {checks.map((check) => (
                  <LiveCheckCard
                    key={check.id}
                    check={check}
                    onAsk={() => {
                      const createPath = `/check/${check.id}/create`;
                      void ensureAuthSession().then((ok) => {
                        if (ok) navigate(createPath, { state: { check } });
                        else navigate(authPathFor(createPath), { state: { check } });
                      });
                    }}
                  />
                ))}
                <DownloadIdeasCard />
              </div>
              <Dots count={slideCount} active={Math.min(active, slideCount - 1)} />

              {/* Sits directly under the carousel + dots, not pinned to the page footer. */}
              <div style={{ padding: '22px 20px 0' }}>
                <button
                  type="button"
                  onClick={openCreateOwn}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: '#fff',
                    border: '1px solid rgba(27, 20, 24, 0.12)',
                    borderRadius: 20,
                    padding: '13px 14px',
                    cursor: 'pointer',
                    fontFamily: ui.body,
                    color: ui.ink,
                    boxSizing: 'border-box',
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: 'rgba(208, 46, 98, 0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PencilIcon />
                  </span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 16, fontWeight: 800 }}>Create your own</span>
                  <span aria-hidden="true" style={{ color: 'rgba(27, 20, 24, 0.35)', fontSize: 20, fontWeight: 500 }}>
                    ›
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default LiveCheck;
