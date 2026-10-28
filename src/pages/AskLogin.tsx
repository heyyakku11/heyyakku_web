import { useState, type CSSProperties } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { clearPending, loadPending, savePending, sendOtp } from '../lib/checkApi.ts';
import { ck, primaryPill } from '../components/checkUi.tsx';

const NAME_RE = /^.{2,}$/;
const PHONE_RE = /^[6-9]\d{9}$/;

/** The tilted pink card previewing the question, as in the app's AskPreviewCard. */
export function AskPreviewCard({ question, options }: { question: string; options: string[] }) {
  return (
    <div
      style={{
        transform: 'rotate(-4deg)',
        background: ck.pink,
        borderRadius: 22,
        padding: 18,
        boxShadow: '0 10px 22px rgba(217,85,127,0.3)',
        color: '#fff',
        width: '78%',
        margin: '8px auto 0',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontFamily: ck.script, fontSize: 18, opacity: 0.9 }}>Yakku.</div>
      <p style={{ margin: '8px 0 12px', fontFamily: ck.heading, fontSize: 20, fontWeight: 800, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.slice(0, 4).map((text, i) => (
          <div key={i} style={{ height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', padding: '0 10px', overflow: 'hidden' }}>
            <span style={{ filter: 'blur(4px)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const field = (focus: boolean, bad: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  background: '#fff',
  borderRadius: 16,
  border: `1.5px solid ${bad ? ck.error : focus ? ck.accent : '#D9D4D6'}`,
  padding: '0 14px',
  height: 54,
  boxSizing: 'border-box',
});

// Mirrors ask_login_screen.dart ("Who's asking?").
export function AskLogin() {
  const navigate = useNavigate();
  const pending = loadPending();
  const [name, setName] = useState(pending?.name ?? '');
  const [phone, setPhone] = useState(pending?.phone ?? '');
  const [adult, setAdult] = useState(true);
  const [focus, setFocus] = useState<'name' | 'phone' | null>(null);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pending) return <Navigate to="/" replace />;

  const nameBad = touched && !NAME_RE.test(name.trim());
  const phoneBad = touched && !PHONE_RE.test(phone);

  const back = () => {
    if (window.confirm("Discard this check?\n\nIf you go back, your check will be discarded.")) {
      clearPending();
      navigate(-1);
    }
  };

  const submit = async () => {
    setTouched(true);
    setError(null);
    if (!NAME_RE.test(name.trim()) || !PHONE_RE.test(phone)) return;
    if (!adult) {
      setError('You need to be 18 or older to use Yakku.');
      return;
    }
    setSending(true);
    const result = await sendOtp(`+91${phone}`, name.trim());
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    savePending({ ...pending, name: name.trim(), phone });
    navigate('/ask/otp');
  };

  return (
    <div style={{ minHeight: '100vh', background: ck.cream, fontFamily: ck.body, display: 'flex', justifyContent: 'center' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        style={{ width: '100%', maxWidth: 440, padding: '14px 22px 24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <button type="button" aria-label="Back" onClick={back} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: ck.text, padding: 0 }}>
          ←
        </button>
        <AskPreviewCard question={pending.check.question || pending.check.title} options={pending.check.options.map((o) => o.text)} />
        <h1 style={{ margin: '18px 0 0', fontFamily: ck.heading, fontSize: 30, fontWeight: 800, color: ck.text }}>Who's asking?</h1>

        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: ck.muted, marginBottom: 6 }}>First name</span>
          <div style={field(focus === 'name', nameBad)}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus(null)}
              autoComplete="given-name"
              maxLength={40}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontFamily: ck.body, color: ck.text }}
            />
          </div>
          {nameBad && <span style={{ color: ck.error, fontSize: 12.5 }}>Enter at least 2 characters.</span>}
        </label>

        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: ck.muted, marginBottom: 6 }}>Phone number</span>
          <div style={field(focus === 'phone', phoneBad)}>
            <span style={{ fontWeight: 700, color: ck.text, marginRight: 10 }}>+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onFocus={() => setFocus('phone')}
              onBlur={() => setFocus(null)}
              inputMode="numeric"
              autoComplete="tel-national"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontFamily: ck.body, color: ck.text }}
            />
          </div>
          {phoneBad && <span style={{ color: ck.error, fontSize: 12.5 }}>Enter a valid 10-digit mobile number.</span>}
        </label>

        <p style={{ margin: 0, fontSize: 13, color: ck.muted }}>🔒 Code on WhatsApp. Friends never see your number.</p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: ck.text }}>
          <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} style={{ width: 18, height: 18, accentColor: ck.accent }} />
          I'm 18 or older
        </label>

        {error && <p role="alert" style={{ margin: 0, color: ck.error, fontSize: 14, fontWeight: 600 }}>{error}</p>}

        <button type="submit" disabled={sending} style={{ ...primaryPill, background: ck.accent, color: '#fff', marginTop: 8, opacity: sending ? 0.7 : 1 }}>
          {sending ? 'Sending…' : 'Send code'}
        </button>
      </form>
    </div>
  );
}

export default AskLogin;
