import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { clearPending, fetchWeeklyChecks, makeCheck, saveMade, savePending, type WeeklyCheck } from '../lib/checkApi.ts';
import { getAccessToken } from '../lib/authStore.ts';
import { bgOf, ck, Eyebrow, LetterBadge, letter, primaryPill, ShareIcon, Sticker } from '../components/checkUi.tsx';

// Mirrors check_detail_screen.dart: pick your own (secret) answer, then "Ask my friends".
export function CheckDetail() {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = (location.state as { check?: WeeklyCheck } | null)?.check;
  const [check, setCheck] = useState<WeeklyCheck | null>(passed && passed.id === checkId ? passed : null);
  const [missing, setMissing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (check) return;
    const controller = new AbortController();
    fetchWeeklyChecks(controller.signal).then((list) => {
      if (controller.signal.aborted) return;
      const found = list?.find((c) => c.id === checkId) ?? null;
      if (found) setCheck(found);
      else setMissing(true);
    });
    return () => controller.abort();
  }, [check, checkId]);

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  if (missing) {
    return (
      <div style={{ minHeight: '100vh', background: ck.cream, fontFamily: ck.body, padding: 24, textAlign: 'center' }}>
        <h1 style={{ fontFamily: ck.heading, fontSize: 22 }}>This check isn't live</h1>
        <p style={{ color: ck.muted }}>It may have ended. New checks drop every Monday.</p>
        <button type="button" onClick={() => navigate('/')} style={{ ...primaryPill, background: ck.ink, color: '#fff', maxWidth: 260, margin: '0 auto' }}>
          Back to Yakku
        </button>
      </div>
    );
  }
  if (!check) {
    return <p role="status" style={{ textAlign: 'center', padding: 48, fontFamily: ck.body, color: ck.muted }}>Loading…</p>;
  }

  const bg = bgOf(check.backgroundColor);
  const question = check.question && check.question.trim() !== check.title.trim() ? check.question : '';
  const question0 = check.question || check.title;

  const send = async () => {
    if (!selected || sending) return;
    setError(null);
    if (!getAccessToken()) {
      savePending({ check, optionId: selected });
      navigate('/ask/login');
      return;
    }
    setSending(true);
    const result = await makeCheck(check.id, selected);
    if (result.ok) {
      clearPending();
      saveMade(result.check);
      navigate(`/created/${result.check.shareCode}`, { replace: true });
      return;
    }
    setSending(false);
    if (result.kind === 'auth-required') {
      savePending({ check, optionId: selected });
      navigate('/ask/login');
      return;
    }
    setError(result.message);
  };

  const onPickHint = () => {
    setHint(true);
    window.setTimeout(() => setHint(false), 1400);
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: ck.body, display: 'flex', justifyContent: 'center' }}>
      <style>{`@keyframes ckSlide{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}@keyframes ckGlow{0%,100%{box-shadow:3px 3px 0 ${ck.ink}}50%{box-shadow:0 0 0 4px rgba(208,46,98,.7),3px 3px 0 ${ck.ink}}}`}</style>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ padding: '14px 22px 0' }}>
          <button type="button" aria-label="Back" onClick={back} style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: ck.text, padding: 0 }}>
            ←
          </button>
        </div>

        <div style={{ flex: 1, padding: '4px 22px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Eyebrow>THIS WEEK'S DROP</Eyebrow>
              <span style={{ fontSize: 13, color: ck.muted }}>Ends Sunday</span>
            </div>
            <Sticker text={check.sticker} size={20} />
          </div>
          <h1 style={{ margin: 0, fontFamily: ck.heading, fontSize: 36, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, color: ck.text }}>
            {check.title || question0}
          </h1>
          {question && <p style={{ margin: 0, fontSize: 26, fontWeight: 600, color: ck.text, lineHeight: 1.2 }}>{question}</p>}

          <div role="radiogroup" aria-label="Your answer" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
            {check.options.map((o, i) => {
              const on = selected === o.id;
              const glow = hint && i === 0 && !selected;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelected(o.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 18,
                    border: `1.6px solid ${ck.ink}`,
                    background: on ? ck.ink : '#fff',
                    color: on ? '#fff' : ck.text,
                    boxShadow: on ? `3px 3px 0 ${ck.accent}` : `3px 3px 0 ${ck.ink}`,
                    fontFamily: ck.body,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    animation: glow ? 'ckGlow 0.7s ease 2' : `ckSlide 0.5s ease ${i * 0.12}s both`,
                  }}
                >
                  <LetterBadge size={32} filled={on}>{letter(i)}</LetterBadge>
                  <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{o.text}</span>
                  {on && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 18,
                border: '1.6px dashed rgba(33,25,29,0.4)',
                color: 'rgba(33,25,29,0.7)',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <LetterBadge size={32} tone="rgba(33,25,29,0.08)">+</LetterBadge>
              Friends can add their own
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {error && (
            <p role="alert" style={{ margin: 0, color: ck.error, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>{error}</p>
          )}
          {selected ? (
            <button type="button" onClick={send} disabled={sending} style={{ ...primaryPill, background: ck.ink, color: '#fff', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending…' : (<><ShareIcon /> Ask my friends</>)}
            </button>
          ) : (
            <button
              type="button"
              onClick={onPickHint}
              style={{ ...primaryPill, background: '#fff', color: ck.text, border: `1.6px solid ${ck.ink}`, boxShadow: `3px 3px 0 ${ck.ink}` }}
            >
              ↑ Pick your answer
            </button>
          )}
          <span style={{ fontSize: 12.5, color: ck.muted }}>🔒 {selected ? 'Only you know your pick' : 'Your pick stays secret'}</span>
        </div>
      </div>
    </div>
  );
}

export default CheckDetail;
