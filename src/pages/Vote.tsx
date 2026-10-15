import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { designTokens } from '../design-tokens.js';
import {
  fetchPoll,
  getVotePhase,
  isUuid,
  submitVote,
  whatsAppShareUrl,
  type PollDto,
} from '../lib/pollApi.ts';

type LoadState = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; poll: PollDto };

const colors = designTokens.colors;
const headingFont = designTokens.typography.fontFamilies.heading;

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: colors.bgSecondary }}>
      <Navbar minimal />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-24">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Footer minimal />
    </div>
  );
}

function Notice({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: headingFont, color: colors.textPrimary }}>
        {title}
      </h1>
      <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
        {body}
      </p>
      <div className="flex gap-3 justify-center">
        {retry && (
          <button
            type="button"
            onClick={retry}
            className="px-6 py-2.5 rounded-lg font-semibold text-sm cursor-pointer"
            style={{ background: colors.primary, color: colors.textWhite }}
          >
            Try again
          </button>
        )}
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm border"
          style={{ borderColor: colors.border, color: colors.textPrimary, background: colors.bgWhite }}
        >
          Back to Yakku
        </Link>
      </div>
    </div>
  );
}

export function Vote() {
  const { pollId } = useParams<{ pollId: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isUuid(pollId)) return;
    const controller = new AbortController();
    fetchPoll(pollId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState(result.kind === 'ok' ? result : { kind: result.kind });
    });
    return () => controller.abort();
  }, [pollId, reloadKey]);

  if (!isUuid(pollId)) {
    return (
      <Shell>
        <Notice title="Poll not found" body="This poll may have been removed or the link might be broken." />
      </Shell>
    );
  }
  if (state.kind === 'loading') {
    return (
      <Shell>
        <p role="status" className="text-center text-sm" style={{ color: colors.textMuted }}>
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
    if (!selected || inFlight.current || voted) return;
    inFlight.current = true;
    setSubmitting(true);
    setVoteError(null);
    const result = await submitVote(poll.id, selected);
    inFlight.current = false;
    setSubmitting(false);
    switch (result.kind) {
      case 'ok':
        setVoted(true);
        break;
      case 'auth-required':
        setVoteError('Voting requires a signed-in Yakku account. Please vote from the Yakku app.');
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

  const shareButton = (
    <a
      href={whatsAppShareUrl(poll.question, poll.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-2.5 rounded-lg font-semibold text-sm text-center border"
      style={{ borderColor: colors.primary, color: colors.primary, background: colors.bgWhite }}
    >
      Share on WhatsApp
    </a>
  );

  const card = (children: ReactNode) => (
    <div
      className="bg-white rounded-xl border w-full p-5 sm:p-7"
      style={{ borderColor: colors.border, boxShadow: designTokens.shadows.card }}
    >
      <h1
        className="font-bold mb-5 leading-snug text-xl"
        style={{ fontFamily: headingFont, color: colors.textPrimary, overflowWrap: 'anywhere' }}
      >
        {poll.question}
      </h1>
      {children}
    </div>
  );

  if (voted) {
    return (
      <Shell>
        {card(
          <>
            <p role="status" className="text-sm font-semibold mb-5" style={{ color: colors.primary }}>
              ✓ Your vote has been submitted. Thanks for voting!
            </p>
            {shareButton}
          </>,
        )}
      </Shell>
    );
  }

  if (phase !== 'votable') {
    return (
      <Shell>
        {card(
          <>
            <p role="status" className="text-sm mb-5" style={{ color: colors.textMuted }}>
              {phase === 'expired' ? 'This poll has expired.' : 'This poll is closed.'} Voting is no
              longer available.
            </p>
            {shareButton}
          </>,
        )}
      </Shell>
    );
  }

  const canSubmit = !!selected && !submitting;
  return (
    <Shell>
      {card(
        <>
          <div role="radiogroup" aria-label="Answer options" className="flex flex-col gap-3 mb-5">
            {poll.options.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    background: isSelected ? 'rgba(0, 196, 122, 0.06)' : colors.bgWhite,
                  }}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={opt.id}
                    checked={isSelected}
                    disabled={submitting}
                    onChange={() => setSelected(opt.id)}
                    style={{ accentColor: colors.primary }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSelected ? colors.primary : colors.textPrimary, overflowWrap: 'anywhere' }}
                  >
                    {opt.text}
                  </span>
                </label>
              );
            })}
          </div>

          {voteError && (
            <p role="alert" className="text-sm mb-4" style={{ color: '#C0392B' }}>
              {voteError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-busy={submitting}
            className="w-full py-2.5 rounded-lg font-semibold text-sm mb-3"
            style={{
              background: canSubmit ? colors.primary : colors.border,
              color: canSubmit ? colors.textWhite : colors.textSubtle,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Vote'}
          </button>
          {shareButton}
        </>,
      )}
    </Shell>
  );
}

export default Vote;
