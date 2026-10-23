import { useRef, type CSSProperties, type ReactNode } from 'react';
import { resultsLocked, type SharedContentDto } from '../lib/pollApi.ts';

// Mirrors the app's check/poll card (mirror_check_card.dart): tinted card, black eyebrow pill, tilted
// handwritten sticker, bold question, white lettered options and a dashed "Add your own answer" row.
const ui = {
  accent: '#D02E62',
  accentSoft: 'rgba(208, 46, 98, 0.14)',
  ink: '#1B1418',
  text: '#21191D',
  muted: 'rgba(33, 25, 29, 0.55)',
  chip: '#FFFFFF',
  dash: 'rgba(33, 25, 29, 0.35)',
  error: '#B42318',
  defaultBg: '#FFD6E0',
  radius: 14,
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const CUSTOM_ID = '__custom__';
export const REASON_MAX = 150;
const CUSTOM_MAX = 200;

const letter = (index: number) => String.fromCharCode(65 + index);

/** Accepts `#RRGGBB`, `RRGGBB` and short forms; anything else falls back to the default pink. */
export function cardBackground(raw: string | undefined): string {
  if (raw && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.trim())) {
    return `#${raw.trim().replace(/^#/, '')}`;
  }
  return ui.defaultBg;
}

function Badge({ children, dashed = false, filled = false }: { children: ReactNode; dashed?: boolean; filled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 30,
        height: 30,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: ui.body,
        boxSizing: 'border-box',
        color: filled ? '#fff' : dashed ? 'rgba(33, 25, 29, 0.7)' : ui.text,
        background: filled ? ui.accent : dashed ? 'transparent' : ui.accentSoft,
        border: dashed ? `1px dashed ${ui.dash}` : 'none',
      }}
    >
      {children}
    </span>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.2A9.6 9.6 0 0112 5c5 0 8.5 4.3 9.5 7a11.7 11.7 0 01-3.1 4.4M6.1 6.2C4 7.7 2.5 10 2.5 12c1 2.7 4.5 7 9.5 7 1.5 0 2.8-.4 4-.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Poll media is only rendered when the API hands out a URL; otherwise a labelled placeholder. */
function MediaView({ mediaType, url, label }: { mediaType: string; url: string | null; label: string }) {
  const kind = mediaType.toLowerCase();
  const frame: CSSProperties = { width: '100%', borderRadius: ui.radius, background: 'rgba(255,255,255,0.6)', display: 'block' };
  if (url && url.startsWith('https://')) {
    if (kind === 'image') return <img src={url} alt={label} style={{ ...frame, objectFit: 'cover', maxHeight: 320 }} />;
    if (kind === 'video') return <video src={url} controls playsInline style={{ ...frame, maxHeight: 320 }} />;
    if (kind === 'audio') return <audio src={url} controls style={{ width: '100%' }} />;
  }
  const noun = kind === 'image' ? 'Image' : kind === 'video' ? 'Video' : kind === 'audio' ? 'Audio' : 'Media';
  return (
    <div style={{ ...frame, padding: 16, boxSizing: 'border-box', color: ui.muted, fontSize: 13, textAlign: 'center' }}>
      {noun} attached — open the Yakku app to view it.
    </div>
  );
}

function Frame({ background, children }: { background: string; children: ReactNode }) {
  return (
    <section
      style={{
        background,
        borderRadius: 28,
        padding: '20px 18px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minHeight: 560,
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: ui.body,
        color: ui.text,
        boxShadow: '0 8px 18px rgba(33, 25, 29, 0.08)',
      }}
    >
      {children}
    </section>
  );
}

function Header({ content }: { content: SharedContentDto }) {
  const check = content.check;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ui.muted }}>
        <span
          aria-hidden="true"
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: ui.accentSoft,
            color: ui.accent,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          ?
        </span>
        <span>
          <strong style={{ color: ui.text }}>A friend</strong> asked you
        </span>
      </div>
      {check && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              background: '#000',
              color: 'rgba(255,255,255,0.85)',
              borderRadius: ui.radius,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.7,
              maxWidth: '55%',
              overflowWrap: 'anywhere',
            }}
          >
            {check.title}
          </span>
          {check.sticker && (
            <span
              style={{
                transform: 'rotate(-4.5deg)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid #000',
                borderRadius: ui.radius,
                padding: '6px 10px',
                fontFamily: "'Pacifico', cursive",
                color: ui.accent,
                fontSize: 18,
                lineHeight: 1.15,
                textAlign: 'center',
                maxWidth: '55%',
                overflowWrap: 'anywhere',
              }}
            >
              {check.sticker}
            </span>
          )}
        </div>
      )}
    </>
  );
}

