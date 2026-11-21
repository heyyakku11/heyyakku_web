import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';

/** Report reasons shown on the vote card sheet (mobile bottom sheet / desktop popup). */
export const REPORT_REASONS = [
  "It's hurtful or bullying",
  "It's about someone else",
  'Spam or a scam',
] as const;

export type ReportReasonLabel = (typeof REPORT_REASONS)[number];

const DESKTOP_MIN = 768;

const ink = '#1B1418';
const muted = 'rgba(27, 20, 24, 0.55)';
const accent = '#D02E62';
const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const heading = "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export interface ReportCardPayload {
  shareCode: string;
  contentType: string;
  contentId: string;
  question: string;
  reason: string;
  pageUrl: string;
}

/** Opens the support inbox with the report details (no card-report API yet; same contact as Terms). */
export function submitCardReport(payload: ReportCardPayload): void {
  const subject = encodeURIComponent(`Report card ${payload.shareCode}`);
  const body = encodeURIComponent(
    [
      `Share code: ${payload.shareCode}`,
      `Type: ${payload.contentType}`,
      `Content id: ${payload.contentId}`,
      `Question: ${payload.question}`,
      `Reason: ${payload.reason}`,
      `Page: ${payload.pageUrl}`,
    ].join('\n'),
  );
  window.location.href = `mailto:contact@heyyakku.com?subject=${subject}&body=${body}`;
}

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const onChange = () => setDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

function Handle() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 40,
        height: 4,
        borderRadius: 999,
        background: 'rgba(27, 20, 24, 0.18)',
        margin: '4px auto 20px',
      }}
    />
  );
}

function Shell({
  desktop,
  onClose,
  children,
  labelledBy,
}: {
  desktop: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const panel: CSSProperties = desktop
    ? {
        width: '100%',
        maxWidth: 400,
        borderRadius: 28,
        background: '#fff',
        padding: '28px 24px 22px',
        boxShadow: '0 24px 60px rgba(27, 20, 24, 0.22)',
        boxSizing: 'border-box',
      }
    : {
        width: '100%',
        borderRadius: '28px 28px 0 0',
        background: '#fff',
        padding: '10px 24px calc(22px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
      };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(27, 20, 24, 0.4)',
        display: 'flex',
        alignItems: desktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: desktop ? 24 : 0,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        style={panel}
      >
        {!desktop && <Handle />}
        {children}
      </div>
    </div>
  );
}

type Step = 'pick' | 'sent';

export function ReportCardFlow({
  open,
  onClose,
  payload,
}: {
  open: boolean;
  onClose: () => void;
  payload: Omit<ReportCardPayload, 'reason' | 'pageUrl'>;
}) {
  const desktop = useIsDesktop();
  const titleId = useId();
  const [step, setStep] = useState<Step>('pick');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep('pick');
    setSending(false);
    setError(null);
  }, [open]);

  if (!open) return null;

  const send = (reason: ReportReasonLabel) => {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      submitCardReport({
        ...payload,
        reason,
        pageUrl: window.location.href,
      });
      setSending(false);
      setStep('sent');
    } catch {
      setSending(false);
      setError('Could not send your report. Try again.');
    }
  };

  if (step === 'sent') {
    return (
      <Shell desktop={desktop} onClose={onClose} labelledBy={titleId}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: font, textAlign: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#E3F6EA',
              color: '#1E5B3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <h2 id={titleId} style={{ margin: 0, fontFamily: heading, fontSize: 22, fontWeight: 800, color: ink, letterSpacing: -0.4 }}>
            Thanks for telling us
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: muted, lineHeight: 1.4 }}>
            Our team will check it. They&apos;ll never know it was you.
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 8,
              width: '100%',
              height: 52,
              border: 'none',
              borderRadius: 999,
              background: accent,
              color: '#fff',
              fontFamily: font,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell desktop={desktop} onClose={onClose} labelledBy={titleId}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: font }}>
        <h2
          id={titleId}
          style={{
            margin: 0,
            fontFamily: heading,
            fontSize: 24,
            fontWeight: 800,
            color: ink,
            letterSpacing: -0.4,
            textAlign: 'center',
          }}
        >
          Report this card
        </h2>
        <p style={{ margin: '8px 0 22px', fontSize: 14, color: muted, textAlign: 'center', fontWeight: 500 }}>
          Your report is anonymous.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REPORT_REASONS.map((label) => (
            <button
              key={label}
              type="button"
              disabled={sending}
              onClick={() => send(label)}
              style={{
                width: '100%',
                minHeight: 52,
                padding: '14px 18px',
                borderRadius: 999,
                border: `1.5px solid ${ink}`,
                background: '#fff',
                color: ink,
                fontFamily: font,
                fontSize: 16,
                fontWeight: 700,
                cursor: sending ? 'default' : 'pointer',
                opacity: sending ? 0.55 : 1,
                boxSizing: 'border-box',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" style={{ margin: '12px 0 0', fontSize: 13, fontWeight: 700, color: accent, textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={sending}
          style={{
            marginTop: 20,
            background: 'none',
            border: 'none',
            color: muted,
            fontFamily: font,
            fontSize: 15,
            fontWeight: 600,
            cursor: sending ? 'default' : 'pointer',
            padding: '8px 12px',
          }}
        >
          Cancel
        </button>
      </div>
    </Shell>
  );
}

export function FlagIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 21V4m0 0h9.2l-.7 2.8L15 9.5H5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
