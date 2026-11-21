import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { resultsLocked, type SharedContentDto } from '../lib/pollApi.ts';
import { CHECK_STICKER } from '../lib/checkTheme.ts';

const ui = {
  accent: '#D02E62',
  accentSoft: 'rgba(208, 46, 98, 0.12)',
  ink: '#111111',
  text: '#1B1418',
  muted: 'rgba(27, 20, 24, 0.55)',
  softMuted: 'rgba(27, 20, 24, 0.42)',
  chip: '#FFFFFF',
  letterBg: 'rgba(27, 20, 24, 0.06)',
  cream: '#FFF9F6',
  error: '#B42318',
  defaultBg: '#FFD6E0',
  radius: 18,
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

export const CUSTOM_ID = '__custom__';
export const REASON_MAX = 120;
export const CUSTOM_MAX = 120;

const letter = (index: number) => String.fromCharCode(65 + index);

/** Accepts `#RRGGBB`, `RRGGBB` and short forms; anything else falls back to the default pink. */
export function cardBackground(raw: string | undefined): string {
  if (raw && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.trim())) {
    return `#${raw.trim().replace(/^#/, '')}`;
  }
  return ui.defaultBg;
}

export function cardHeading(content: SharedContentDto): string {
  return content.check?.title?.trim() || (content.contentType === 'POLL' ? 'Poll' : 'Check');
}

export function pickedLabel(content: SharedContentDto, selected: string | null, customAnswer: string): string {
  if (selected === CUSTOM_ID) return customAnswer.trim();
  const opt = content.options.find((o) => o.id === selected);
  return opt?.text ?? '';
}

function Badge({ children, filled = false }: { children: ReactNode; filled?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: ui.body,
        boxSizing: 'border-box',
        color: filled ? '#fff' : ui.text,
        background: filled ? ui.accent : ui.letterBg,
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

function MediaView({ mediaType, url, label }: { mediaType: string; url: string | null; label: string }) {
  const kind = mediaType.toLowerCase();
  const frame: CSSProperties = { width: '100%', borderRadius: ui.radius, background: 'rgba(255,255,255,0.55)', display: 'block' };
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

function TitleRow({ content }: { content: SharedContentDto }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <h1
        style={{
          margin: 0,
          flex: 1,
          minWidth: 0,
          fontFamily: ui.heading,
          fontWeight: 800,
          fontSize: 34,
          lineHeight: 1.05,
          letterSpacing: -0.8,
          color: ui.ink,
          overflowWrap: 'anywhere',
        }}
      >
        {cardHeading(content)}
      </h1>
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          transform: 'rotate(8deg)',
          marginTop: 4,
          background: '#fff',
          border: `1.5px solid ${ui.accent}`,
          borderRadius: 10,
          padding: '8px 12px',
          fontFamily: ui.script,
          color: ui.accent,
          fontSize: 15,
          lineHeight: 1.15,
          textAlign: 'center',
          maxWidth: 118,
          boxShadow: '0 2px 8px rgba(27, 20, 24, 0.06)',
        }}
      >
        {CHECK_STICKER}
      </span>
    </div>
  );
}

function Question({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: ui.heading,
        fontWeight: 700,
        fontSize: 18,
        lineHeight: 1.25,
        letterSpacing: -0.2,
        color: ui.ink,
        overflowWrap: 'anywhere',
      }}
    >
      {text}
    </p>
  );
}

