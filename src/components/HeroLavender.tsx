import { designTokens } from '../design-tokens.js';

export function HeroLavender() {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-auto"
      style={{
        height: '42%',
        minHeight: 280,
        zIndex: 5, // Layer 1: Above base white hero section
      }}
    >
      {/* Lavender Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: designTokens.colors.bgHeroLilac,
          zIndex: 1,
        }}
      />

      {/* Ambient Yakku Watermark - Left-Center Aligned, Cursive & Italic */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '4%',
          right: '10%',
          transform: 'translateX(-50%)',
          fontFamily: designTokens.typography.fontFamilies.brand,
          fontStyle: 'italic',
          fontSize: designTokens.typography.fontSizes.watermark,
          color: designTokens.colors.bgWatermark,
          lineHeight: 1,
          zIndex: 2,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}
      >
        Yakku
      </div>
    </div>
  );
}
