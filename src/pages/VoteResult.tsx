import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { isLoggedIn } from '../lib/authStore.ts';
import { saveAuthNext } from '../lib/authRedirect.ts';
import {
  fetchSharedContent,
  isShareCode,
  resultsLocked,
  type SharedContentDto,
} from '../lib/pollApi.ts';
import { voteResultPath } from '../lib/voteLinks.ts';

type Load = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; content: SharedContentDto };

const ui = {
  accent: '#D02E62',
  ink: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  cream: '#F7F2EE',
  night: '#1A1718',
  yellow: '#F5C518',
  pink: '#E84A7F',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', background: ui.cream, fontFamily: ui.body, color: ui.ink, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100dvh', boxSizing: 'border-box', padding: '22px 18px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

/** Same vs against counts from the voter's pick once results are visible. */
export function comparisonStats(content: SharedContentDto): { same: number; against: number; total: number } | null {
  if (resultsLocked(content) || !content.voting.hasVoted) return null;
  const total = content.stats.totalVotes ?? 0;
  const my = content.voting.myVote;
  let same = 0;
  if (my?.customAnswer) {
    same = content.stats.customAnswerCount ?? 0;
  } else if (my?.optionId) {
    same = content.options.find((o) => o.id === my.optionId)?.voteCount ?? 0;
  }
  same = Math.max(0, Math.min(same, total));
  return { same, against: Math.max(0, total - same), total };
}

function ComparisonCard({ same, against, total }: { same: number; against: number; total: number }) {
  const samePct = total > 0 ? (same / total) * 100 : 50;
  return (
    <div
      style={{
        position: 'relative',
        background: ui.night,
        borderRadius: 28,
        padding: '36px 20px 20px',
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: -12,
          left: 18,
          transform: 'rotate(-8deg)',
          background: ui.yellow,
          color: ui.ink,
          fontFamily: ui.script,
          fontSize: 22,
          padding: '4px 16px 6px',
          borderRadius: 999,
          lineHeight: 1,
        }}
      >
        You
      </span>
      <span
        style={{
          position: 'absolute',
          top: -10,
          right: 18,
          transform: 'rotate(7deg)',
          background: ui.pink,
          color: ui.ink,
          fontFamily: ui.script,
          fontSize: 22,
          padding: '4px 14px 6px',
          borderRadius: 999,
          lineHeight: 1,
        }}
      >
        Others
      </span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: ui.heading, fontSize: 56, fontWeight: 800, color: ui.yellow, lineHeight: 1, letterSpacing: -1.5 }}>
            {same}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>said the same</div>
        </div>
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#fff',
            color: ui.ink,
            fontWeight: 800,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          vs
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: ui.heading, fontSize: 56, fontWeight: 800, color: ui.pink, lineHeight: 1, letterSpacing: -1.5 }}>
            {against}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>said against</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          height: 14,
          borderRadius: 999,
          overflow: 'hidden',
          display: 'flex',
          background: 'rgba(255,255,255,0.12)',
        }}
      >
        <div style={{ width: `${samePct}%`, background: ui.yellow, minWidth: same > 0 ? 8 : 0 }} />
        <div style={{ flex: 1, background: ui.pink }} />
      </div>
      <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
        {total === 1 ? '1 friend answered' : `${total} friends answered`}
      </p>
    </div>
  );
}

function PendingCard() {
  return (
    <div
      style={{
        background: ui.night,
        borderRadius: 28,
        padding: '22px 20px',
        color: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: ui.yellow,
          color: ui.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        ⏱
      </div>
      <h1 style={{ margin: 0, fontFamily: ui.heading, fontSize: 26, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.15 }}>
        Your score is on the way
      </h1>
      <p style={{ margin: '8px 0 0', fontSize: 15, color: 'rgba(255,255,255,0.55)' }}>We&apos;ll notify you.</p>
    </div>
  );
}

function YourTurnCard({ onPick }: { onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: ui.accent,
        border: '2.5px solid #111',
        borderRadius: 28,
        padding: '18px 18px 16px',
        color: '#fff',
        cursor: 'pointer',
        fontFamily: ui.body,
        boxShadow: '4px 4px 0 #111',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: ui.script, fontSize: 22 }}>Your turn</span>
        <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 700 }}>
          ›
        </span>
      </div>
      <p style={{ margin: '10px 0 16px', fontFamily: ui.heading, fontSize: 24, fontWeight: 800, lineHeight: 1.15, letterSpacing: -0.4 }}>
        What would your friends say about you?
      </p>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#fff',
          color: ui.ink,
          borderRadius: 999,
          padding: '10px 16px',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        Pick a question
      </span>
    </button>
  );
}

/**
 * Post-signup voter result for a share link: comparison when unlocked, or "score on the way".
 * Requires a signed-in session so the API can return this voter's pick and unlocked tallies.
 */
export function VoteResult() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('share_code') ?? undefined;
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isShareCode(shareCode) || !isLoggedIn()) return;
    const controller = new AbortController();
    fetchSharedContent(shareCode, controller.signal, 'session').then((result) => {
      if (controller.signal.aborted) return;
      setLoad(result.kind === 'ok' ? result : { kind: result.kind });
    });
    return () => controller.abort();
  }, [shareCode, reloadKey]);

  if (!isShareCode(shareCode)) {
    return <Navigate to="/" replace />;
  }

  if (!isLoggedIn()) {
    const next = voteResultPath(shareCode);
    saveAuthNext(next);
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />;
  }

  if (load.kind === 'loading') {
    return (
      <Shell>
        <p role="status" style={{ textAlign: 'center', color: ui.muted, marginTop: 48 }}>
          Loading…
        </p>
      </Shell>
    );
  }

  if (load.kind === 'not-found') {
    return (
      <Shell>
        <h1 style={{ fontFamily: ui.heading, fontSize: 24, fontWeight: 800 }}>Not found</h1>
        <p style={{ color: ui.muted }}>This link may have been removed or might be broken.</p>
        <Link to="/" style={{ color: ui.accent, fontWeight: 700 }}>
          Back to Yakku
        </Link>
      </Shell>
    );
  }

  if (load.kind === 'error') {
    return (
      <Shell>
        <h1 style={{ fontFamily: ui.heading, fontSize: 24, fontWeight: 800 }}>Couldn&apos;t load this</h1>
        <p style={{ color: ui.muted }}>Something went wrong. Please try again.</p>
        <button
          type="button"
          onClick={() => {
            setLoad({ kind: 'loading' });
            setReloadKey((k) => k + 1);
          }}
          style={{ height: 48, borderRadius: 999, border: 'none', background: ui.accent, color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        >
          Try again
        </button>
      </Shell>
    );
  }

  const { content } = load;
  const stats = comparisonStats(content);
  const unlocked = !!stats && !resultsLocked(content);

  return (
    <Shell>
      <span style={{ fontFamily: ui.heading, fontSize: 22, fontWeight: 800 }}>
        Yakku<span style={{ color: ui.accent }}>.</span>
      </span>

      {unlocked && stats ? (
        <ComparisonCard same={stats.same} against={stats.against} total={stats.total} />
      ) : (
        <PendingCard />
      )}

      <YourTurnCard onPick={() => navigate('/live-check')} />
    </Shell>
  );
}

export default VoteResult;
