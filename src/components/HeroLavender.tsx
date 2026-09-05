import { designTokens } from '../design-tokens.js';

interface HeroLavenderProps {
  onGetStartedClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function HeroLavender({ onGetStartedClick }: HeroLavenderProps) {
  const handleScrollToDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onGetStartedClick) {
      onGetStartedClick(e);
      return;
    }
    const cta = document.getElementById('download');
    if (cta) cta.scrollIntoView({ behavior: 'smooth' });
  };

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

      {/* Lavender Area Content Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-full relative z-10 flex flex-col justify-between py-6 lg:py-8">
        {/* Left Column Content (Constrained to left side) */}
        <div style={{ maxWidth: 540 }}>
          {/* Top Sub-section: Bold Paragraph ONLY */}
          <div className="mb-8 lg:mb-12">
            <p
              className="leading-relaxed"
              style={{
                color: designTokens.colors.dark,
                fontSize: 'clamp(15px, 1.25vw, 17px)',
                fontWeight: 600,
                maxWidth: 460,
                lineHeight: 1.5,
              }}
            >
              Anonymous polls made for real opinions. Share a link and collect honest votes — no
              accounts, no tracking, no filters.
            </p>
          </div>

          {/* Bottom Sub-section: Get Started Button + The mobile app is available now & iOS/Android Buttons */}
          <div className="flex flex-col gap-6">
            <div>
              <a
                href="#download"
                onClick={handleScrollToDownload}
                className="inline-block px-8 py-3.5 rounded-full font-bold text-sm border-2 transition-all duration-200 cursor-pointer"
                style={{
                  background: designTokens.colors.dark,
                  color: designTokens.colors.textWhite,
                  borderColor: designTokens.colors.dark,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = designTokens.colors.transparent;
                  e.currentTarget.style.color = designTokens.colors.dark;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = designTokens.colors.dark;
                  e.currentTarget.style.color = designTokens.colors.textWhite;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Get Started
              </a>
            </div>

            {/* App Availability Row */}
            <div className="flex items-center gap-4">
              <p
                className="text-sm leading-tight font-semibold"
                style={{ color: designTokens.colors.dark }}
              >
                The mobile app
                <br />
                is available now
              </p>

              {/* App Store Circular Button (Transparent bg, thin border, black icon) */}
              <a
                href="#download"
                title="Download on App Store"
                className="flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  background: 'transparent',
                  border: `1px solid ${designTokens.colors.dark}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = designTokens.colors.dark;
                  e.currentTarget.style.transform = 'scale(1.08)';
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.style.fill = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.style.fill = designTokens.colors.dark;
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill={designTokens.colors.dark}
                    style={{ transition: 'fill 200ms' }}
                    d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"
                  />
                </svg>
              </a>

              {/* Google Play Circular Button (Transparent bg, thin border, black icon) */}
              <a
                href="#download"
                title="Get it on Google Play"
                className="flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer"
                style={{
                  width: 46,
                  height: 46,
                  background: 'transparent',
                  border: `1px solid ${designTokens.colors.dark}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = designTokens.colors.dark;
                  e.currentTarget.style.transform = 'scale(1.08)';
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.style.fill = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                  const path = e.currentTarget.querySelector('path');
                  if (path) path.style.fill = designTokens.colors.dark;
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path
                    fill={designTokens.colors.dark}
                    style={{ transition: 'fill 200ms' }}
                    d="M3.18 23.76c.3.17.64.22.98.14l11.65-6.9-2.52-2.52-10.11 9.28zm-1.7-20.1a1.75 1.75 0 0 0-.48 1.23v14.22c0 .47.17.9.48 1.23l.07.06 7.96-7.96v-.19L1.55 3.6l-.07.06zm17.04 9.4-2.72-1.61-2.84 2.84 2.84 2.84 2.73-1.62c.78-.46.78-1.99-.01-2.45zM4.16.14C3.82.06 3.48.11 3.18.28L13.3 10.4l2.52-2.52L4.16.14z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
