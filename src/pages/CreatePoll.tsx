import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  createTextPoll,
  MAX_OPTIONS,
  MIN_OPTIONS,
  OPTION_MAX,
  QUESTION_MAX,
  type CreatedPoll,
} from '../lib/pollCreateApi.ts';
import { CardShareScreen, ShareDestinationRow } from '../components/CardShareScreen.tsx';
import { DEFAULT_CARD_THEME } from '../lib/defaultCardTheme.ts';
import { authPathFor, ensureAuthSession } from '../lib/sessionAuth.ts';
import { voteAbsoluteUrl } from '../lib/voteLinks.ts';
import { androidStoreUrl, iosStoreUrl, mobilePlatform } from '../lib/openApp.ts';

type Phase = 'edit' | 'guess' | 'share' | 'done';

/** Exact YakkuPalette + AppSpacing / AppRadii from create_screen.dart */
const ui = {
  primary: '#D02E62',
  accent: '#D02E62',
  ink: '#21191D',
  textPrimary: '#21191D',
  textSecondary: '#7C6466',
  muted: '#7C6466',
  cream: '#FFF9F6',
  page: '#FFE8EE',
  white: '#FFFFFF',
  stepInactive: '#E5DCDF',
  line: '#E5DCDF',
  pinkWash: '#F7D5E2',
  pinkMist: '#FCE8EF',
  placeholder: '#B0A4A7',
  mutedMauve: '#D0C6C8',
  grey600: '#757575',
  gold: '#FFC93C',
  mint: '#E3F6EA',
  mintInk: '#1E5B3A',
  error: '#FF5252',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

const space = { sm: 8, md: 12, lg: 16, xl: 24, screen: 10 } as const;
const radii = { md: 12, lg: 16, xl: 24, full: 999 } as const;

const QUESTION_PLACEHOLDERS = [
  'Would you trust me with a secret?',
  'Should I text them first?',
  'Main group mein funny wala hoon ya serious?',
  'Pineapple on pizza is elite.',
];

const DUPLICATE_MESSAGE = 'This option is already used';
const FRIENDS_TOOLTIP = "This spot is for your friends' own options.";
const SCREEN_SHAKE_MS = 450;

const STICKER_BASE_TILT = -0.07;
const SHAKE_MS = 240;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function shakeAngle(t: number) {
  const decay = 1 - easeOut(t);
  return STICKER_BASE_TILT + Math.sin(t * Math.PI * 6) * decay * 0.16;
}

function letter(i: number) {
  return String.fromCharCode(65 + i);
}

function capitalizeOption(text: string) {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function LockIcon({ size = 18, color = ui.primary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 11V8a5 5 0 0110 0v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="10" rx="2.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon({ size = 22, color = ui.textPrimary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** App _DashedRoundedRectPainter (stroke 1.2, dash ~5/3.5). */
function DashedRoundRect({
  color,
  radius,
  children,
  style,
}: {
  color: string;
  radius: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: radius,
        border: `1.2px dashed ${color}`,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** App _TypingPlaceholder — type / pause / delete loop. */
function TypingPlaceholder({ phrases, active }: { phrases: string[]; active: boolean }) {
  const [visible, setVisible] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!active) return;
    const phrase = phrases[phraseIndex % phrases.length] ?? '';
    let timer: number;

    if (!deleting) {
      if (visible.length < phrase.length) {
        timer = window.setTimeout(() => setVisible(phrase.slice(0, visible.length + 1)), 45);
      } else {
        timer = window.setTimeout(() => setDeleting(true), 1500);
      }
    } else if (visible.length > 0) {
      timer = window.setTimeout(() => setVisible(visible.slice(0, -1)), 25);
    } else {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
    }

    return () => window.clearTimeout(timer);
  }, [active, deleting, phraseIndex, phrases, visible]);

  if (!active) return null;
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        fontFamily: ui.heading,
        fontSize: 22,
        fontWeight: 600,
        lineHeight: 1.35,
        color: ui.placeholder,
      }}
    >
      {visible}
    </span>
  );
}

