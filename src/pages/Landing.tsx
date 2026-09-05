import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { designTokens } from '../design-tokens.js';

interface PhonePreviewProps {
  scale?: number;
}

function PhonePreview({ scale = 1 }: PhonePreviewProps) {
  return (
    <div
      style={{
        width: 280 * scale,
        filter: designTokens.shadows.phoneProcess,
        flexShrink: 0,
      }}
    >
      <img
        src="/yakku_hero.png"
        alt="Yakku app showing anonymous poll questions"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}

const STATS = [
  { value: '2M+', label: 'Votes Cast' },
  { value: '180K+', label: 'Polls Created' },
  { value: '4.9+', label: 'App Store Rating' },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Create',
    desc: 'Create a poll in the Yakku app with your question and options. Takes under a minute.',
  },
  {
    num: '02',
    title: 'Share',
    desc: 'Share the link anywhere—WhatsApp, Instagram, X, Telegram, or direct.',
  },
  {
    num: '03',
    title: 'Answer',
    desc: 'People vote anonymously without needing an account. Results appear instantly.',
  },
];

export function Landing() {
  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgPage }}>
      <Navbar />

      {/* =========================================================================
          HERO SECTION
          Layering hierarchy:
          - Layer 0 (lowest): Base White background of the section (increased height ~72%)
          - Layer 1 (middle): Lavender background covering the lower section (height 28%, z-index: 1)
          - Layer 2 (highest): Content & Mobile mockup (z-index: 10 & 20)
          ========================================================================= */}
      <section
        className="relative overflow-hidden"
        style={{
          background: designTokens.colors.bgWhite, // Layer 0: Lowest (White section)
          paddingTop: 64, // Accounts for fixed Navbar
        }}
      >
        {/* Layer 1 (Middle): Lavender section in lower portion (height 52% comfortably covers the lavender content) */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: '52%',
            background: designTokens.colors.bgHeroLilac,
            zIndex: 1,
          }}
        />

        {/* Ambient Yakku Watermark in Lavender section - Left-Center Aligned, Cursive & Italic */}
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

        {/* Layer 2: Centered content container (z-index: 10) */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
          <div
            className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-16 pb-14 lg:pb-18"
            style={{
              paddingTop: 'clamp(32px, 5vw, 60px)',
            }}
          >
            {/* Left Column */}
            <div
              className="flex-1 flex flex-col justify-between relative z-10"
              style={{ maxWidth: 660 }}
            >
              {/* WHITE SECTION CONTENT: Heading ONLY (Shifted down for elegant top margin) */}
              <div
                style={{
                  paddingTop: 'clamp(20px, 3.5vw, 44px)',
                  paddingBottom: 20,
                }}
              >
                <h1
                  className="leading-none"
                  style={{
                    fontFamily: designTokens.typography.fontFamilies.heading,
                    fontSize: designTokens.typography.fontSizes.hero,
                    fontWeight: 800,
                    color: designTokens.colors.dark,
                    letterSpacing: designTokens.typography.letterSpacings.tight,
                    lineHeight: 0.92,
                  }}
                >
                  ASK YOUR
                </h1>
                <h1
                  className="leading-none"
                  style={{
                    fontFamily: designTokens.typography.fontFamilies.heading,
                    fontSize: designTokens.typography.fontSizes.hero,
                    fontWeight: 300,
                    fontStyle: 'italic',
                    color: designTokens.colors.dark,
                    letterSpacing: '-0.02em',
                    lineHeight: 0.92,
                  }}
                >
                  QUESTION.
                </h1>
              </div>

              {/* LAVENDER SECTION CONTENT: Two distinct sub-sections with bold typography and white circular app buttons */}
              <div
                className="flex flex-col justify-between"
                style={{
                  padding: 20,
                  margin: '20px 0',
                }}
              >
                {/* Top Sub-section: Bold paragraph + Get Started button */}
                <div className="mb-14 lg:mb-20">
                  <p
                    className="leading-relaxed mb-6"
                    style={{
                      color: designTokens.colors.dark,
                      fontSize: 'clamp(16px, 1.35vw, 18px)',
                      fontWeight: 600,
                      maxWidth: 460,
                      lineHeight: 1.55,
                    }}
                  >
                    Anonymous polls made for real opinions. Share a link and collect honest votes — no
                    accounts, no tracking, no filters.
                  </p>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      const cta = document.getElementById('download');
                      if (cta) cta.scrollIntoView({ behavior: 'smooth' });
                    }}
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

                {/* Bottom Sub-section: Bold text + iOS & Android Circular Buttons (White bg, thin border, black icons) */}
                <div className="flex items-center gap-4">
                  <p
                    className="text-sm leading-tight font-semibold"
                    style={{ color: designTokens.colors.dark }}
                  >
                    The mobile app
                    <br />
                    is available now
                  </p>

                  {/* App Store Circular Button (White bg, thin border, black icon) */}
                  <a
                    href="#download"
                    title="Download on App Store"
                    className="flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer"
                    style={{
                      width: 48,
                      height: 48,
                      background: designTokens.colors.bgWhite,
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
                      e.currentTarget.style.background = designTokens.colors.bgWhite;
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

                  {/* Google Play Circular Button (White bg, thin border, black icon) */}
                  <a
                    href="#download"
                    title="Get it on Google Play"
                    className="flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer"
                    style={{
                      width: 48,
                      height: 48,
                      background: designTokens.colors.bgWhite,
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
                      e.currentTarget.style.background = designTokens.colors.bgWhite;
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

            {/* Right Column: Phone Mockup Desktop View (Layer 3: Highest z-index: 20) */}
            <div className="hidden lg:flex flex-shrink-0 items-end justify-center relative z-20">
              <img
                src="/yakku_hero.png"
                alt="Yakku app showing anonymous poll questions"
                style={{
                  height: 'clamp(580px, 76vh, 820px)',
                  width: 'auto',
                  display: 'block',
                  filter: designTokens.shadows.phoneHero,
                  transform: 'translateY(2px)',
                }}
              />
            </div>

            {/* Mobile Phone Mockup (relative z-20) */}
            <div className="lg:hidden flex justify-center px-6 pb-0 mt-6 relative z-20">
              <img
                src="/yakku_hero.png"
                alt="Yakku app showing anonymous poll questions"
                style={{
                  height: 'clamp(380px, 80vw, 460px)',
                  width: 'auto',
                  filter: designTokens.shadows.phoneHeroMobile,
                  transform: 'translateY(2px)',
                }}
              />
            </div>
          </div>
        </div>
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
          HOW IT WORKS (PROCESS) SECTION
          ========================================================================= */}
      <section id="how-it-works" className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Steps List */}
            <div className="flex-1">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: designTokens.colors.primary }}
              >
                Process
              </p>
              <h2
                className="font-extrabold leading-none mb-4"
                style={{
                  fontFamily: designTokens.typography.fontFamilies.heading,
                  fontSize: designTokens.typography.fontSizes.sectionHeading,
                  color: designTokens.colors.dark,
                  letterSpacing: designTokens.typography.letterSpacings.tight,
                  lineHeight: 1,
                }}
              >
                THREE
                <br />
                <span style={{ fontStyle: 'italic' }}>SIMPLE STEPS.</span>
              </h2>
              <p
                className="text-base leading-relaxed mb-10"
                style={{
                  color: designTokens.colors.textMuted,
                  maxWidth: '380px',
                }}
              >
                We turn your thoughts into data. Quick to create, instant to share, anonymous by design.
              </p>

              <div className="flex flex-col gap-6">
                {PROCESS_STEPS.map((step) => (
                  <div key={step.num} className="flex items-start gap-5">
                    <span
                      className="font-extrabold leading-none flex-shrink-0"
                      style={{
                        fontFamily: designTokens.typography.fontFamilies.heading,
                        fontSize: '40px',
                        color: designTokens.colors.border,
                        letterSpacing: designTokens.typography.letterSpacings.tight,
                      }}
                    >
                      {step.num}
                    </span>
                    <div>
                      <p
                        className="font-bold mb-1"
                        style={{
                          fontFamily: designTokens.typography.fontFamilies.heading,
                          color: designTokens.colors.dark,
                          fontSize: '18px',
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: designTokens.colors.textMuted }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Staggered Dual Phone Mockup Visual */}
            <div
              className="flex-shrink-0 relative"
              style={{
                height: 520,
                width: 320,
              }}
            >
              {/* Back Stacked Phone */}
              <div
                className="absolute"
                style={{
                  top: 0,
                  left: 40,
                  opacity: 0.45,
                  transform: 'scale(0.88)',
                  transformOrigin: 'top center',
                }}
              >
                <PhonePreview />
              </div>

              {/* Front Elevated Phone */}
              <div
                className="absolute"
                style={{
                  top: 48,
                  left: 0,
                }}
              >
                <PhonePreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DARK CTA BANNER WITH EMERALD RADIAL GLOW
          ========================================================================= */}
      <section
        id="download"
        className="py-24 px-6 md:px-12 text-center relative overflow-hidden"
        style={{ background: designTokens.colors.dark }}
      >
        {/* Ambient emerald radial light cone */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(0, 196, 122, 0.25) 0%, transparent 70%)',
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
            className="font-extrabold mb-4 text-white leading-none"
            style={{
              fontFamily: designTokens.typography.fontFamilies.heading,
              fontSize: designTokens.typography.fontSizes.ctaHeading,
              letterSpacing: designTokens.typography.letterSpacings.tight,
            }}
          >
            ASK{' '}
            <span style={{ fontStyle: 'italic', color: designTokens.colors.primary }}>
              YAKKU.
            </span>
          </h2>
          <p
            className="text-base mb-10"
            style={{ color: designTokens.colors.textWhiteMuted }}
          >
            Download the app and start creating anonymous polls in seconds.
          </p>

          {/* App Store / Google Play Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href="#app-store"
              className="flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-200"
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
              className="flex items-center gap-3 px-6 py-3.5 rounded-full transition-all duration-200"
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
