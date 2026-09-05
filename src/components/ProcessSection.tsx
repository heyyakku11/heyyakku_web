import { designTokens } from '../design-tokens.js';

export function ProcessSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-6 md:px-12"
      style={{
        background: '#FAF9FC',
        borderTop: `1px solid ${designTokens.colors.border}`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Header Row - matches reference UI */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: '#7C65C1' }}
            >
              Why Choose Yakku
            </p>
            <h2
              className="font-extrabold leading-none"
              style={{
                fontFamily: designTokens.typography.fontFamilies.heading,
                fontSize: designTokens.typography.fontSizes.sectionHeading,
                color: designTokens.colors.dark,
                letterSpacing: designTokens.typography.letterSpacings.tight,
                lineHeight: 1.02,
              }}
            >
              WHY CREATORS
              <br />
              <span style={{ fontStyle: 'italic', fontWeight: 300 }}>CHOOSE US</span>
            </h2>
          </div>

          <div className="max-w-xs">
            <p
              className="font-bold text-sm uppercase tracking-wider mb-1.5"
              style={{ color: designTokens.colors.dark }}
            >
              THE ANONYMOUS POLLING APP
            </p>
            <p
              className="text-xs md:text-sm leading-relaxed"
              style={{ color: designTokens.colors.textMuted }}
            >
              Quick to create, effortless to share, and 100% private for genuine, unbiased answers.
            </p>
          </div>
        </div>

        {/* 3 Tall Cards Grid - matching Image 1 */}
        <div className="process-cards-grid">
          {/* Card 1: Lavender Accent */}
          <div
            className="flex flex-col justify-between p-8 md:p-10 transition-all duration-300 relative overflow-hidden"
            style={{
              background: '#E8E4F8',
              borderRadius: '28px',
              minHeight: '420px',
              border: '1px solid rgba(160, 140, 220, 0.3)',
              boxShadow: '0 4px 20px -2px rgba(124, 101, 193, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(124, 101, 193, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(124, 101, 193, 0.08)';
            }}
          >
            {/* Top Circle Badge */}
            <div
              className="w-14 h-14 rounded-full border flex items-center justify-center"
              style={{
                borderColor: 'rgba(0, 0, 0, 0.15)',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Phone Outline Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
              </svg>
            </div>

            {/* Bottom Content */}
            <div>
              <h3
                className="font-extrabold text-2xl mb-3 tracking-tight leading-tight"
                style={{
                  fontFamily: designTokens.typography.fontFamilies.heading,
                  color: designTokens.colors.dark,
                }}
              >
                CLEAR & SIMPLE
                <br />
                APP INTERFACE
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(17, 17, 17, 0.72)' }}
              >
                Create a poll in just two clicks. Type your question, set your options, and launch in under a minute.
              </p>
            </div>
          </div>

          {/* Card 2: White with Organic Wave Line Watermark */}
          <div
            className="flex flex-col justify-between p-8 md:p-10 transition-all duration-300 relative overflow-hidden"
            style={{
              background: '#FFFFFF',
              borderRadius: '28px',
              minHeight: '420px',
              border: '1.5px solid #E5E7EB',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(0, 0, 0, 0.04)';
            }}
          >
            {/* Organic Soft Squiggle Line Watermark - Matches reference Image 1 */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              viewBox="0 0 300 400"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M220,-20 C140,80 230,190 150,290 C90,360 170,420 120,440"
                stroke="#E5E1F6"
                strokeWidth="20"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Top Circle Badge */}
            <div
              className="w-14 h-14 rounded-full border flex items-center justify-center relative z-10"
              style={{
                borderColor: 'rgba(0, 0, 0, 0.15)',
                background: '#F9FAFB',
              }}
            >
              {/* Wallet / Free Share Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <circle cx="16" cy="14" r="1.5" fill="#111111" />
              </svg>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10">
              <h3
                className="font-extrabold text-2xl mb-3 tracking-tight leading-tight"
                style={{
                  fontFamily: designTokens.typography.fontFamilies.heading,
                  color: designTokens.colors.dark,
                }}
              >
                THE MOBILE APP
                <br />
                IS FREE FOR YOU
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: designTokens.colors.textMuted }}
              >
                You can use the application without any paid subscription. No hidden fees or paywalls.
              </p>
            </div>
          </div>

          {/* Card 3: Soft Lilac Tint (No green, shades of lavender/slate) */}
          <div
            className="flex flex-col justify-between p-8 md:p-10 transition-all duration-300 relative overflow-hidden"
            style={{
              background: '#EDE8FA',
              borderRadius: '28px',
              minHeight: '420px',
              border: '1px solid rgba(160, 140, 220, 0.3)',
              boxShadow: '0 4px 20px -2px rgba(124, 101, 193, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(124, 101, 193, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(124, 101, 193, 0.08)';
            }}
          >
            {/* Top Circle Badge */}
            <div
              className="w-14 h-14 rounded-full border flex items-center justify-center"
              style={{
                borderColor: 'rgba(0, 0, 0, 0.15)',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Analytics / Spark Percent Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="5" x2="5" y2="19" />
                <circle cx="7.5" cy="7.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
            </div>

            {/* Bottom Content */}
            <div>
              <h3
                className="font-extrabold text-2xl mb-3 tracking-tight leading-tight"
                style={{
                  fontFamily: designTokens.typography.fontFamilies.heading,
                  color: designTokens.colors.dark,
                }}
              >
                A LOT OF COOL
                <br />
                POLLS & TOPICS
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(17, 17, 17, 0.72)' }}
              >
                Explore unlimited questions and topics you are interested in with our app. 100% anonymous answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProcessSection;
