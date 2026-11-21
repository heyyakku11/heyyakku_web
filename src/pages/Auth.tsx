import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../lib/checkApi.ts';
import { isLoggedIn } from '../lib/authStore.ts';
import { saveAuthNext, takeAuthNext } from '../lib/authRedirect.ts';

const PHONE_RE = /^[6-9]\d{9}$/;
const RESEND_SECONDS = 120;

const ui = {
  accent: '#D02E62',
  ink: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  label: '#5C3A3E',
  cream: '#FFF9F6',
  error: '#B42318',
  mint: '#E7F4EA',
  mintTitle: '#1F5C3A',
  mintBody: '#3D6B52',
  border: 'rgba(27, 20, 24, 0.14)',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.2l7 2.6v5.4c0 4.4-2.9 7.6-7 9.2-4.1-1.6-7-4.8-7-9.2V5.8l7-2.6z"
        stroke={ui.mintTitle}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.1l1.8 1.8 3.8-3.9"
        stroke={ui.mintTitle}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Phase = 'phone' | 'otp';

function formatPhoneDisplay(digits: string): string {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: ui.cream, fontFamily: ui.body, color: ui.ink, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100dvh', boxSizing: 'border-box', padding: '14px 22px 28px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

const primaryBtn = (disabled: boolean): CSSProperties => ({
  width: '100%',
  height: 56,
  border: 'none',
  borderRadius: 999,
  background: ui.accent,
  color: '#fff',
  fontFamily: ui.body,
  fontSize: 17,
  fontWeight: 700,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.55 : 1,
});

/** Post-vote signup: phone + age consent, then OTP. No ask-back checkbox. */
export function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [adult, setAdult] = useState(true);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const otpInput = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  // Capture return path from ?next= on first load.
  useEffect(() => {
    const next = params.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) saveAuthNext(next);
  }, [params]);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate(takeAuthNext('/'), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (phase === 'otp') otpInput.current?.focus();
  }, [phase]);

  const finish = () => {
    navigate(takeAuthNext('/'), { replace: true });
  };

  const requestCode = async () => {
    setTouched(true);
    setError(null);
    if (!PHONE_RE.test(phone)) return;
    if (!adult) {
      setError('You need to be 18 or older to use Yakku.');
      return;
    }
    setBusy(true);
    const result = await sendOtp(`+91${phone}`);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOtp('');
    setSecondsLeft(RESEND_SECONDS);
    setPhase('otp');
  };

  const verify = async (code: string) => {
    if (inFlight.current || code.length !== 6) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    const result = await verifyOtp(`+91${phone}`, code);
    inFlight.current = false;
    setBusy(false);
    if (!result.ok) {
      setOtp('');
      otpInput.current?.focus();
      if (result.kind === 'too-many') {
        setError(result.message);
        setPhase('phone');
        return;
      }
      setError(result.kind === 'invalid' ? 'Wrong code. Check it and try again.' : result.message);
      return;
    }
    finish();
  };

  const resend = async () => {
    if (secondsLeft > 0 || busy) return;
    setError(null);
    setBusy(true);
    const result = await sendOtp(`+91${phone}`);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOtp('');
    setSecondsLeft(RESEND_SECONDS);
  };

  const phoneBad = touched && !PHONE_RE.test(phone);
  const otpError = !!error && phase === 'otp';

  if (phase === 'otp') {
    return (
      <Shell>
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            setPhase('phone');
            setError(null);
            setOtp('');
          }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: ui.ink, padding: 0, lineHeight: 1 }}
        >
          ‹
        </button>
        <h1 style={{ margin: '18px 0 8px', fontFamily: ui.heading, fontSize: 30, fontWeight: 800, letterSpacing: -0.6 }}>
          Enter the code
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: ui.muted }}>
          Sent to +91 {formatPhoneDisplay(phone)} ·{' '}
          <button
            type="button"
            onClick={() => {
              setPhase('phone');
              setError(null);
              setOtp('');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: ui.accent, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Edit
          </button>
        </p>

        <div
          style={{ position: 'relative', display: 'flex', gap: 8, marginTop: 28, justifyContent: 'space-between' }}
          onClick={() => otpInput.current?.focus()}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 56,
                borderRadius: 14,
                border: `1.6px solid ${otpError ? ui.error : i === Math.min(otp.length, 5) ? ui.accent : ui.border}`,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: ui.heading,
                fontSize: 22,
                fontWeight: 800,
                color: ui.ink,
              }}
            >
              {otp[i] ?? ''}
            </div>
          ))}
          <input
            ref={otpInput}
            value={otp}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="One-time code"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(digits);
              setError(null);
              if (digits.length === 6) void verify(digits);
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, caretColor: 'transparent' }}
          />
        </div>

        {otpError && (
          <p role="alert" style={{ margin: '12px 0 0', color: ui.error, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 14, color: ui.muted, fontWeight: 600 }}>
          {secondsLeft > 0 ? (
            <span>
              Resend in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          ) : (
            <button type="button" onClick={() => void resend()} disabled={busy} style={{ background: 'none', border: 'none', color: ui.accent, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Resend code
            </button>
          )}
        </div>

        <div style={{ flex: 1 }} />
        <button type="button" disabled={busy || otp.length !== 6} onClick={() => void verify(otp)} style={primaryBtn(busy || otp.length !== 6)}>
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <button
        type="button"
        aria-label="Back"
        onClick={() => navigate(-1)}
        style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: ui.ink, padding: 0, lineHeight: 1 }}
      >
        ‹
      </button>
      <h1 style={{ margin: '18px 0 14px', fontFamily: ui.heading, fontSize: 30, fontWeight: 800, letterSpacing: -0.6 }}>
        You&apos;re one step away
      </h1>

      <div
        style={{
          background: ui.mint,
          borderRadius: 22,
          padding: '16px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 4,
        }}
      >
        <span style={{ flexShrink: 0, marginTop: 1 }}>
          <ShieldIcon />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: ui.mintTitle, lineHeight: 1.25 }}>
            Private and anonymous. Always.
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 500, color: ui.mintBody, lineHeight: 1.4 }}>
            Signing up never reveals what you picked. Not to them, not to anyone.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void requestCode();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}
      >
        <div>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: ui.label, marginBottom: 10 }}>
            Phone number
          </span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            <div
              aria-hidden="true"
              style={{
                width: 64,
                height: 54,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                borderRadius: 16,
                border: `1.4px solid ${ui.border}`,
                fontFamily: ui.body,
                fontSize: 16,
                fontWeight: 700,
                color: ui.ink,
                boxSizing: 'border-box',
              }}
            >
              +91
            </div>
            <input
              value={formatPhoneDisplay(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              aria-label="Phone number"
              style={{
                flex: 1,
                minWidth: 0,
                height: 54,
                boxSizing: 'border-box',
                padding: '0 16px',
                background: '#fff',
                borderRadius: 16,
                border: `1.6px solid ${phoneBad ? ui.error : ui.accent}`,
                outline: 'none',
                fontFamily: ui.body,
                fontSize: 16,
                fontWeight: 600,
                color: ui.ink,
                letterSpacing: 0.2,
              }}
            />
          </div>
          {phoneBad && (
            <span style={{ color: ui.error, fontSize: 12.5, marginTop: 6, display: 'block' }}>
              Enter a valid 10-digit mobile number.
            </span>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: ui.ink, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            style={{ width: 20, height: 20, accentColor: ui.accent }}
          />
          I&apos;m 18 or older
        </label>

        {error && phase === 'phone' && (
          <p role="alert" style={{ margin: 0, color: ui.error, fontSize: 14, fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div style={{ flex: 1 }} />

        <button type="submit" disabled={busy} style={primaryBtn(busy)}>
          {busy ? 'Sending…' : 'Send code'}
        </button>
        <p style={{ margin: 0, fontSize: 12, color: ui.muted, textAlign: 'center', lineHeight: 1.45 }}>
          By signing up you agree to the{' '}
          <Link to="/terms" style={{ color: ui.accent, fontWeight: 600, textDecoration: 'none' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/policy" style={{ color: ui.accent, fontWeight: 600, textDecoration: 'none' }}>
            Privacy policy
          </Link>
          , and to get messages from Yakku on SMS and WhatsApp.
        </p>
      </form>
    </Shell>
  );
}

export default Auth;
