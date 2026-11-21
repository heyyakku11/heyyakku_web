import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AfterVote } from '../components/AfterVote.tsx';
import { FlagIcon, ReportCardFlow } from '../components/ReportCardFlow.tsx';
import {
  VotePickStep,
  VoteReasonStep,
  CUSTOM_ID,
  cardBackground,
  pickedLabel,
} from '../components/VoteCard.tsx';
import { VoteEdgeCase } from '../components/VoteEdgeCase.tsx';
import { isLoggedIn } from '../lib/authStore.ts';
import { saveAuthNext } from '../lib/authRedirect.ts';
import {
  fetchSharedContent,
  getVotePhase,
  isShareCode,
  submitVote,
  type SharedContentDto,
  type VoteChoice,
} from '../lib/pollApi.ts';
import { voteResultPath } from '../lib/voteLinks.ts';

type LoadState = { kind: 'loading' } | { kind: 'not-found' } | { kind: 'error' } | { kind: 'ok'; content: SharedContentDto };
type VoteStep = 'pick' | 'reason';
/** Edge panel shown instead of the votable card (already answered / closed / unavailable). */
type EdgeState = 'already-answered' | 'closed' | 'unavailable' | null;

const app = {
  primary: '#D02E62',
  text: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  card: '#FFFFFF',
  mist: 'rgba(27, 20, 24, 0.12)',
  pageFallback: '#FFD6E0',
  radius: 16,
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  brand: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

const buttonBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: 52,
  borderRadius: 999,
  fontFamily: app.font,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none',
  boxSizing: 'border-box',
};

function YakkuMark() {
  return (
    <Link to="/" aria-label="Yakku home" style={{ display: 'inline-flex', alignItems: 'baseline', textDecoration: 'none', color: app.text }}>
      <span
        style={{
          fontFamily: app.brand,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: -0.6,
          lineHeight: 1,
        }}
      >
        Yakku
      </span>
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: 2,
          background: app.primary,
          marginLeft: 2,
          alignSelf: 'flex-end',
          marginBottom: 4,
        }}
      />
    </Link>
  );
}

function VoteChrome({
  background,
  onReport,
  children,
}: {
  background: string;
  onReport?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: app.font,
        color: app.text,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 20px 28px',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
            flexShrink: 0,
          }}
        >
          <YakkuMark />
          {onReport ? (
            <button
              type="button"
              onClick={onReport}
              aria-label="Report this card"
              style={{
                width: 40,
                height: 40,
                border: 'none',
                background: 'transparent',
                color: app.text,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: 12,
              }}
            >
              <FlagIcon size={22} />
            </button>
          ) : (
            <span style={{ width: 40 }} />
          )}
        </header>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</main>
      </div>
    </div>
  );
}

function Notice({
  title,
  body,
  retry,
  background = app.pageFallback,
}: {
  title: string;
  body: string;
  retry?: () => void;
  background?: string;
}) {
  return (
    <VoteChrome background={background}>
      <div
        style={{
          background: 'rgba(255,255,255,0.72)',
          borderRadius: app.radius,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, color: app.text, margin: 0, fontFamily: app.heading }}>{title}</h1>
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
      </div>
    </VoteChrome>
  );
}

