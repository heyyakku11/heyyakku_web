import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  clearPending,
  fetchWeeklyChecks,
  loadPending,
  makeCheck,
  saveMade,
  savePending,
  type MadeCheck,
  type WeeklyCheck,
} from '../lib/checkApi.ts';
import { CardShareScreen, ShareDestinationRow } from '../components/CardShareScreen.tsx';
import { resolveCheckTheme } from '../lib/checkTheme.ts';
import { androidStoreUrl, iosStoreUrl, mobilePlatform } from '../lib/openApp.ts';
import { authPathFor, ensureAuthSession } from '../lib/sessionAuth.ts';
import { voteAbsoluteUrl } from '../lib/voteLinks.ts';

type Phase = 'guess' | 'share' | 'done';
type Load = { kind: 'loading' } | { kind: 'missing' } | { kind: 'ok'; check: WeeklyCheck };

const ui = {
  accent: '#D02E62',
  ink: '#21191D',
  muted: 'rgba(33, 25, 29, 0.55)',
  cream: '#FFF9F6',
  page: '#FFE8EE',
  gold: '#FFC93C',
  pinkWash: '#F7D5E2',
  mint: '#E3F6EA',
  mintInk: '#1E5B3A',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

/** Same damped swing as the app's GuessSticker (240ms, sin·π·6 × easeOut decay). */
const STICKER_BASE_TILT = -0.07; // radians
const SHAKE_MS = 240;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function shakeAngle(t: number) {
  const decay = 1 - easeOut(t);
  const wave = Math.sin(t * Math.PI * 6) * decay;
  return STICKER_BASE_TILT + wave * 0.16;
}

function letter(i: number) {
  return String.fromCharCode(65 + i);
}

function voteUrl(shareCode: string) {
  return voteAbsoluteUrl(shareCode);
}

function openStore() {
  const platform = mobilePlatform();
  window.open(platform === 'ios' ? iosStoreUrl : androidStoreUrl, '_blank', 'noopener,noreferrer');
}

function Shell({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: bg, fontFamily: ui.body, color: ui.ink, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100dvh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

/** "1 Your guess ──── 2 Ask now" — mirrors GuessStepper. step2 once a guess is picked. */
function Progress({ step2 }: { step2: boolean }) {
  const dot = (n: 1 | 2, label: string, active: boolean, done: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: done ? ui.ink : active ? ui.accent : '#fff',
          color: done || active ? '#fff' : ui.ink,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 800,
          border: !done && !active ? `1.5px solid ${ui.ink}` : 'none',
          boxSizing: 'border-box',
        }}
      >
        {done ? '✓' : n}
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: active ? ui.ink : ui.muted }}>{label}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0 18px' }}>
      {dot(1, 'Your guess', !step2, step2)}
      <span
        style={{
          flex: 1,
          height: 1.5,
          margin: '0 16px',
          background: step2 ? ui.ink : 'rgba(208, 46, 98, 0.2)',
        }}
      />
      {dot(2, 'Ask now', step2, false)}
    </div>
  );
}

