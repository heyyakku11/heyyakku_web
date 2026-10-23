import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import {
  fetchPoll,
  getVotePhase,
  isPollRef,
  submitVote,
  type PollDto,
  type VoteChoice,
} from '../lib/pollApi.ts';

const CUSTOM_ID = '__custom__';

type LoadState = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; poll: PollDto };

// Mirrors the Flutter app's poll card (YakkuPalette / AppSpacing / AppRadii).
const app = {
  primary: '#D02E62',
  primaryTint: 'rgba(208, 46, 98, 0.08)',
  coral: '#E07A5F',
  text: '#334155',
  muted: '#64748B',
  surface: '#FFF9F6',
  page: '#FFF9F6',
  card: '#FFFFFF',
  mist: '#F1F5F4',
  error: '#B42318',
  radius: 12,
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const buttonBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 52,
  borderRadius: app.radius,
  fontFamily: app.font,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none',
  boxSizing: 'border-box',
};

function Shell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: app.page }}>
      <Navbar minimal />
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '96px 16px 48px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480, fontFamily: app.font }}>{children}</div>
      </main>
      <Footer minimal />
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: app.card,
        borderRadius: app.radius,
        border: `1px solid ${app.mist}`,
        boxShadow: '0 1px 3px rgba(51, 65, 85, 0.08)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

