import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { VoteForm, VoteOutcome, CUSTOM_ID } from '../components/VoteCard.tsx';
import { WeeklyChecks } from '../components/WeeklyChecks.tsx';
import { OpenInApp } from '../components/OpenInApp.tsx';
import {
  fetchSharedContent,
  getVotePhase,
  isShareCode,
  submitVote,
  type SharedContentDto,
  type VoteChoice,
} from '../lib/pollApi.ts';

type LoadState = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; content: SharedContentDto };

// Palette for the page chrome and notices; the poll/check card itself lives in VoteCard.tsx.
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
        <div style={{ width: '100%', maxWidth: 440, fontFamily: app.font }}>{children}</div>
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

export function Vote() {
  const { pollId: shareCode } = useParams<{ pollId: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [reason, setReason] = useState('');
  const [results, setResults] = useState<SharedContentDto | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isShareCode(shareCode)) return;
    const controller = new AbortController();
    fetchSharedContent(shareCode, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      setState(result.kind === 'ok' ? result : { kind: result.kind });
    });
    return () => controller.abort();
  }, [shareCode, reloadKey]);

  if (!isShareCode(shareCode)) {
    return (
      <Shell>
        <Notice title="Not found" body="This link may have been removed or might be broken." />
      </Shell>
    );
  }

  if (state.kind === 'loading') {
    return (
      <Shell>
        <p role="status" style={{ textAlign: 'center', fontSize: 14, color: app.muted }}>
          Loading…
        </p>
      </Shell>
    );
  }

  if (state.kind === 'not-found') {
    return (
      <Shell>
        <Notice title="Not found" body="This poll or check may have been removed or the link might be broken." />
      </Shell>
    );
  }

  if (state.kind === 'error') {
    return (
      <Shell>
        <Notice
          title="Couldn't load this"
          body="Something went wrong while contacting Yakku. Please try again."
          retry={() => {
            setState({ kind: 'loading' });
            setReloadKey((k) => k + 1);
          }}
        />
      </Shell>
    );
  }

  const { content } = state;
  const isCheck = content.contentType === 'CHECK';
  const noun = isCheck ? 'check' : 'poll';
  const phase = getVotePhase(content);

  if (phase === 'unavailable') {
    return (
      <Shell>
        <Notice title={`This ${noun} is unavailable`} body={`This ${noun} isn't available for voting.`} />
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
    const result = await submitVote(content.shareCode || shareCode, choice, reason);
    inFlight.current = false;
    setSubmitting(false);
    switch (result.kind) {
      case 'ok':
        setVoted(true);
        // The vote response is the content as the voter now sees it: results appear only once the
        // vote-count limit is reached, otherwise just the progress towards it.
        if (result.content) setResults(result.content);
        else {
          fetchSharedContent(shareCode).then((r) => {
            if (r.kind === 'ok') setResults(r.content);
          });
        }
        break;
      case 'auth-required':
        setVoteError('Your vote could not be accepted right now. Please try again in a moment.');
        break;
      case 'conflict':
        setVoteError(result.message ?? `You can't vote on this ${noun} again, or it is no longer open.`);
        break;
      case 'invalid':
        setVoteError(result.message ?? 'Your vote could not be accepted. Please check your answer and try again.');
        break;
      case 'rate-limited':
        setVoteError('Too many attempts. Please wait a moment and try again.');
        break;
      default:
        setVoteError('Your vote could not be submitted. Please try again.');
    }
  };

  if (voted || phase === 'voted') {
    return (
      <Shell>
        <VoteOutcome
          content={results ?? content}
          notice={voted ? '✓ Your vote has been submitted. Thanks for voting!' : "✓ You've already voted on this."}
        />
        <WeeklyChecks />
      </Shell>
    );
  }

  if (phase !== 'votable') {
    const notice =
      phase === 'owner'
        ? `This is your ${noun}. Open the Yakku app to see its results.`
        : `This ${noun} ${phase === 'expired' ? 'has expired' : 'is closed'}. Voting is no longer available.`;
    return (
      <Shell>
        <VoteOutcome content={content} notice={notice} noticeTone="muted" showOptions={false} />
      </Shell>
    );
  }

  return (
    <Shell>
      <OpenInApp shareCode={shareCode ?? ''} />
      <VoteForm
        content={content}
        form={{ selected, customAnswer, reason, submitting, error: voteError }}
        handlers={{
          onSelect: setSelected,
          onCustomAnswer: (value) => {
            setCustomAnswer(value);
            setSelected(CUSTOM_ID);
          },
          onReason: setReason,
          onSubmit: handleSubmit,
        }}
      />
    </Shell>
  );
}

export default Vote;
