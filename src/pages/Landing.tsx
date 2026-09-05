import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { HeroLavender } from '../components/HeroLavender.tsx';
import { HeroMockup } from '../components/HeroMockup.tsx';
import { ProcessSection } from '../components/ProcessSection.tsx';
import { FaqSection } from '../components/FaqSection.tsx';
import { designTokens } from '../design-tokens.js';

const STATS = [
  { value: '2M+', label: 'Votes Cast' },
  { value: '180K+', label: 'Polls Created' },
  { value: '4.9+', label: 'App Store Rating' },
];

export function Landing() {
  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgPage }}>
      <Navbar />

      {/* =========================================================================
          HERO SECTION
          3-Layer Architecture:
          - Layer 0 (Base, lowest z-index: 0): Base White Hero section with "ASK YOUR QUESTION."
          - Layer 1 (Middle, z-index: 5): <HeroLavender /> positioned bottom-aligned
          - Layer 2 (Top, z-index: 20): <HeroMockup /> spanning both layers without clipping
          ========================================================================= */}
      <section
        className="hero-section relative overflow-hidden"
        style={{
          background: designTokens.colors.bgWhite, // Layer 0: Base White Section
          paddingTop: 64, // Accounts for fixed Navbar
          position: 'relative',
        }}
      >
        {/* Layer 0 (Base): White Section Content - Heading in exact position with NO overlap */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative w-full" style={{ zIndex: 10 }}>
          <div
            className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-16"
            style={{
              paddingTop: 'clamp(32px, 5vw, 60px)',
            }}
          >
            {/* Left Column: Heading ONLY */}
            <div className="hero-heading-wrap">
              <div
                style={{
                  paddingTop: 'clamp(20px, 3.5vw, 44px)',
                  paddingBottom: 20,
                }}
              >
                <h1
                  className="hero-heading leading-none"
                  style={{
                    fontFamily: designTokens.typography.fontFamilies.heading,
                    fontWeight: 800,
                    color: designTokens.colors.dark,
                    letterSpacing: designTokens.typography.letterSpacings.tight,
                  }}
                >
                  ASK YOUR
                </h1>
                <h1
                  className="hero-heading hero-heading-question leading-none"
                  style={{
                    fontFamily: designTokens.typography.fontFamilies.heading,
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: designTokens.colors.dark,
                    letterSpacing: '-0.03em',
                  }}
                >
                  QUESTION
                </h1>
              </div>
            </div>

            {/* Right Column: Hero Mockup (Layer 2: Highest z-index: 20) */}
            <HeroMockup />
          </div>
        </div>

        {/* Layer 1 (Middle): Lavender Area Component (Bottom-aligned, zIndex: 5) */}
        <HeroLavender />
      </section>

      {/* =========================================================================
          METRICS & STATISTICS BANNER
          ========================================================================= */}
      <section
        style={{
          background: designTokens.colors.bgSubtle,
          borderTop: `1px solid ${designTokens.colors.border}`,
          borderBottom: `1px solid ${designTokens.colors.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.value}>
                <p
                  className="font-extrabold leading-none"
                  style={{
                    fontFamily: designTokens.typography.fontFamilies.heading,
                    fontSize: designTokens.typography.fontSizes.statNumber,
                    color: designTokens.colors.dark,
                    letterSpacing: designTokens.typography.letterSpacings.tight,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="mt-1 font-medium uppercase tracking-widest text-xs"
                  style={{
                    color: designTokens.colors.textMuted,
                    fontStyle: 'italic',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PROCESS SECTION (REDESIGNED 3-CARD LAYOUT MATCHING REFERENCE UI)
          ========================================================================= */}
      <ProcessSection />

      {/* =========================================================================
          FAQ ACCORDION SECTION
          ========================================================================= */}
      <FaqSection />

      {/* =========================================================================
          DARK CTA BANNER WITH LAVENDER RADIAL GLOW
          ========================================================================= */}
      <section
        id="download"
        className="py-24 px-6 md:px-12 text-center relative overflow-hidden"
        style={{ background: designTokens.colors.dark }}
      >
        {/* Ambient lavender radial light cone */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(160, 140, 220, 0.25) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-xl mx-auto relative">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: designTokens.colors.primary }}
          >
            Have a question?
          </p>
          <h2
            className="font-extrabold mb-4 text-white leading-none inline-flex items-baseline justify-center gap-3 flex-wrap"
            style={{
              fontFamily: designTokens.typography.fontFamilies.heading,
              fontSize: designTokens.typography.fontSizes.ctaHeading,
              letterSpacing: designTokens.typography.letterSpacings.tight,
            }}
          >
            <span>ASK</span>{' '}
            <span
              style={{
                fontFamily: designTokens.typography.fontFamilies.brand,
                color: '#A795DF',
                fontWeight: 400,
                fontSize: '1.08em',
                textTransform: 'none',
                letterSpacing: 'normal',
              }}
            >
              Yakku.
            </span>
          </h2>
          <p
            className="text-base mb-10"
            style={{ color: designTokens.colors.textWhiteMuted }}
          >
            Download the app and start creating anonymous polls in seconds.
          </p>

          <div className="cta-store-buttons">
            <a
              href="#app-store"
              className="cta-store-btn rounded-full transition-all duration-200"
              style={{
                background: designTokens.colors.bgWhite,
                color: designTokens.colors.dark,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = designTokens.colors.primary;
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = designTokens.colors.bgWhite;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
              </svg>
              <div className="text-left">
                <p className="text-xs leading-none" style={{ opacity: 0.7 }}>
                  Download on the
                </p>
                <p className="text-sm font-bold leading-tight">App Store</p>
              </div>
            </a>

            <a
              href="#google-play"
              className="cta-store-btn rounded-full transition-all duration-200"
              style={{
                background: designTokens.colors.bgWhite,
                color: designTokens.colors.dark,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = designTokens.colors.primary;
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = designTokens.colors.bgWhite;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.3.17.64.22.98.14l11.65-6.9-2.52-2.52-10.11 9.28zm-1.7-20.1a1.75 1.75 0 0 0-.48 1.23v14.22c0 .47.17.9.48 1.23l.07.06 7.96-7.96v-.19L1.55 3.6l-.07.06zm17.04 9.4-2.72-1.61-2.84 2.84 2.84 2.84 2.73-1.62c.78-.46.78-1.99-.01-2.45zM4.16.14C3.82.06 3.48.11 3.18.28L13.3 10.4l2.52-2.52L4.16.14z" />
              </svg>
              <div className="text-left">
                <p className="text-xs leading-none" style={{ opacity: 0.7 }}>
                  Get it on
                </p>
                <p className="text-sm font-bold leading-tight">Google Play</p>
              </div>
            </a>
          </div>

          <p className="text-xs" style={{ color: designTokens.colors.textWhiteSubtle }}>
            Free to download · No ads · Anonymous by design
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
