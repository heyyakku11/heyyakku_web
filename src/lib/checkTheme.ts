// Turns the theme the backend assigned to a check into what the web cards need.
// Nothing here knows about Mirror / Vibe / Trust: the backend owns every theme, and this
// only reads `theme.config`. Missing or malformed optional properties fall back to defaults,
// and checks without a theme (legacy) are rendered from their flat title/color/sticker.

export interface CheckThemeView {
  checkType: string | null;
  heading: string;
  /** Any CSS `background` value: a flat color or a linear-gradient. */
  background: string;
  headingColor: string;
  questionColor: string;
  accent: string;
  sticker: string;
  stickerColor: string;
  optionBackground: string;
  optionText: string;
}

export interface LegacyCheckStyle {
  title: string;
  backgroundColor: string;
  sticker: string;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_BG = '#FFD6E0';
const DEFAULT_INK = '#21191D';
const DEFAULT_ACCENT = '#D02E62';

function hex(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const v = value.trim();
  const withHash = v.startsWith('#') ? v : `#${v}`;
  return HEX.test(withHash) ? withHash : fallback;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveCheckTheme(raw: unknown, legacy: LegacyCheckStyle): CheckThemeView {
  const envelope = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  const config =
    envelope && envelope.config && typeof envelope.config === 'object'
      ? (envelope.config as Record<string, unknown>)
      : null;

  // No usable theme: legacy check (or an older backend).
  const c: Record<string, unknown> = config ?? {
    heading: legacy.title,
    backgroundColor: legacy.backgroundColor,
    stickerLabel: legacy.sticker,
  };

  const accent = hex(c.accentColor, DEFAULT_ACCENT);
  const stops = Array.isArray(c.backgroundGradient)
    ? c.backgroundGradient.filter((s): s is string => typeof s === 'string' && HEX.test(s.trim())).map((s) => s.trim())
    : [];

  return {
    checkType: typeof envelope?.checkType === 'string' ? envelope.checkType : null,
    heading: text(c.heading),
    background: stops.length >= 2 ? `linear-gradient(180deg, ${stops.join(', ')})` : hex(c.backgroundColor, DEFAULT_BG),
    headingColor: hex(c.labelColor, DEFAULT_INK),
    questionColor: hex(c.questionColor, DEFAULT_INK),
    accent,
    sticker: text(c.stickerLabel),
    stickerColor: hex(c.stickerColor, accent),
    optionBackground: hex(c.optionBackgroundColor, '#FFFFFF'),
    optionText: hex(c.optionTextColor, DEFAULT_INK),
  };
}
