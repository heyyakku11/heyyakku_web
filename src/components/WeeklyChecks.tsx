import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeeklyChecks, type WeeklyCheck } from '../lib/checkApi.ts';
import { bgOf, ck, Eyebrow, LetterBadge, letter, ShareIcon, Sticker } from './checkUi.tsx';

// "This week's drop": the app's Home feed (featured card + "More checks"), shown under the voted card.

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

  const featured = checks[0];
  const more = checks.slice(1).filter((c) => !c.used);

  return (
    <section style={{ marginTop: 32, fontFamily: ck.body }} aria-label="This week's checks">
      <h2 style={{ margin: '0 0 12px', fontFamily: ck.heading, fontSize: 20, fontWeight: 800, color: ck.text }}>
        Keep going — this week's drop
      </h2>

      {featured.used ? <DoneCard check={featured} /> : <FeaturedCard check={featured} onOpen={() => open(featured)} />}

      {more.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '26px 0 12px' }}>
            <h3 style={{ margin: 0, fontFamily: ck.heading, fontSize: 20, fontWeight: 800, color: ck.text }}>More checks</h3>
            <span style={{ fontSize: 13, color: ck.muted }}>New every Monday</span>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 2px 12px', scrollSnapType: 'x mandatory' }}>
            {more.map((c) => (
              <SubCard key={c.id} check={c} onOpen={() => open(c)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function FeaturedCard({ check, onOpen }: { check: WeeklyCheck; onOpen: () => void }) {
  const showQuestion = check.question && check.question.trim() !== check.title.trim();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{
        background: bgOf(check.backgroundColor),
        borderRadius: 28,
        padding: '18px 18px 16px',
        boxShadow: '0 8px 18px rgba(33,25,29,0.08)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>THIS WEEK'S DROP</Eyebrow>
          <span style={{ fontSize: 13, color: ck.muted }}>Ends Sunday</span>
        </div>
        <Sticker text={check.sticker} />
      </div>
      <h3 style={{ margin: 0, fontFamily: ck.heading, fontSize: 34, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1, color: ck.text }}>
        {check.title || check.question}
      </h3>
      {showQuestion && <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: ck.text }}>{check.question}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {check.options.map((o, i) => (
          <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '10px 12px', fontSize: 15, fontWeight: 600, color: ck.text }}>
            <LetterBadge>{letter(i)}</LetterBadge>
            <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{o.text}</span>
            <span style={{ color: ck.muted, fontWeight: 700 }}>??%</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed rgba(33,25,29,0.35)', borderRadius: 14, padding: '10px 12px', fontSize: 15, fontWeight: 600, color: 'rgba(33,25,29,0.7)' }}>
          <LetterBadge tone="transparent">{letter(check.options.length)}</LetterBadge>
          Friends add one
        </div>
      </div>
      <AskButton />
    </div>
  );
}

function AskButton() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 14, background: ck.ink, color: '#fff', fontWeight: 700, fontSize: 15 }}>
      <ShareIcon size={16} /> Ask my friends
    </span>
  );
}

function SubCard({ check, onOpen }: { check: WeeklyCheck; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{
        flex: '0 0 82%',
        maxWidth: 340,
        minHeight: 280,
        scrollSnapAlign: 'start',
        background: bgOf(check.backgroundColor),
        borderRadius: 22,
        padding: 16,
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
      <h3 style={{ margin: 0, fontFamily: ck.heading, fontSize: 24, fontWeight: 800, color: ck.text, lineHeight: 1.15 }}>{check.title || check.question}</h3>
      {check.question && check.question !== check.title && (
        <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: ck.text, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{check.question}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {check.options.map((o) => (
          <span key={o.id} style={{ background: '#fff', borderRadius: 12, padding: '6px 10px', fontSize: 13, fontWeight: 600, color: ck.text }}>{o.text}</span>
        ))}
      </div>
      <span style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: ck.ink, color: '#fff', borderRadius: 18, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}>
        <ShareIcon size={14} /> Ask my friends
      </span>
    </div>
  );
}

function DoneCard({ check }: { check: WeeklyCheck }) {
  return (
    <div style={{ background: bgOf(check.backgroundColor), borderRadius: 28, padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3 style={{ margin: 0, fontFamily: ck.heading, fontSize: 24, fontWeight: 800, color: ck.text }}>{check.title || check.question} done</h3>
      <p style={{ margin: 0, fontSize: 14, color: ck.muted }}>Your result shows as friends vote.</p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: ck.text }}>
        <span style={{ background: '#000', color: '#fff', borderRadius: 8, padding: '2px 8px', marginRight: 8 }}>MON</span>
        a brand-new check, Monday
      </p>
    </div>
  );
}