function Question({ text, compact }: { text: string; compact: boolean }) {
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: ui.heading,
        fontWeight: 800,
        fontSize: compact ? 24 : 32,
        lineHeight: 1.08,
        letterSpacing: -0.6,
        color: ui.ink,
        overflowWrap: 'anywhere',
      }}
    >
      {text}
    </h1>
  );
}

function Footer({ text = "They'll never know it was you" }: { text?: string }) {
  return (
    <p
      style={{
        margin: 'auto 0 0',
        paddingTop: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        fontSize: 13,
        color: ui.muted,
      }}
    >
      <EyeOffIcon />
      <span>{text}</span>
    </p>
  );
}

const rowBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '7px 14px 7px 8px',
  borderRadius: ui.radius,
  boxSizing: 'border-box',
  textAlign: 'left',
  fontFamily: ui.body,
  fontSize: 15,
  fontWeight: 600,
  color: ui.text,
};

export interface VoteFormState {
  selected: string | null;
  customAnswer: string;
  reason: string;
  submitting: boolean;
  error: string | null;
}

export interface VoteFormHandlers {
  onSelect: (id: string) => void;
  onCustomAnswer: (value: string) => void;
  onReason: (value: string) => void;
  onSubmit: () => void;
}

/** The voter's form: pick an option (or write one), optionally say why, send the vote. */
export function VoteForm({
  content,
  form,
  handlers,
}: {
  content: SharedContentDto;
  form: VoteFormState;
  handlers: VoteFormHandlers;
}) {
  const { selected, customAnswer, reason, submitting, error } = form;
  const customInput = useRef<HTMLInputElement>(null);
  const customSelected = selected === CUSTOM_ID;
  const canSubmit = (customSelected ? customAnswer.trim() !== '' : !!selected) && !submitting;
  const media = content.poll?.media ?? null;

  return (
    <Frame background={cardBackground(content.check?.backgroundColor)}>
      <Header content={content} />
      {media && <MediaView mediaType={media.mediaType} url={media.url} label={content.question} />}
      <Question text={content.question} compact={!!selected} />

      <div role="radiogroup" aria-label="Answer options" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {content.options.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={submitting}
              onClick={() => handlers.onSelect(opt.id)}
              style={{
                ...rowBase,
                background: ui.chip,
                border: `2px solid ${isSelected ? ui.accent : 'transparent'}`,
                cursor: submitting ? 'default' : 'pointer',
              }}
            >
              <Badge filled={isSelected}>{letter(index)}</Badge>
              <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{opt.text}</span>
            </button>
          );
        })}

        <div
          role="radio"
          aria-checked={customSelected}
          tabIndex={0}
          onClick={() => {
            if (submitting) return;
            handlers.onSelect(CUSTOM_ID);
            customInput.current?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (e.target === e.currentTarget) {
                e.preventDefault();
                handlers.onSelect(CUSTOM_ID);
                customInput.current?.focus();
              }
            }
          }}
          style={{
            ...rowBase,
            background: customSelected ? ui.chip : 'rgba(255,255,255,0.2)',
            border: customSelected ? `2px solid ${ui.accent}` : `1.4px dashed ${ui.dash}`,
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          <Badge dashed={!customSelected} filled={customSelected}>
            {letter(content.options.length)}
          </Badge>
          {customSelected ? (
            <input
              ref={customInput}
              type="text"
              value={customAnswer}
              maxLength={CUSTOM_MAX}
              disabled={submitting}
              placeholder="Write your own answer"
              aria-label="Write your own answer"
              autoFocus
              onChange={(e) => handlers.onCustomAnswer(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: ui.body,
                fontSize: 15,
                fontWeight: 600,
                color: ui.text,
              }}
            />
          ) : (
            <>
              <span style={{ flex: 1, fontWeight: 700 }}>Add your own answer</span>
              <span aria-hidden="true" style={{ fontSize: 20, fontWeight: 400, color: ui.muted }}>
                +
              </span>
            </>
          )}
        </div>
      </div>

      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="vote-reason" style={{ fontSize: 14, fontWeight: 800, color: ui.ink }}>
            What made you choose this?{' '}
            <span style={{ fontWeight: 400, color: ui.muted }}>Anonymous · Optional</span>
          </label>
          <textarea
            id="vote-reason"
            value={reason}
            maxLength={REASON_MAX}
            rows={4}
            disabled={submitting}
            onChange={(e) => handlers.onReason(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              resize: 'none',
              padding: 12,
              borderRadius: ui.radius,
              border: 'none',
              background: ui.chip,
              fontFamily: ui.body,
              fontSize: 14,
              color: ui.text,
              outline: 'none',
            }}
          />
          <span style={{ alignSelf: 'flex-end', fontSize: 12, color: ui.muted }}>
            {reason.length} / {REASON_MAX}
          </span>
        </div>
      )}

      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 14, color: ui.error }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handlers.onSubmit}
        disabled={!canSubmit}
        aria-busy={submitting}
        style={{
          marginTop: selected ? 6 : 'auto',
          width: '100%',
          height: 52,
          border: 'none',
          borderRadius: 999,
          background: ui.accent,
          color: '#fff',
          fontFamily: ui.body,
          fontSize: 16,
          fontWeight: 700,
          opacity: canSubmit ? 1 : 0.45,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? 'Sending…' : 'Send vote'}
      </button>
      <Footer />
    </Frame>
  );
}