function LockIcon({ size = 16, color = ui.accent }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11V8a5 5 0 0110 0v3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4M5 14v4.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Curved hand-drawn arrow from GuessArrow (40×34). */
function GuessArrow() {
  return (
    <svg width="40" height="34" viewBox="0 0 40 34" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 4 }}>
      <path
        d="M3 8C14 2 30 3 33 24"
        stroke={ui.ink}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 18L33 25L38 16"
        stroke={ui.ink}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GuessSticker({ text, angle }: { text: string; angle: number }) {
  return (
    <div
      style={{
        transform: `rotate(${angle}rad)`,
        transformOrigin: 'center center',
        background: ui.gold,
        borderRadius: 10,
        border: `1.5px solid ${ui.ink}`,
        boxShadow: `0 3px 0 ${ui.ink}`,
        padding: '6px 12px',
        fontFamily: ui.script,
        fontSize: 22,
        lineHeight: 1.2,
        color: ui.ink,
        whiteSpace: 'nowrap',
        willChange: 'transform',
      }}
    >
      {text}
    </div>
  );
}

function LinkIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 13a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 4.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 00-7.07 0L4.8 13.12a5 5 0 007.07 7.07L13 19.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Share preview — mirrors app CheckShareCard proportions, border, and option chrome. */
function PreviewCard({ made }: { made: MadeCheck }) {
  const title = made.title.trim();
  const question = made.question.trim() || title;
  const showTitle = !!title && title.toLowerCase() !== question.toLowerCase();
  const options = made.optionTexts.slice(0, 3);
  const friendsLetter = letter(options.length);
  const cardBg = made.backgroundColor || '#FFDFE8';

  return (
    <div
      style={{
        transform: 'rotate(-0.05rad)',
        background: cardBg,
        borderRadius: 24,
        border: `1.5px solid ${ui.ink}`,
        boxShadow: `0 6px 0 ${ui.ink}`,
        padding: '16px 16px 18px',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 300,
        margin: '8px auto 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <span
          style={{
            fontFamily: ui.heading,
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: -0.7,
            lineHeight: 1,
            paddingTop: 4,
            color: ui.ink,
          }}
        >
          Yakku<span style={{ color: ui.accent }}>.</span>
        </span>
        <span
          style={{
            transform: 'rotate(0.07rad)',
            background: '#fff',
            border: `1px solid ${ui.ink}`,
            borderRadius: 6,
            boxShadow: `0 2px 0 ${ui.ink}`,
            padding: '4px 8px',
            fontFamily: ui.script,
            color: ui.accent,
            fontSize: 11,
            lineHeight: 1.15,
            textAlign: 'center',
            whiteSpace: 'pre-line',
          }}
        >
          {'No filters.\nJust truth.'}
        </span>
      </div>

      {showTitle && (
        <p
          style={{
            margin: '14px 0 6px',
            fontFamily: ui.heading,
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: -0.9,
            lineHeight: 1.05,
            color: ui.ink,
          }}
        >
          {title}
        </p>
      )}
      <p
        style={{
          margin: showTitle ? '0 0 14px' : '14px 0',
          fontFamily: ui.heading,
          fontSize: showTitle ? 15 : 22,
          fontWeight: 800,
          letterSpacing: showTitle ? -0.2 : -0.7,
          lineHeight: 1.15,
          color: ui.ink,
        }}
      >
        {question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((text, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              borderRadius: 12,
              padding: '8px 12px 8px 9px',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: ui.pinkWash,
                color: ui.accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {letter(i)}
            </span>
            <span
              style={{
                filter: 'blur(3px)',
                fontSize: 12.5,
                fontWeight: 600,
                color: ui.ink,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'clip',
                flex: 1,
                minWidth: 0,
              }}
            >
              {text}
            </span>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.55)',
            borderRadius: 12,
            padding: '8px 12px 8px 9px',
            border: `1.4px dashed rgba(208, 46, 98, 0.75)`,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              color: ui.ink,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {friendsLetter}
          </span>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: ui.ink }}>Friends add their own</span>
          <span aria-hidden="true" style={{ color: ui.accent, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
            +
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          height: 48,
          borderRadius: 999,
          background: ui.ink,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 15,
          fontWeight: 800,
          boxShadow: '0 2.5px 0 rgba(208, 46, 98, 0.8)',
        }}
      >
        <LinkIcon />
        Answer anonymously
      </div>
    </div>
  );
}

/** Guess → create → share flow for a live weekly check. Requires an active JWT session. */
export function CheckCreate() {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = (location.state as { check?: WeeklyCheck } | null)?.check;
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('guess');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<MadeCheck | null>(null);
  const [stickerAngle, setStickerAngle] = useState(STICKER_BASE_TILT);
  const shakeRaf = useRef<number | null>(null);

  const createPath = `/check/${checkId}/create`;

  useEffect(() => {
    let cancelled = false;
    ensureAuthSession().then((ok) => {
      if (cancelled) return;
      setAuthed(ok);
      setAuthReady(true);
    });
    return () => {
      cancelled = true;
      if (shakeRaf.current != null) cancelAnimationFrame(shakeRaf.current);
    };
  }, []);

  /** App `_nudge`: shake the yellow sticker when Ask now is tapped with no pick. */
  const nudgeSticker = () => {
    if (selected || sending) return;
    if (shakeRaf.current != null) cancelAnimationFrame(shakeRaf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SHAKE_MS);
      setStickerAngle(shakeAngle(t));
      if (t < 1) shakeRaf.current = requestAnimationFrame(tick);
      else {
        shakeRaf.current = null;
        setStickerAngle(STICKER_BASE_TILT);
      }
    };
    shakeRaf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!authReady || !authed || !checkId) return;
    if (passed && passed.id === checkId) {
      setLoad({ kind: 'ok', check: passed });
      const pending = loadPending();
      if (pending?.check.id === checkId) setSelected(pending.optionId);
      return;
    }
    const controller = new AbortController();
    fetchWeeklyChecks(controller.signal).then((list) => {
      if (controller.signal.aborted) return;
      const found = list?.find((c) => c.id === checkId) ?? null;
      if (!found) {
        setLoad({ kind: 'missing' });
        return;
      }
      setLoad({ kind: 'ok', check: found });
      const pending = loadPending();
      if (pending?.check.id === checkId) setSelected(pending.optionId);
    });
    return () => controller.abort();
  }, [authReady, authed, checkId, passed]);

  if (!authReady) {
    return (
      <Shell bg={ui.cream}>
        <p role="status" style={{ textAlign: 'center', marginTop: 48, color: ui.muted }}>
          Loading…
        </p>
      </Shell>
    );
  }

  if (!authed) {
    return <Navigate to={authPathFor(createPath)} replace />;
  }

  if (load.kind === 'loading') {
    return (
      <Shell bg={ui.cream}>
        <p role="status" style={{ textAlign: 'center', marginTop: 48, color: ui.muted }}>
          Loading…
        </p>
      </Shell>
    );
  }

  if (load.kind === 'missing' || !checkId) {
    return (
      <Shell bg={ui.cream}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontFamily: ui.heading, fontSize: 22 }}>This check isn&apos;t live</h1>
          <p style={{ color: ui.muted }}>It may have ended. New checks drop every Monday.</p>
          <Link to="/live-check" style={{ color: ui.accent, fontWeight: 700 }}>
            Back to questions
          </Link>
        </div>
      </Shell>
    );
  }

  const { check } = load;
  const theme = check.theme ?? resolveCheckTheme(undefined, check);
  const bg = theme.background || ui.page;

  const askNow = async () => {
    if (!selected || sending) return;
    setSending(true);
    setError(null);
    const result = await makeCheck(check.id, selected);
    setSending(false);
    if (result.ok) {
      clearPending();
      saveMade(result.check);
      setMade(result.check);
      setPhase('share');
      return;
    }
    if (result.kind === 'auth-required') {
      savePending({ check, optionId: selected });
      navigate(authPathFor(createPath));
      return;
    }
    if (result.kind === 'used') {
      setError(result.message || "You've already created this check. Pick another one.");
      return;
    }
    setError(result.message);
  };

  if (phase === 'done' && made) {
    const url = voteUrl(made.shareCode);
    return (
      <Shell bg={ui.cream}>
        <div style={{ padding: '36px 22px 28px', display: 'flex', flexDirection: 'column', flex: 1, gap: 16 }}>
          <div
            aria-hidden="true"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: ui.mint,
              color: ui.mintInk,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <h1 style={{ margin: 0, fontFamily: ui.heading, fontSize: 30, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.15 }}>
            Sent. Votes are on the way.
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700, color: ui.muted }}>Share with more friends</p>
          <ShareDestinationRow url={url} question={made.question || made.title} />
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              border: '1px solid rgba(27,20,24,0.1)',
              padding: '18px 16px',
              boxShadow: '0 8px 24px rgba(27,20,24,0.06)',
            }}
          >
            <p style={{ margin: 0, fontFamily: ui.heading, fontSize: 18, fontWeight: 800 }}>See your results in the app</p>
            <p style={{ margin: '6px 0 14px', fontSize: 13, color: ui.muted }}>Get Yakku. It opens straight on your card.</p>
            <button
              type="button"
              onClick={openStore}
              style={{
                width: '100%',
                height: 52,
                border: 'none',
                borderRadius: 999,
                background: ui.accent,
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: ui.body,
              }}
            >
              Get Yakku
            </button>
          </div>
          <button
            type="button"
            onClick={() => navigate('/live-check')}
            style={{ background: 'none', border: 'none', color: ui.muted, fontWeight: 700, cursor: 'pointer', padding: 8, fontFamily: ui.body }}
          >
            Stay on the web
          </button>
        </div>
      </Shell>
    );
  }

  if (phase === 'share' && made) {
    const url = voteUrl(made.shareCode);
    return (
      <CardShareScreen
        preview={<PreviewCard made={made} />}
        url={url}
        question={made.question || made.title}
        onBack={() => setPhase('guess')}
        onContinue={() => setPhase('done')}
      />
    );
  }

  const picked = !!selected;
  const optionBtn = (on: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    textAlign: 'left',
    padding: '12px 14px 12px 12px',
    borderRadius: 14,
    border: `1.5px solid ${ui.ink}`,
    background: on ? ui.ink : '#fff',
    color: on ? '#fff' : ui.ink,
    boxShadow: on ? `0 3px 0 ${ui.accent}` : `0 3px 0 ${ui.ink}`,
    fontFamily: ui.body,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'background 140ms ease, color 140ms ease, box-shadow 140ms ease',
  });

  const askEnabled = picked && !sending;

  return (
    <Shell bg={bg}>
      <div style={{ padding: '8px 22px 18px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', boxSizing: 'border-box' }}>
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate('/live-check')}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', padding: 0, color: ui.ink, lineHeight: 1 }}
        >
          ‹
        </button>

        <Progress step2={picked} />

        <span
          style={{
            alignSelf: 'flex-start',
            background: '#fff',
            color: ui.accent,
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.3,
          }}
        >
          {(theme.heading || check.title || 'CHECK').toUpperCase()}
        </span>

        <h1
          style={{
            margin: '12px 0 18px',
            fontFamily: ui.heading,
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: -1.1,
            lineHeight: 1.05,
            color: theme.questionColor || ui.ink,
          }}
        >
          {check.question}
        </h1>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}>
          <GuessSticker text={picked ? 'Your guess' : 'You guess first!'} angle={stickerAngle} />
          <GuessArrow />
        </div>

        <div role="radiogroup" aria-label="Your guess" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {check.options.map((o, i) => {
            const on = selected === o.id;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setSelected(o.id)} style={optionBtn(on)}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: on ? '#fff' : ui.pinkWash,
                    color: on ? ui.ink : ui.accent,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {letter(i)}
                </span>
                <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{o.text}</span>
                {on && (
                  <span aria-hidden="true" style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px 12px 12px',
              borderRadius: 14,
              border: `1.5px dashed rgba(208, 46, 98, 0.7)`,
              background: 'rgba(208, 46, 98, 0.07)',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#fff',
                color: ui.accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              D
            </span>
            <span style={{ flex: 1, color: ui.accent, fontSize: 15, fontWeight: 700 }}>Friends add their own</span>
            <LockIcon />
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 16 }} />

        {error && (
          <p role="alert" style={{ margin: '0 0 10px', color: '#B42318', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <LockIcon size={14} color={ui.ink} />
          <span style={{ fontSize: 12, fontWeight: 700, color: ui.ink }}>Only you see your guess.</span>
        </div>

        <button
          type="button"
          aria-disabled={!askEnabled}
          onClick={() => {
            if (!askEnabled) {
              nudgeSticker();
              return;
            }
            void askNow();
          }}
          style={{
            width: '100%',
            height: 58,
            border: 'none',
            borderRadius: 999,
            background: askEnabled ? ui.accent : 'rgba(208, 46, 98, 0.18)',
            color: askEnabled ? '#fff' : 'rgba(208, 46, 98, 0.45)',
            fontFamily: ui.body,
            fontSize: 17,
            fontWeight: 800,
            cursor: sending ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {sending ? (
            'Creating…'
          ) : (
            <>
              <ShareIcon />
              Ask now
            </>
          )}
        </button>
      </div>
    </Shell>
  );
}

export default CheckCreate;
