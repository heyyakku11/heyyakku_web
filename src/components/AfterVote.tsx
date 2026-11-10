import type { ReactNode } from 'react';
import { ck } from './checkUi.tsx';

export interface AfterVoteAction {
  label: string;
  sub: string;
  onClick: () => void;
}

export interface AfterVoteProps {
  title?: string;
  subtitle?: string;
  /** White call to action ("See what others are saying"). Omit to hide it. */
  seeResults?: AfterVoteAction;
  /** Yellow call to action ("Your Turn"). Omit to hide it. */
  yourTurn?: AfterVoteAction;
  onDismiss: () => void;
  dismissLabel?: string;
  children?: ReactNode;
}

/**
 * The screen shown right after any vote (poll, check or personality card, guest or signed in):
 * a confirmation plus a few call-to-action options. Each voting flow supplies its own actions.
 */
export function AfterVote({
  title = 'Sent. Anonymously.',
  subtitle = "They'll never know it was you.",
  seeResults,
  yourTurn,
  onDismiss,
  dismissLabel = 'Not now',
  children,
}: AfterVoteProps) {
  const cta = (a: AfterVoteAction, bg: string) => (
    <button
      type="button"
      onClick={a.onClick}
      style={{
        width: '100%',
        borderRadius: 20,
        border: 'none',
        background: bg,
        color: ck.ink,
        padding: '16px 12px',
        cursor: 'pointer',
        fontFamily: ck.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <span style={{ fontFamily: ck.heading, fontSize: 20, fontWeight: 800 }}>{a.label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{a.sub}</span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#D02E62', display: 'flex', justifyContent: 'center', fontFamily: ck.body }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100vh', boxSizing: 'border-box', padding: '40px 22px 28px', display: 'flex', flexDirection: 'column' }}>
        <div
          aria-hidden="true"
          style={{ width: 52, height: 52, borderRadius: 14, background: '#E3F6EA', color: '#1E5B3A', fontSize: 26, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          ✓
        </div>
        <h1 role="status" style={{ margin: '14px 0 6px', fontFamily: ck.heading, fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: -0.8, lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{subtitle}</p>
        <div style={{ flex: 1 }}>{children}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {seeResults && cta(seeResults, '#fff')}
          {yourTurn && cta(yourTurn, '#FFC736')}
          <button
            type="button"
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 8, fontFamily: ck.body }}
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AfterVote;