function Notice({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  return (
    <Card>
      <h1 style={{ fontSize: 16, fontWeight: 800, color: app.text, margin: 0 }}>{title}</h1>
      <p style={{ fontSize: 14, color: app.muted, margin: 0, lineHeight: 1.4 }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        {retry && (
          <button
            type="button"
            onClick={retry}
            style={{ ...buttonBase, background: app.primary, color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        )}
        <Link
          to="/"
          style={{ ...buttonBase, border: `1.5px solid ${app.mist}`, color: app.text, background: app.card }}
        >
          Back to Yakku
        </Link>
      </div>
    </Card>
  );
}

function Footnote({ voteCount }: { voteCount: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: app.muted, fontSize: 12 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM8 13c-2.7 0-6 1.3-6 4v2h12v-2c0-2.7-3.3-4-6-4zm8 0c-.3 0-.6 0-1 .1 1.2.9 2 2.1 2 3.9v2h5v-2c0-2.7-3.3-4-6-4z"
          stroke={app.muted}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span>{voteCount === 1 ? '1 vote' : `${voteCount} votes`}</span>
    </div>
  );
}

export function Vote() {
  const { pollId: pollRef } = useParams<{ pollId: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isPollRef(pollRef)) return;
    const controller = new AbortController();
    fetchPoll(pollRef, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState(result.kind === 'ok' ? result : { kind: result.kind });
    });
    return () => controller.abort();
  }, [pollRef, reloadKey]);

  if (!isPollRef(pollRef)) {
    return (
      <Shell>
        <Notice title="Poll not found" body="This poll may have been removed or the link might be broken." />
      </Shell>
    );
  }
  if (state.kind === 'loading') {
    return (
      <Shell>
        <p role="status" style={{ textAlign: 'center', fontSize: 14, color: app.muted }}>
          Loading poll…
        </p>
      </Shell>
    );
  }
  if (state.kind === 'not-found') {
    return (
      <Shell>
        <Notice title="Poll not found" body="This poll may have been removed or the link might be broken." />
      </Shell>
    );
  }
  if (state.kind === 'error') {
    return (
      <Shell>
        <Notice
          title="Couldn't load this poll"
          body="Something went wrong while contacting Yakku. Please try again."
          retry={() => {
            setState({ kind: 'loading' });
            setReloadKey((k) => k + 1);
          }}
        />
      </Shell>
    );
  }

  const { poll } = state;
  const phase = getVotePhase(poll);
  if (phase === 'unavailable') {
    return (
      <Shell>
        <Notice title="Poll unavailable" body="This poll isn't available for public voting." />
      </Shell>
    );
  }

  const handleSubmit = async () => {
    const custom = customAnswer.trim();
    let choice: VoteChoice | null = null;
    if (selected === CUSTOM_ID) choice = custom ? { customAnswer: custom } : null;
    else if (selected) choice = { optionId: selected };
    if (!choice || inFlight.current || voted) return;
    inFlight.current = true;
    setSubmitting(true);
    setVoteError(null);
    const result = await submitVote(poll.id, choice);
    inFlight.current = false;
    setSubmitting(false);
    switch (result.kind) {
      case 'ok':
        setVoted(true);
        break;
      case 'auth-required':
        setVoteError('Your vote could not be accepted right now. Please try again in a moment.');
        break;
      case 'conflict':
        setVoteError(result.message ?? "You can't vote on this poll again, or it is no longer open.");
        break;
      case 'rate-limited':
        setVoteError('Too many attempts. Please wait a moment and try again.');
        break;
      default:
        setVoteError('Your vote could not be submitted. Please try again.');
    }
  };

  const question = (
    <h1
      style={{
        margin: 0,
        fontSize: 16,
        fontWeight: 800,
        lineHeight: 1.4,
        color: app.text,
        overflowWrap: 'anywhere',
      }}
    >
      {poll.question}
    </h1>
  );

  if (voted) {
    return (
      <Shell>
        <Card>
          {question}
          <p role="status" style={{ margin: '4px 0', fontSize: 14, fontWeight: 600, color: app.primary }}>
            ✓ Your vote has been submitted. Thanks for voting!
          </p>
        </Card>
      </Shell>
    );
  }

  if (phase !== 'votable') {
    return (
      <Shell>
        <Card>
          {question}
          <p role="status" style={{ margin: '4px 0', fontSize: 14, color: app.muted, lineHeight: 1.4 }}>
            {phase === 'expired' ? 'This poll has expired.' : 'This poll is closed.'} Voting is no longer
            available.
          </p>
          <Footnote voteCount={poll.totalVoteCount} />
        </Card>
      </Shell>
    );
  }

  const canSubmit = (selected === CUSTOM_ID ? customAnswer.trim() !== '' : !!selected) && !submitting;
  return (
    <Shell>
      <Card>
        {question}

        <div role="radiogroup" aria-label="Answer options" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {poll.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: app.radius,
                  cursor: submitting ? 'default' : 'pointer',
                  background: isSelected ? app.primaryTint : app.surface,
                  border: `1.5px solid ${isSelected ? app.primary : 'transparent'}`,
                  boxSizing: 'border-box',
                }}
              >
                <input
                  type="radio"
                  name="poll-option"
                  value={opt.id}
                  checked={isSelected}
                  disabled={submitting}
                  onChange={() => setSelected(opt.id)}
                  style={{ accentColor: app.primary, width: 18, height: 18, margin: 0, flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: app.text,
                    fontWeight: isSelected ? 600 : 400,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {opt.text}
                </span>
              </label>
            );
          })}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              borderRadius: app.radius,
              cursor: submitting ? 'default' : 'pointer',
              background: selected === CUSTOM_ID ? app.primaryTint : app.surface,
              border: `1.5px solid ${selected === CUSTOM_ID ? app.primary : 'transparent'}`,
              boxSizing: 'border-box',
            }}
          >
            <input
              type="radio"
              name="poll-option"
              value={CUSTOM_ID}
              checked={selected === CUSTOM_ID}
              disabled={submitting}
              onChange={() => setSelected(CUSTOM_ID)}
              style={{ accentColor: app.primary, width: 18, height: 18, margin: 0, flexShrink: 0 }}
            />
            <input
              type="text"
              value={customAnswer}
              maxLength={200}
              disabled={submitting}
              placeholder="Write your own answer"
              aria-label="Write your own answer"
              onFocus={() => setSelected(CUSTOM_ID)}
              onChange={(e) => {
                setCustomAnswer(e.target.value);
                setSelected(CUSTOM_ID);
              }}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: app.font,
                fontSize: 14,
                color: app.text,
              }}
            />
          </label>
        </div>

        <Footnote voteCount={poll.totalVoteCount} />

        {voteError && (
          <p role="alert" style={{ margin: 0, fontSize: 14, color: app.error }}>
            {voteError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-busy={submitting}
          style={{
            ...buttonBase,
            border: 'none',
            background: canSubmit ? app.primary : app.mist,
            color: canSubmit ? '#fff' : app.muted,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? 'Submitting…' : 'Submit Vote'}
        </button>
      </Card>
    </Shell>
  );
}

export default Vote;