export function Vote() {
  const [searchParams] = useSearchParams();
  const shareCode = searchParams.get('share_code') ?? undefined;
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [step, setStep] = useState<VoteStep>('pick');
  const [selected, setSelected] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [edge, setEdge] = useState<EdgeState>(null);
  const [reason, setReason] = useState('');
  const [voteError, setVoteError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
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
    return <VoteEdgeCase kind="unavailable" />;
  }

  if (state.kind === 'loading') {
    return (
      <VoteChrome background={app.pageFallback}>
        <p role="status" style={{ textAlign: 'center', fontSize: 14, color: app.muted, marginTop: 48 }}>
          Loading…
        </p>
      </VoteChrome>
    );
  }

  if (state.kind === 'not-found') {
    return <VoteEdgeCase kind="unavailable" />;
  }

  if (state.kind === 'error') {
    return (
      <Notice
        title="Couldn't load this"
        body="Something went wrong while contacting Yakku. Please try again."
        retry={() => {
          setState({ kind: 'loading' });
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  const { content } = state;
  const phase = getVotePhase(content);
  const background = cardBackground(content.check?.backgroundColor);
  const toLanding = () => navigate('/');
  const askOwn = () => navigate('/live-check');
  const resultPath = voteResultPath(shareCode);
  const seeWhatOthers = () => {
    if (isLoggedIn()) {
      navigate(resultPath);
      return;
    }
    saveAuthNext(resultPath);
    navigate(`/auth?next=${encodeURIComponent(resultPath)}`);
  };

  const reportFlow = (
    <ReportCardFlow
      open={reportOpen}
      onClose={() => setReportOpen(false)}
      payload={{
        shareCode: content.shareCode || shareCode,
        contentType: content.contentType,
        contentId: content.contentId,
        question: content.question,
      }}
    />
  );

  // Edge panels (already answered / closed / unavailable) — including conflict from submit.
  const edgeKind: EdgeState =
    edge ??
    (phase === 'voted'
      ? 'already-answered'
      : phase === 'expired' || phase === 'closed'
        ? 'closed'
        : phase === 'unavailable' || phase === 'owner'
          ? 'unavailable'
          : null);

  if (edgeKind) {
    return <VoteEdgeCase kind={edgeKind} onAsk={askOwn} />;
  }

  // Fresh vote this session → confirmation CTAs (Not now / See others / Your Turn).
  if (voted) {
    return (
      <AfterVote
        title="Sent. Anonymously."
        subtitle="They'll never know it was you."
        seeResults={{
          label: 'See what others are saying',
          sub: "Nobody ever knows it's you",
          onClick: seeWhatOthers,
        }}
        yourTurn={{
          label: 'Your Turn',
          sub: 'Find out what your friends say about you',
          onClick: askOwn,
        }}
        onDismiss={toLanding}
        dismissLabel="Not now"
      />
    );
  }

  const buildChoice = (): VoteChoice | null => {
    const custom = customAnswer.trim();
    if (selected === CUSTOM_ID) return custom ? { customAnswer: custom } : null;
    if (selected) return { optionId: selected };
    return null;
  };

  const handleSubmit = async (withReason: boolean) => {
    const choice = buildChoice();
    if (!choice || inFlight.current || voted) return;
    inFlight.current = true;
    setSubmitting(true);
    setVoteError(null);
    const result = await submitVote(
      content.shareCode || shareCode,
      choice,
      withReason ? reason : '',
    );
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
        // Same device/number already answered — show the edge panel, not a fresh-send confirmation.
        setEdge('already-answered');
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

  const goToReason = () => {
    if (!buildChoice()) return;
    setVoteError(null);
    setStep('reason');
  };

  if (step === 'reason') {
    const picked = pickedLabel(content, selected, customAnswer);
    return (
      <>
        <VoteReasonStep
          content={content}
          picked={picked}
          reason={reason}
          submitting={submitting}
          error={voteError}
          onReason={setReason}
          onSend={() => handleSubmit(true)}
          onSkip={() => {
            setReason('');
            void handleSubmit(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <VoteChrome background={background} onReport={() => setReportOpen(true)}>
        <VotePickStep
          content={content}
          form={{ selected, customAnswer }}
          handlers={{
            onSelect: (id) => {
              setSelected(id);
              if (id !== CUSTOM_ID) setCustomAnswer('');
            },
            onCustomAnswer: (value) => {
              setCustomAnswer(value);
              setSelected(CUSTOM_ID);
            },
            onContinue: goToReason,
          }}
        />
      </VoteChrome>
      {reportFlow}
    </>
  );
}

export default Vote;
