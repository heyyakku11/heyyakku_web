import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_MIN_VOTES, loadMade } from '../lib/checkApi.ts';
import { ck, primaryPill } from '../components/checkUi.tsx';

function siteOrigin(): string {
  const configured = (import.meta.env.VITE_WEBSITE_URL ?? '').replace(/\/+$/, '');
  return configured || window.location.origin;
}

function Circle({ label, bg, color = '#fff', onClick, children }: { label: string; bg: string; color?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: ck.body }}>
      <span style={{ width: 48, height: 48, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>{children}</span>
      <span style={{ fontSize: 11.5, color: ck.muted, maxWidth: 62, lineHeight: 1.2 }}>{label}</span>
    </button>
  );
}

// Mirrors created_poll_screen.dart ("Your card is live").
export function CreatedCheck() {
  const { shareCode = '' } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const made = loadMade(shareCode);
  const [toast, setToast] = useState<string | null>(null);

  const minVotes = made?.minVotes ?? DEFAULT_MIN_VOTES;
  const question = made?.question || made?.title || 'Tap to see my card';
  const link = `${siteOrigin()}/vote/${shareCode}`;
  const text = `${question}\nAnswer anonymously on Yakku: ${link}`;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      flash('Link Copied!');
    } catch {
      window.prompt('Copy this link', link);
    }
  };
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
  // Instagram and Snapchat have no web share URL: use the native sheet when present, else copy the link.
  const viaSheetOrCopy = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Yakku', text: question, url: link });
        return;
      } catch {
        /* cancelled: fall back to copying */
      }
    }
    await copy();
  };

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
            {Array.from({ length: Math.min(Math.max(made?.optionTexts.length ?? 3, 2), 4) }).map((_, i) => (
              <div key={i} style={{ height: 16, borderRadius: 9, background: 'rgba(255,255,255,0.28)', width: `${92 - i * 12}%` }} />
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 12.5, opacity: 0.9 }}>Tap to answer. They won't know it was you.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
          <Circle label="Instagram DM" bg="linear-gradient(45deg,#F9A03F,#E1306C,#833AB4)" onClick={viaSheetOrCopy}>◎</Circle>
          <Circle label="WhatsApp" bg="#25D366" onClick={() => open(`https://wa.me/?text=${encodeURIComponent(text)}`)}>✆</Circle>
          <Circle label="Snapchat" bg="#FFFC00" color="#000" onClick={viaSheetOrCopy}>👻</Circle>
          <Circle label="Facebook" bg="#1877F2" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`)}>f</Circle>
          <Circle label="Copy link" bg={ck.ink} onClick={copy}>🔗</Circle>
        </div>

        <button
          type="button"
          onClick={viaSheetOrCopy}
          style={{ ...primaryPill, height: 56, borderRadius: 30, color: '#fff', background: 'linear-gradient(90deg,#D02E62,#E8715A)', marginTop: 10 }}
        >
          Share your card
        </button>
        <Link to="/" onClick={() => navigate('/')} style={{ color: ck.accent, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginTop: 4 }}>
          Share later
        </Link>

        {toast && (
          <div role="status" style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: ck.ink, color: '#fff', borderRadius: 20, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatedCheck;
