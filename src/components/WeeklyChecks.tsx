import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeeklyChecks, type WeeklyCheck } from '../lib/checkApi.ts';
import { bgOf, ck, ShareIcon, Sticker } from './checkUi.tsx';

// "This week's drop": every check in one uniform vertical list, shown under the voted card.

export function WeeklyChecks() {
  const navigate = useNavigate();
  const [checks, setChecks] = useState<WeeklyCheck[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchWeeklyChecks(controller.signal).then((list) => {
      if (controller.signal.aborted) return;
      setFailed(list === null);
      setChecks(list);
    });
    return () => controller.abort();
  }, [reloadKey]);

  const open = (check: WeeklyCheck) => navigate(`/check/${check.id}`, { state: { check } });

  if (failed) {
    return (
      <section style={{ marginTop: 28, textAlign: 'center', fontFamily: ck.body }}>
        <p style={{ margin: '0 0 10px', fontSize: 14, color: ck.muted }}>Could not load this week's checks.</p>
        <button
          type="button"
          onClick={() => {
            setChecks(null);
            setFailed(false);
            setReloadKey((k) => k + 1);
          }}
          style={{ border: `1.5px solid ${ck.accent}`, background: 'transparent', color: ck.accent, borderRadius: 20, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}
        >
          Try again
        </button>
      </section>
    );
  }
  if (checks === null) {
    return (
      <p role="status" style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: ck.muted, fontFamily: ck.body }}>
        Loading this week's checks…
      </p>
    );
  }
  if (checks.length === 0) return null;

  const list = checks.filter((c) => !c.used);
  if (list.length === 0) return null;

  return (
    <section style={{ marginTop: 32, fontFamily: ck.body }} aria-label="This week's checks">
      <h2 style={{ margin: '0 0 12px', fontFamily: ck.heading, fontSize: 'clamp(17px, 5vw, 20px)', fontWeight: 800, color: ck.text }}>
        Keep going — this week's drop
      </h2>
      <div style={{ display: 'flex', gap: 'clamp(10px, 3vw, 14px)', width: '100%', minWidth: 0, overflowX: 'auto', padding: '2px 2px 12px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {list.map((c) => (
          <CheckCard key={c.id} check={c} onOpen={() => open(c)} />
        ))}
      </div>
    </section>
  );
}

function CheckCard({ check, onOpen }: { check: WeeklyCheck; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{
        flex: '0 0 clamp(250px, 82%, 340px)',
        scrollSnapAlign: 'start',
        background: bgOf(check.backgroundColor),
        borderRadius: 'clamp(18px, 5vw, 22px)',
        padding: 'clamp(12px, 4vw, 18px)',
        minWidth: 0,
        boxSizing: 'border-box',
        boxShadow: '0 6px 14px rgba(33,25,29,0.08)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Sticker text={check.sticker} size={14} />
      </div>
      <h3 style={{ margin: 0, fontFamily: ck.heading, fontSize: 'clamp(20px, 6vw, 26px)', fontWeight: 800, color: ck.text, lineHeight: 1.15, overflowWrap: 'anywhere' }}>{check.title || check.question}</h3>
      {check.question && check.question !== check.title && (
        <p style={{ margin: 0, fontSize: 'clamp(15px, 4.5vw, 18px)', fontWeight: 800, color: ck.text, overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{check.question}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {check.options.map((o) => (
          <span key={o.id} style={{ background: '#fff', borderRadius: 12, padding: '6px 10px', fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 600, color: ck.text, overflowWrap: 'anywhere', maxWidth: '100%' }}>{o.text}</span>
        ))}
      </div>
      <span style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: ck.ink, color: '#fff', borderRadius: 18, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}>
        <ShareIcon size={14} /> Ask my friends
      </span>
    </div>
  );
}
