import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AfterVote } from '../components/AfterVote.tsx';
import { ck } from '../components/checkUi.tsx';
import { isShareCode } from '../lib/pollApi.ts';
import {
  REQUIRED_TRAITS,
  fetchSharedCard,
  fetchTraits,
  submitPersonalityVote,
  type PersonalityTrait,
  type SharedPersonalityCard,
} from '../lib/personalityApi.ts';

type Load =
  | { kind: 'loading' }
  | { kind: 'not-found' }
  | { kind: 'error' }
  | { kind: 'ok'; card: SharedPersonalityCard; traits: PersonalityTrait[] };

const PINK_BG = '#FFD6E0';

function Message({ title, body, retry }: { title: string; body: string; retry?: () => void }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: PINK_BG, fontFamily: ck.body, padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontFamily: ck.heading, fontSize: 24, color: ck.ink }}>{title}</h1>
      <p style={{ color: ck.muted }}>{body}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 260, margin: '0 auto' }}>
        {retry && (
          <button type="button" onClick={retry} style={{ height: 48, borderRadius: 24, border: 'none', background: ck.accent, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Try again
          </button>
        )}
        <button type="button" onClick={() => navigate('/')} style={{ height: 48, borderRadius: 24, border: `1.6px solid ${ck.ink}`, background: '#fff', color: ck.ink, fontWeight: 700, cursor: 'pointer' }}>
          Back to Yakku
        </button>
      </div>
    </div>
  );
}

// "Describe me in 3 words": a friend (guest or signed in) picks 3 traits for the card's owner.
export function PersonalityVote() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isShareCode(shareCode)) return;
    const controller = new AbortController();
    Promise.all([fetchSharedCard(shareCode, controller.signal), fetchTraits(controller.signal)]).then(([card, traits]) => {
      if (controller.signal.aborted) return;
      if (card.kind !== 'ok') setLoad({ kind: card.kind });
      else if (!traits || traits.length === 0) setLoad({ kind: 'error' });
      else setLoad({ kind: 'ok', card: card.card, traits });
    });
    return () => controller.abort();
  }, [shareCode, reloadKey]);

  if (!isShareCode(shareCode)) return <Message title="Not found" body="This link may have been removed or might be broken." />;
  if (load.kind === 'loading') {
    return <p role="status" style={{ textAlign: 'center', padding: 48, fontFamily: ck.body, color: ck.muted }}>Loading…</p>;
  }
  if (load.kind === 'not-found') return <Message title="Not found" body="This card may have been removed or the link might be broken." />;
  if (load.kind === 'error') {
    return (
      <Message
        title="Couldn't load this"
        body="Something went wrong while contacting Yakku. Please try again."
        retry={() => {
          setLoad({ kind: 'loading' });
          setReloadKey((k) => k + 1);
        }}
      />
    );
  }

  const { card, traits } = load;

  if (sent || card.hasVoted) {
    return (
      <AfterVote
        title={sent ? 'Sent. Anonymously.' : "You've already voted."}
        seeResults={{ label: 'See what others are saying', sub: 'Nobody ever knows it’s you', onClick: () => navigate('/') }}
        yourTurn={{ label: 'Your Turn', sub: 'Find out what your friends say about you', onClick: () => navigate('/') }}
        onDismiss={() => navigate('/')}
      />
    );
  }

  if (card.isOwner || !card.canVote) {
    const body = card.isOwner
      ? 'This is your card. Open the Yakku app to see its results.'
      : "This card isn't collecting votes right now.";
    return <Message title="Voting unavailable" body={body} />;
  }

  const toggle = (id: string) => {
    setError(null);
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < REQUIRED_TRAITS ? [...cur, id] : cur));
  };

  const send = async () => {
    if (picked.length !== REQUIRED_TRAITS || inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setError(null);
    const result = await submitPersonalityVote(shareCode, picked);
    inFlight.current = false;
    setSending(false);
    switch (result.kind) {
      case 'ok':
        setSent(true);
        break;
      case 'conflict':
        setError(result.message ?? "You can't vote on this card again, or it is no longer open.");
        break;
      case 'invalid':
        setError(result.message ?? 'Your vote could not be accepted. Please check your picks and try again.');
        break;
      case 'rate-limited':
        setError('Too many attempts. Please wait a moment and try again.');
        break;
      case 'auth-required':
        setError('Your vote could not be accepted right now. Please try again in a moment.');
        break;
      default:
        setError('Your vote could not be submitted. Please try again.');
    }
  };

  const ready = picked.length === REQUIRED_TRAITS;

  return (
    <div className="pv-page">
      <div className="pv-card">
        <span className="pv-logo">
          Yakku<span style={{ color: ck.accent }}>.</span>
        </span>
        <span className="pv-tag">WHO YOU ARE</span>
        <h1 className="pv-title">Describe me in 3 words</h1>
        <span className="pv-count">
          {picked.length} OF {REQUIRED_TRAITS} PICKED
        </span>

        <div role="group" aria-label="Traits" className="pv-chips">
          {traits.map((t) => {
            const on = picked.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.id)}
                className="pv-chip"
                style={{
                  background: on ? ck.ink : '#fff',
                  color: on ? '#fff' : ck.ink,
                  boxShadow: `0 2px 0 ${on ? ck.accent : ck.ink}`,
                }}
              >
                {on ? '✓ ' : ''}
                {t.name}
              </button>
            );
          })}
        </div>

        <div className="pv-spacer" />
        {error && (
          <p role="alert" className="pv-error">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={send}
          disabled={!ready || sending}
          className="pv-send"
          style={{ cursor: ready && !sending ? 'pointer' : 'default', opacity: ready && !sending ? 1 : 0.5 }}
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
        <span className="pv-note">Anonymous. They'll never know it was you.</span>
      </div>
    </div>
  );
}

export default PersonalityVote;