/**
 * After voting (or when blocked): the options as result bars once the vote-count limit is reached,
 * otherwise only the progress towards it. `notice` is the status line shown under the question.
 */
export function VoteOutcome({
  content,
  notice,
  noticeTone = 'success',
  showOptions = true,
}: {
  content: SharedContentDto;
  notice: string;
  noticeTone?: 'success' | 'muted';
  showOptions?: boolean;
}) {
  const media = content.poll?.media ?? null;
  const locked = resultsLocked(content);
  const myVote = content.voting.myVote;
  const needed = Math.max(content.stats.minVotesToReveal, 1);

  return (
    <Frame background={cardBackground(content.check?.backgroundColor)}>
      <Header content={content} />
      {media && <MediaView mediaType={media.mediaType} url={media.url} label={content.question} />}
      <Question text={content.question} compact />
      <p
        role="status"
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: noticeTone === 'success' ? 700 : 500,
          color: noticeTone === 'success' ? ui.accent : ui.muted,
          lineHeight: 1.4,
        }}
      >
        {notice}
      </p>

      {showOptions && locked && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {content.options.map((opt, index) => {
              const mine = opt.id === myVote?.optionId || opt.isSelected;
              return (
                <div
                  key={opt.id}
                  style={{ ...rowBase, background: ui.chip, border: `2px solid ${mine ? ui.accent : 'transparent'}` }}
                >
                  <Badge filled={mine}>{letter(index)}</Badge>
                  <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{opt.text}</span>
                </div>
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: ui.muted, lineHeight: 1.4 }}>
            Results unlock after {needed} votes from others ({Math.min(content.stats.voteProgress, needed)}/{needed} so
            far).
          </p>
        </>
      )}

      {showOptions && !locked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {content.options.map((opt, index) => {
            const pct = Math.round(opt.percentage ?? 0);
            const mine = opt.id === myVote?.optionId || opt.isSelected;
            return (
              <div
                key={opt.id}
                style={{
                  ...rowBase,
                  position: 'relative',
                  overflow: 'hidden',
                  background: ui.chip,
                  border: `2px solid ${mine ? ui.accent : 'transparent'}`,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: ui.accentSoft }}
                />
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Badge filled={mine}>{letter(index)}</Badge>
                  <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{opt.text}</span>
                  <span style={{ fontWeight: 800 }}>{pct}%</span>
                </span>
              </div>
            );
          })}
          {myVote?.customAnswer && (
            <p style={{ margin: 0, fontSize: 13, color: ui.muted, overflowWrap: 'anywhere' }}>
              Your own answer: <strong style={{ color: ui.text }}>{myVote.customAnswer}</strong>
            </p>
          )}
          {content.stats.totalVotes !== null && (
            <p style={{ margin: 0, fontSize: 12, color: ui.muted }}>
              {content.stats.totalVotes === 1 ? '1 vote' : `${content.stats.totalVotes} votes`}
            </p>
          )}
        </div>
      )}

      <Footer text={myVote ? 'Your vote stays anonymous' : "They'll never know it was you"} />
    </Frame>
  );
}
