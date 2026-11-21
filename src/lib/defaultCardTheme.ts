/**
 * Default theme for user-written polls ("Create your own").
 * Matches backend CardTheme seed (kind POLL) and YakkuPalette.DefaultCard / DefaultCardLabel.
 */
export const DEFAULT_CARD_THEME = {
  kind: 'POLL',
  /** Card heading shown above the question on share / vote. */
  heading: 'Your Question',
  /** Flat card background. */
  backgroundColor: '#E8F6C3',
  /** Sticker + heading accent (seed label_color). */
  labelColor: '#4B5E12',
} as const;

export type DefaultCardTheme = typeof DEFAULT_CARD_THEME;
