import type { CSSProperties, ReactNode } from 'react';

// Shared look for the weekly-check screens; mirrors the app's feed and detail screens.
export const ck = {
  accent: '#D02E62',
  ink: '#1B1418',
  text: '#21191D',
  muted: 'rgba(33, 25, 29, 0.55)',
  cream: '#FFF9F6',
  pink: '#D9557F',
  defaultBg: '#FFD6E0',
  error: '#B42318',
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  script: "'Pacifico', cursive",
};

export const letter = (index: number) => String.fromCharCode(65 + index);

export function bgOf(raw: string | undefined): string {
  if (raw && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw.trim())) {
    return `#${raw.trim().replace(/^#/, '')}`;
  }
  return ck.defaultBg;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        background: '#000',
        color: 'rgba(255,255,255,0.8)',
        borderRadius: 14,
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 0.6,
        fontFamily: ck.body,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: ck.accent }} />
      {children}
    </span>
  );
}

export function Sticker({ text, size = 22 }: { text: string; size?: number }) {
  if (!text) return null;
  return (
    <span
      style={{
        transform: 'rotate(-4.6deg)',
        background: 'rgba(255,255,255,0.72)',
        border: '1.5px solid #000',
        borderRadius: 10,
        padding: '2px 10px',
        fontFamily: ck.script,
        fontSize: size,
        color: ck.accent,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {text}
    </span>
  );
}

export function LetterBadge({ children, size = 30, filled = false, tone }: { children: ReactNode; size?: number; filled?: boolean; tone?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: ck.body,
        color: filled ? '#fff' : ck.text,
        background: filled ? ck.accent : (tone ?? 'rgba(208, 46, 98, 0.14)'),
      }}
    >
      {children}
    </span>
  );
}

export const primaryPill: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  width: '100%',
  height: 56,
  borderRadius: 28,
  border: 'none',
  fontFamily: ck.body,
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  boxSizing: 'border-box',
};

export function ShareIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