function Shell({ bg = ui.cream, children }: { bg?: string; children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: bg, fontFamily: ui.body, color: ui.ink, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100dvh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
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

/** Curved hand-drawn arrow — same as CheckCreate GuessArrow. */
function GuessArrow() {
  return (
    <svg width="40" height="34" viewBox="0 0 40 34" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 4 }}>
      <path d="M3 8C14 2 30 3 33 24" stroke={ui.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 18L33 25L38 16" stroke={ui.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
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

function openStore() {
  const platform = mobilePlatform();
  window.open(platform === 'ios' ? iosStoreUrl : androidStoreUrl, '_blank', 'noopener,noreferrer');
}

function LinkIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 007.07 0l2.12-2.12a5 5 0 00-7.07-7.07L11 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 11a5 5 0 00-7.07 0L4.8 13.12a5 5 0 007.07 7.07L13 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Auth-gated create-your-own poll: edit → guess → share. */
export function CreatePoll() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [phase, setPhase] = useState<Phase>('edit');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(() => Array.from({ length: MIN_OPTIONS }, () => ''));
  const [selected, setSelected] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poll, setPoll] = useState<CreatedPoll | null>(null);
  const [stickerAngle, setStickerAngle] = useState(STICKER_BASE_TILT);
  const [focusedOption, setFocusedOption] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [stopPlaceholder, setStopPlaceholder] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const shakeRaf = useRef<number | null>(null);
  const screenShakeRaf = useRef<number | null>(null);
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const optionRefs = useRef<(HTMLInputElement | null)[]>([]);
  const createPath = '/create';

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
      if (screenShakeRaf.current != null) cancelAnimationFrame(screenShakeRaf.current);
    };
  }, []);

  const showOptions = question.trim().length > 0;
  const showAddOption =
    showOptions && (options[0]?.trim().length > 0 || options.length > MIN_OPTIONS);

  const filledOptions = options.map((o) => o.trim()).filter(Boolean);
  const optionsFilled =
    filledOptions.length >= MIN_OPTIONS &&
    options.slice(0, MIN_OPTIONS).every((o) => o.trim().length > 0);

  const hasDuplicate = (() => {
    const seen = new Set<string>();
    for (const o of options) {
      const t = o.trim().toLowerCase();
      if (!t) continue;
      if (seen.has(t)) return true;
      seen.add(t);
    }
    return false;
  })();

  const duplicateErrorFor = (index: number): string | null => {
    const text = options[index]?.trim() ?? '';
    if (!text) return null;
    const normalized = text.toLowerCase();
    for (let i = 0; i < options.length; i++) {
      if (i === index) continue;
      if (options[i]?.trim().toLowerCase() === normalized) return DUPLICATE_MESSAGE;
    }
    return null;
  };

  const canSave =
    question.trim().length > 0 &&
    question.trim().length <= QUESTION_MAX &&
    optionsFilled &&
    !hasDuplicate &&
    filledOptions.every((o) => o.length <= OPTION_MAX);

  const runScreenShake = () => {
    if (screenShakeRaf.current != null) cancelAnimationFrame(screenShakeRaf.current);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SCREEN_SHAKE_MS);
      setScreenShake(Math.sin(t * Math.PI * 8) * (1 - t) * 8);
      if (t < 1) screenShakeRaf.current = requestAnimationFrame(tick);
      else {
        screenShakeRaf.current = null;
        setScreenShake(0);
      }
    };
    screenShakeRaf.current = requestAnimationFrame(tick);
  };

  const focusMissingField = () => {
    if (!question.trim()) {
      questionRef.current?.focus();
      return;
    }
    for (let i = 0; i < Math.min(MIN_OPTIONS, options.length); i++) {
      if (!options[i]?.trim()) {
        optionRefs.current[i]?.focus();
        return;
      }
    }
  };

  const nudge = () => {
    if (selected != null || sending) return;
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

  const onQuestionChange = (value: string) => {
    if (value.length > 0) setStopPlaceholder(true);
    const reveal = value.trim().length > 0;
    setQuestion(value);
    if (!reveal && options.some((o) => o.length > 0)) {
      setOptions(Array.from({ length: MIN_OPTIONS }, () => ''));
    }
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions([...options, '']);
    window.requestAnimationFrame(() => {
      optionRefs.current[options.length]?.focus();
    });
  };

  const goGuess = () => {
    setError(null);
    if (!question.trim() || !optionsFilled) {
      setShowErrors(true);
      runScreenShake();
      focusMissingField();
      return;
    }
    if (hasDuplicate) {
      setError(DUPLICATE_MESSAGE);
      return;
    }
    if (question.trim().length > QUESTION_MAX) {
      setError(`Question must be at most ${QUESTION_MAX} characters.`);
      return;
    }
    if (filledOptions.some((o) => o.length > OPTION_MAX)) {
      setError(`Each option must be at most ${OPTION_MAX} characters.`);
      return;
    }
    setShowErrors(false);
    setOptions(options.map((o) => capitalizeOption(o)).filter((o) => o.trim()));
    setSelected(null);
    setPhase('guess');
  };

  const askNow = async () => {
    if (selected == null || sending) return;
    setSending(true);
    setError(null);
    const result = await createTextPoll({
      question: question.trim(),
      options: options.map((o) => o.trim()).filter(Boolean),
      selectedOptionIndex: selected,
    });
    setSending(false);
    if (result.ok) {
      setPoll(result.poll);
      setPhase('share');
      return;
    }
    if (result.kind === 'auth-required') {
      navigate(authPathFor(createPath));
      return;
    }
    setError(result.message);
  };

  if (!authReady) {
    return (
      <Shell>
        <p role="status" style={{ textAlign: 'center', marginTop: 48, color: ui.muted }}>
          Loading…
        </p>
      </Shell>
    );
  }

  if (!authed) {
    return <Navigate to={authPathFor(createPath)} replace />;
  }

  if (phase === 'done' && poll) {
    const url = voteAbsoluteUrl(poll.shareCode);
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
          <ShareDestinationRow url={url} question={poll.question} />
          <div style={{ flex: 1 }} />
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

  if (phase === 'share' && poll) {
    const url = voteAbsoluteUrl(poll.shareCode);
    return (
      <CardShareScreen
        preview={<PreviewCard poll={poll} />}
        url={url}
        question={poll.question}
        onBack={() => setPhase('guess')}
        onContinue={() => setPhase('done')}
      />
    );
  }

  if (phase === 'guess') {
    const filled = options.map((o) => o.trim()).filter(Boolean);
    const picked = selected != null;
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
      <Shell bg={ui.page}>
        <div style={{ padding: '8px 22px 18px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100dvh', boxSizing: 'border-box' }}>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setPhase('edit')}
            style={{
              alignSelf: 'flex-start',
              width: 40,
              height: 40,
              border: 'none',
              background: 'transparent',
              fontSize: 22,
              cursor: 'pointer',
              color: ui.ink,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
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
            YOUR QUESTION
          </span>

          <h1
            style={{
              margin: '12px 0 18px',
              fontFamily: ui.heading,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: -1.1,
              lineHeight: 1.05,
              color: ui.ink,
            }}
          >
            {question.trim()}
          </h1>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}>
            <GuessSticker text={picked ? 'Your guess' : 'You guess first!'} angle={stickerAngle} />
            <GuessArrow />
          </div>

          <div role="radiogroup" aria-label="Your guess" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filled.map((text, i) => {
              const on = selected === i;
              return (
                <button key={i} type="button" role="radio" aria-checked={on} onClick={() => setSelected(i)} style={optionBtn(on)}>
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
                  <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{text}</span>
                  {on && (
                    <span aria-hidden="true" style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            <FriendsAddRow />
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
                nudge();
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

  // —— Edit form: mirrors CreatePollSheet layout / colors / spacing ——
  const questionError = showErrors && !question.trim();
  const nearQuestionLimit = question.length >= Math.floor(QUESTION_MAX * 0.85);
  const showTypingPlaceholder = !stopPlaceholder && question.length === 0;

  return (
    <Shell bg={ui.cream}>
      <style>{`
        .create-poll-opt::placeholder {
          color: ${ui.placeholder};
          font-weight: 500;
          opacity: 1;
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          transform: screenShake ? `translateX(${screenShake}px)` : undefined,
        }}
      >
        {/* Header — EdgeInsets.fromLTRB(screen, 12, screen, sm) */}
        <div style={{ padding: `12px ${space.screen}px ${space.sm}px` }}>
          <button
            type="button"
            aria-label="Close"
            onClick={() => navigate('/live-check')}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scroll body — EdgeInsets.fromLTRB(screen, sm, screen, lg) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: `${space.sm}px ${space.screen}px ${space.lg}px`,
            boxSizing: 'border-box',
          }}
        >
          {/* _QuestionCard */}
          <div
            style={{
              width: '100%',
              background: ui.white,
              borderRadius: 18,
              padding: '16px 16px 12px',
              border: `${questionError ? 1.8 : 1.2}px solid ${questionError ? ui.error : ui.primary}`,
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', minHeight: 22 * 1.35 * 3 }}>
              <TypingPlaceholder phrases={QUESTION_PLACEHOLDERS} active={showTypingPlaceholder} />
              <textarea
                ref={questionRef}
                value={question}
                maxLength={QUESTION_MAX}
                placeholder=""
                onChange={(e) => onQuestionChange(e.target.value)}
                rows={3}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: ui.heading,
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: ui.textPrimary,
                  background: 'transparent',
                  boxSizing: 'border-box',
                  caretColor: ui.primary,
                  padding: 0,
                  margin: 0,
                }}
              />
            </div>
            {nearQuestionLimit && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: ui.textSecondary, textAlign: 'right' }}>
                {question.length}/{QUESTION_MAX}
              </p>
            )}
          </div>

          {/* Options reveal once question has text — top: md */}
          {showOptions && (
            <div style={{ marginTop: space.md }}>
              {options.map((value, i) => {
                const highlight = showErrors && i < MIN_OPTIONS && !value.trim();
                const focused = focusedOption === i;
                const borderColor = highlight ? ui.error : focused ? ui.primary : ui.stepInactive;
                const borderWidth = highlight ? 1.8 : focused ? 1.5 : 1;
                const nearOptLimit = value.length >= Math.floor(OPTION_MAX * 0.85);
                const dup = duplicateErrorFor(i);
                return (
                  <div key={i} style={{ marginBottom: space.sm }}>
                    {/* _OptionRow */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: ui.white,
                        borderRadius: 14,
                        padding: '4px 8px 4px 10px',
                        border: `${borderWidth}px solid ${borderColor}`,
                        boxSizing: 'border-box',
                        transition: 'border-color 200ms ease',
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: ui.pinkWash,
                          color: ui.primary,
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
                      <input
                        ref={(el) => {
                          optionRefs.current[i] = el;
                        }}
                        className="create-poll-opt"
                        value={value}
                        maxLength={OPTION_MAX}
                        placeholder={`Option ${letter(i)}`}
                        onFocus={() => setFocusedOption(i)}
                        onBlur={() => setFocusedOption(null)}
                        onChange={(e) => {
                          const next = [...options];
                          next[i] = e.target.value;
                          setOptions(next);
                        }}
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontFamily: ui.body,
                          fontSize: 16,
                          fontWeight: 600,
                          color: ui.textPrimary,
                          background: 'transparent',
                          minWidth: 0,
                          marginLeft: 10,
                          padding: '10px 0',
                          caretColor: ui.primary,
                        }}
                      />
                      {nearOptLimit && (
                        <span style={{ fontSize: 10, color: ui.textSecondary, paddingLeft: 4, flexShrink: 0 }}>
                          {value.length}/{OPTION_MAX}
                        </span>
                      )}
                    </div>
                    {dup && (
                      <p style={{ margin: '4px 0 0 12px', fontSize: 12, color: ui.error }}>{dup}</p>
                    )}
                  </div>
                );
              })}

              {/* _AddOptionButton */}
              {showAddOption && options.length < MAX_OPTIONS && (
                <div style={{ marginBottom: space.sm }}>
                  <button
                    type="button"
                    onClick={addOption}
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      border: `1.2px dashed ${ui.mutedMauve}`,
                      borderRadius: 14,
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontFamily: ui.body,
                      fontSize: 16,
                      fontWeight: 600,
                      color: ui.grey600,
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                    Add another option
                  </button>
                </div>
              )}

              <FriendsAddRow />
            </div>
          )}
        </div>

        {error && (
          <p role="alert" style={{ margin: `0 ${space.screen}px ${space.sm}px`, color: '#B42318', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* _SaveFooter — fromLTRB(screen, 8, screen, 16) height 56 */}
        <div style={{ padding: `8px ${space.screen}px 16px` }}>
          <button
            type="button"
            onClick={goGuess}
            style={{
              width: '100%',
              height: 56,
              border: 'none',
              borderRadius: radii.full,
              background: canSave ? ui.primary : 'rgba(208, 46, 98, 0.4)',
              color: ui.white,
              fontFamily: ui.body,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 250ms ease',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Shell>
  );
}

/** App _FriendsSlot */
function FriendsAddRow() {
  return (
    <DashedRoundRect
      color="rgba(208, 46, 98, 0.7)"
      radius={14}
      style={{ background: ui.pinkMist }}
    >
      <div
        title={FRIENDS_TOOLTIP}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '12px 10px',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: ui.white,
            color: ui.primary,
            border: `1.2px solid ${ui.primary}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          D
        </span>
        <span style={{ flex: 1, marginLeft: 10, color: ui.textPrimary, fontSize: 16, fontWeight: 600 }}>
          Friends add their own
        </span>
        <LockIcon size={18} color={ui.primary} />
      </div>
    </DashedRoundRect>
  );
}

/** Same GuessStepper as CheckCreate. */
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

/** Share preview for user-written polls — default POLL card theme. */
function PreviewCard({ poll }: { poll: CreatedPoll }) {
  const theme = DEFAULT_CARD_THEME;
  const title = theme.heading;
  const question = poll.question.trim();
  const options = poll.optionTexts.slice(0, 3);
  const friendsLetter = letter(options.length);
  const cardBg = poll.backgroundColor || theme.backgroundColor;

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
            color: theme.labelColor,
            fontSize: 11,
            lineHeight: 1.15,
            textAlign: 'center',
            whiteSpace: 'pre-line',
          }}
        >
          {'No filters.\nJust truth.'}
        </span>
      </div>

      <p
        style={{
          margin: '14px 0 6px',
          fontFamily: ui.heading,
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: -0.9,
          lineHeight: 1.05,
          color: theme.labelColor,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: '0 0 14px',
          fontFamily: ui.heading,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: -0.2,
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

export default CreatePoll;
