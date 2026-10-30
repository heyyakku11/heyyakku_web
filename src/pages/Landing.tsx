import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { HeroLavender } from '../components/HeroLavender.tsx';
import { FaqSection } from '../components/FaqSection.tsx';
import { GooglePlayBadge } from '../components/GooglePlayBadge.tsx';
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
        className="px-6 md:px-12 text-center relative overflow-hidden"
        style={{
          background: designTokens.colors.dark,
          paddingBlock: 'clamp(56px, 10vw, 96px)',
        }}
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
            className="font-bold tracking-widest uppercase mb-4"
            style={{
              color: designTokens.colors.primary,
              fontSize: 'clamp(11px, 0.3vw + 10px, 13px)',
            }}
          >
            Have a question?
          </p>
          <h2
            className="font-extrabold mb-4 text-white leading-none inline-flex items-baseline justify-center gap-3 flex-wrap"
            style={{
              fontFamily: designTokens.typography.fontFamilies.heading,
              fontSize: designTokens.typography.fontSizes.ctaHeading,
              marginBottom: 'clamp(18px, 2.2vw, 30px)',
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
            style={{
              color: designTokens.colors.textWhiteMuted,
              fontSize: 'clamp(15px, 0.5vw + 13px, 18px)',
            }}
          >
            Download the app and start creating anonymous polls in seconds.
          </p>

          <div className="cta-store-buttons">
            <GooglePlayBadge />
          </div>

          <p
            style={{
              color: designTokens.colors.textWhiteSubtle,
              fontSize: 'clamp(11px, 0.3vw + 10px, 13px)',
            }}
          >
            Free to download · No ads · Anonymous by design
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
