import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { clearPending, loadPending, makeCheck, saveMade, sendOtp, verifyOtp } from '../lib/checkApi.ts';
import { getAccessToken } from '../lib/authStore.ts';
import { ck } from '../components/checkUi.tsx';

// Mirrors ask_otp_screen.dart: six digit boxes, auto-verify on the sixth digit, then make the check.
export function AskOtp() {
  const navigate = useNavigate();
  const pending = loadPending();
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);

  useEffect(() => input.current?.focus(), []);

  if (!pending || !pending.phone) return <Navigate to={pending ? '/ask/login' : '/'} replace />;
  const { phone, check, optionId } = pending;
  const masked = `+91 ${phone.slice(0, 2)}xxx xx${phone.slice(-3)}`;

  const discard = () => {
    clearPending();
    navigate('/', { replace: true });
  };

  const finish = async () => {
    const made = await makeCheck(check.id, optionId);
    if (made.ok) {
      clearPending();
      saveMade(made.check);
      navigate(`/created/${made.check.shareCode}`, { replace: true });
      return;
    }
    setBusy(false);
    inFlight.current = false;
    setOtp('');
    setError(made.kind === 'used' ? `${made.message} Pick another check from the home page.` : made.message);
  };

  const verify = async (code: string) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    if (!getAccessToken()) {
      const result = await verifyOtp(`+91${phone}`, code);
      if (!result.ok) {
        setBusy(false);
        inFlight.current = false;
        setOtp('');
        input.current?.focus();
        if (result.kind === 'too-many') {
          window.alert(`Too many attempts\n\n${result.message}`);
          discard();
          return;
        }
        setError(result.kind === 'invalid' ? 'Invalid code. Check it and try again.' : result.message);
        return;
      }
    }
    await finish();
  };

  const onChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    if (digits.length === 6) void verify(digits);
  };

  const resend = async () => {
    setError(null);
    const result = await sendOtp(`+91${phone}`, pending.name ?? '');
    if (result.ok) setResent(true);
    else setError(result.message);
  };

  return (
    <div style={{ minHeight: '100vh', background: ck.cream, fontFamily: ck.body, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '14px 22px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button type="button" aria-label="Back" onClick={() => navigate('/ask/login')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: ck.text, padding: 0 }}>
          ←
        </button>
        <h1 style={{ margin: '12px 0 0', fontFamily: ck.heading, fontSize: 28, fontWeight: 800, color: ck.text }}>Enter the 6-digit code</h1>
        <p style={{ margin: 0, fontSize: 14, color: ck.muted }}>
          Sent an otp to {masked}.{' '}
          <button type="button" onClick={() => navigate('/ask/login')} style={{ background: 'none', border: 'none', padding: 0, color: ck.accent, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Wrong number?
          </button>
        </p>

        <div style={{ position: 'relative', display: 'flex', gap: 8, justifyContent: 'space-between', margin: '10px 0' }} onClick={() => input.current?.focus()}>
          {Array.from({ length: 6 }).map((_, i) => {
            const active = i === Math.min(otp.length, 5);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 52,
                  height: 56,
                  borderRadius: 18,
                  background: '#fff',
                  border: `1.5px solid ${active ? ck.accent : '#D9D4D6'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 800,
                  color: ck.text,
                }}
              >
                {otp[i] ?? ''}
              </div>
            );
          })}
          <input
            ref={input}
            value={otp}
            onChange={(e) => onChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="6-digit code"
            disabled={busy}
            style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'text' }}
          />
        </div>

        {error && <p role="alert" style={{ margin: 0, color: ck.error, fontSize: 14, fontWeight: 600 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#FFDDE5', borderRadius: 14, padding: '12px 14px', fontSize: 13.5, color: ck.text }}>
          <span aria-hidden="true">🛡️</span>
          Your number keeps Yakku safe. Friends never see it.
        </div>

        <p role="status" style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 13, color: ck.muted }}>
          {busy ? 'Verifying…' : 'Checks by itself when all 6 digits are in'}
        </p>
        <button type="button" onClick={resend} disabled={busy || resent} style={{ background: 'none', border: 'none', color: ck.accent, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: resent ? 0.6 : 1 }}>
          {resent ? 'Code sent again' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

export default AskOtp;