function AnonymousLine({ text = "Anonymous. They'll never know it was you." }: { text?: string }) {
  return (
    <p
      style={{
        margin: 'auto 0 0',
        paddingTop: 16,
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
  gap: 12,
  width: '100%',
  padding: '12px 16px 12px 10px',
  borderRadius: ui.radius,
  boxSizing: 'border-box',
  textAlign: 'left',
  fontFamily: ui.body,
  fontSize: 15,
  fontWeight: 600,
  color: ui.text,
  boxShadow: '0 2px 10px rgba(27, 20, 24, 0.06)',
};

export interface VotePickState {
  selected: string | null;
  customAnswer: string;
}

export interface VotePickHandlers {
  onSelect: (id: string) => void;
  onCustomAnswer: (value: string) => void;
  /** Advances to the optional reason step — does not submit yet. */
  onContinue: () => void;
}

/** Step 1: pick a preset option or write a custom answer (required before continuing). */
export function VotePickStep({
  content,
  form,
  handlers,
}: {
  content: SharedContentDto;
  form: VotePickState;
  handlers: VotePickHandlers;
}) {
  const { selected, customAnswer } = form;
  const customInput = useRef<HTMLInputElement>(null);
  const customSelected = selected === CUSTOM_ID;
  const canContinue =
    customSelected ? customAnswer.trim() !== '' : !!selected && selected !== CUSTOM_ID;
  const media = content.poll?.media ?? null;

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: '100%',
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: ui.body,
        color: ui.text,
      }}
    >
      <TitleRow content={content} />
      {media && <MediaView mediaType={media.mediaType} url={media.url} label={content.question} />}
      <Question text={content.question} />

      <div role="radiogroup" aria-label="Answer options" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {content.options.map((opt, index) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handlers.onSelect(opt.id)}
              style={{
                ...rowBase,
                background: ui.chip,
                border: `2px solid ${isSelected ? ui.accent : 'transparent'}`,
                cursor: 'pointer',
              }}
            >
              <Badge filled={isSelected}>{letter(index)}</Badge>
              <span style={{ flex: 1, overflowWrap: 'anywhere' }}>{opt.text}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
          <input
            ref={customInput}
            type="text"
            value={customAnswer}
            maxLength={CUSTOM_MAX}
            placeholder="Write your own answer"
            aria-label="Write your own answer"
            onFocus={() => handlers.onSelect(CUSTOM_ID)}
            onChange={(e) => handlers.onCustomAnswer(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: 52,
              boxSizing: 'border-box',
              padding: '0 16px',
              borderRadius: 14,
              border: `1.6px solid ${customSelected || customAnswer ? ui.accent : 'rgba(27, 20, 24, 0.14)'}`,
              background: ui.chip,
              fontFamily: ui.body,
              fontSize: 15,
              fontWeight: 600,
              color: ui.text,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handlers.onContinue}
            disabled={!canContinue}
            style={{
              flexShrink: 0,
              minWidth: 88,
              height: 52,
              padding: '0 20px',
              border: 'none',
              borderRadius: 14,
              background: ui.accent,
              color: '#fff',
              fontFamily: ui.body,
              fontSize: 16,
              fontWeight: 700,
              opacity: canContinue ? 1 : 0.45,
              cursor: canContinue ? 'pointer' : 'not-allowed',
            }}
          >
            Vote
          </button>
        </div>
        {(customSelected || customAnswer.length > 0) && (
          <span style={{ alignSelf: 'flex-end', fontSize: 12, color: ui.muted }}>
            {customAnswer.length}/{CUSTOM_MAX}
          </span>
        )}
      </div>

      <AnonymousLine />
    </section>
  );
}

/** Step 2: optional reason — Send submits with reason; Skip submits without. */
export function VoteReasonStep({
  content,
  picked,
  reason,
  submitting,
  error,
  onReason,
  onSend,
  onSkip,
}: {
  content: SharedContentDto;
  picked: string;
  reason: string;
  submitting: boolean;
  error: string | null;
  onReason: (value: string) => void;
  onSend: () => void;
  onSkip: () => void;
}) {
  const heading = cardHeading(content).toUpperCase();

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: ui.cream,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: ui.body,
        color: ui.text,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          padding: '28px 22px 28px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            alignSelf: 'flex-start',
            display: 'inline-block',
            maxWidth: '100%',
            background: ui.accentSoft,
            color: ui.accent,
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.2,
            overflowWrap: 'anywhere',
            lineHeight: 1.35,
          }}
        >
          {heading} · You picked &ldquo;{picked}&rdquo;
        </span>

        <h1
          style={{
            margin: '22px 0 8px',
            fontFamily: ui.heading,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -0.7,
            lineHeight: 1.1,
            color: ui.ink,
          }}
        >
          Want to tell them why?
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: ui.muted, lineHeight: 1.4 }}>
          Optional. Still anonymous. Reasons are what they&apos;ll read first.
        </p>

        <textarea
          value={reason}
          maxLength={REASON_MAX}
          rows={5}
          disabled={submitting}
          placeholder="You always know what to say when things go wrong"
          aria-label="Optional reason"
          onChange={(e) => onReason(e.target.value)}
          style={{
            marginTop: 22,
            width: '100%',
            boxSizing: 'border-box',
            resize: 'none',
            padding: 16,
            borderRadius: 16,
            border: '1.5px solid rgba(27, 20, 24, 0.14)',
            background: ui.chip,
            fontFamily: ui.body,
            fontSize: 16,
            fontWeight: 500,
            color: ui.text,
            outline: 'none',
            lineHeight: 1.4,
          }}
        />
        <span style={{ alignSelf: 'flex-end', marginTop: 6, fontSize: 12, color: ui.muted }}>
          {reason.length}/{REASON_MAX}
        </span>

        {error && (
          <p role="alert" style={{ margin: '12px 0 0', fontSize: 14, color: ui.error }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 32 }}>
          <button
            type="button"
            onClick={onSend}
            disabled={submitting}
            aria-busy={submitting}
            style={{
              width: '100%',
              height: 56,
              border: 'none',
              borderRadius: 999,
              background: ui.accent,
              color: '#fff',
              fontFamily: ui.body,
              fontSize: 17,
              fontWeight: 700,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Sending…' : 'Send'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={submitting}
            style={{
              background: 'none',
              border: 'none',
              color: ui.muted,
              fontFamily: ui.body,
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? 'default' : 'pointer',
              padding: 10,
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/** Kept for owner / closed / expired notice states on the vote route. */
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
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: '100%',
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: ui.body,
        color: ui.text,
      }}
    >
      <TitleRow content={content} />
      {media && <MediaView mediaType={media.mediaType} url={media.url} label={content.question} />}
      <Question text={content.question} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
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

      <AnonymousLine text={myVote ? 'Your vote stays anonymous' : "Anonymous. They'll never know it was you."} />
      <p style={{ margin: 0, fontSize: 12, color: ui.softMuted, textAlign: 'center', lineHeight: 1.4 }}>
        By answering you agree to the{' '}
        <Link to="/terms" style={{ color: ui.accent, fontWeight: 600, textDecoration: 'none' }}>
          Terms
        </Link>
        . 18+ only.
      </p>
    </section>
  );
}
