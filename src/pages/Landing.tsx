import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { HeroLavender } from '../components/HeroLavender.tsx';
import { FaqSection } from '../components/FaqSection.tsx';
import { designTokens } from '../design-tokens.js';

export function Landing() {
  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgPage }}>
      <Navbar />

      {/* =========================================================================
          HERO SECTION
          3-Layer Architecture:
          - Layer 0 (Base, lowest z-index: 0): Base White Hero section with "ASK YOUR QUESTION."
          - Layer 1 (Middle, z-index: 5): <HeroLavender /> positioned bottom-aligned
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
          </div>
        </div>

        {/* Layer 1 (Middle): Lavender Area Component (Bottom-aligned, zIndex: 5) */}
        <HeroLavender />
      </section>

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
              href="#google-play"
              aria-label="Get it on Google Play"
              className="cta-store-btn transition-all duration-200"
              style={{
                background: '#000000',
                color: '#FFFFFF',
                border: '1px solid #A6A6A6',
                borderRadius: 8,
                width: 'auto',
                alignSelf: 'center',
                padding: '0 20px 0 14px',
                gap: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="26" height="28" viewBox="0 0 24 24">
                <path fill="#00A0FF" d="M1.48 3.66a1.75 1.75 0 0 0-.48 1.23v14.22c0 .47.17.9.48 1.23l.07.06 7.96-7.96v-.19L1.55 3.6l-.07.06z" />
                <path fill="#FFD500" d="M18.52 13.06l-2.72-1.61-2.84 2.84 2.84 2.84 2.73-1.62c.78-.46.78-1.99-.01-2.45z" />
                <path fill="#FF3A44" d="M3.18 23.76c.3.17.64.22.98.14l11.65-6.9-2.52-2.52-10.11 9.28z" />
                <path fill="#00F076" d="M4.16.14C3.82.06 3.48.11 3.18.28L13.3 10.4l2.52-2.52L4.16.14z" />
              </svg>
              <div className="text-left">
                <p
                  className="leading-none uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.04em' }}
                >
                  Get it on
                </p>
                <p
                  className="leading-tight"
                  style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}
                >
                  Google Play
                </p>
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
