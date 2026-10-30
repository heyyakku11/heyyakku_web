import { useParams } from 'react-router-dom';
import { DEFAULT_MIN_VOTES, loadMade } from '../lib/checkApi.ts';
import { ck } from '../components/checkUi.tsx';
import { GooglePlayBadge } from '../components/GooglePlayBadge.tsx';

// Mirrors created_poll_screen.dart ("Your card is live").
export function CreatedCheck() {
  const { shareCode = '' } = useParams<{ shareCode: string }>();
  const made = loadMade(shareCode);

  const minVotes = made?.minVotes ?? DEFAULT_MIN_VOTES;
  const question = made?.question || made?.title || 'Tap to see my card';
  return (
    <div style={{ minHeight: '100vh', background: ck.cream, fontFamily: ck.body, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '36px 22px 28px', boxSizing: 'border-box', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h1 style={{ margin: 0, fontFamily: ck.heading, fontSize: 28, fontWeight: 800, color: ck.text }}>Your card is live</h1>
        <p style={{ margin: 0, fontSize: 14.5, color: ck.muted }}>
          Results show at {minVotes} votes. Send it to at least {minVotes} friends.
        </p>

        <div style={{ transform: 'rotate(4deg)', background: ck.pink, borderRadius: 26, padding: 22, color: '#fff', textAlign: 'left', margin: '14px 14px 18px', boxShadow: '0 12px 26px rgba(217,85,127,0.32)' }}>
          <div style={{ fontFamily: ck.script, fontSize: 20, opacity: 0.9 }}>Yakku.</div>
          <p style={{ margin: '10px 0 14px', fontFamily: ck.heading, fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>{question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(made?.optionTexts ?? []).slice(0, 4).map((text, i) => (
              <div key={i} style={{ height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', padding: '0 12px', overflow: 'hidden' }}>
                <span style={{ filter: 'blur(4px)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 12.5, opacity: 0.9 }}>Tap to answer. They won't know it was you.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <GooglePlayBadge />
        </div>
      </div>
    </div>
  );
}

export default CreatedCheck;
