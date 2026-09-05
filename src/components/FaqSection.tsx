import { useState } from 'react';
import { designTokens } from '../design-tokens.js';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'anonymous-voting',
    question: 'How does anonymous voting work on Yakku to ensure my identity stays private?',
    answer:
      'When you vote on Yakku, no personal credentials, IP addresses, or browser cookies are collected or attached to your response. Only aggregate counts update instantly in real time, keeping your honest feedback completely anonymous, secure, and untraceable.',
  },
  {
    id: 'app-download',
    question: 'Do voters need to download the Yakku app or create an account to vote?',
    answer:
      'No app download or account creation is required to vote. Anyone who receives your link can participate immediately in any web browser on desktop or mobile, ensuring lightning-fast responses and zero friction for your friends, team, or community.',
  },
  {
    id: 'share-platforms',
    question: 'Where can I share my Yakku polls and who can see the live results?',
    answer:
      'You can share your poll link across WhatsApp, Instagram Stories, X, Telegram, or direct messages. Poll creators see live updating statistics instantly, while voters view aggregated percentage results immediately after submitting their private choice without seeing individual identities.',
  },
  {
    id: 'free-and-ads',
    question: 'Is Yakku completely free to use, and are there any advertisements or hidden fees?',
    answer:
      'Yakku is entirely free to use with zero advertisements and no subscription fees. We believe honest opinions thrive without intrusive distractions, so creating questions and collecting candid votes remains fast, accessible, and enjoyable for everyone at all times.',
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>('anonymous-voting');

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="py-24 px-6 md:px-12"
      style={{
        background: '#F8F9FA',
        borderTop: `1px solid ${designTokens.colors.border}`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* 2-Column Split Grid - Exact Match to Attached Reference UI */}
        <div className="faq-two-col-grid">
          {/* Left Column: Top Title & Bottom Contact Block */}
          <div className="faq-left-col">
            <div>
              <h2
                className="font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-[54px] leading-[1.08]"
                style={{
                  fontFamily: designTokens.typography.fontFamilies.heading,
                  color: '#111111',
                  letterSpacing: '-0.035em',
                }}
              >
                General Questions
                <br />
                asked by customers.
              </h2>
            </div>

            <div className="max-w-sm">
              <p
                className="text-sm md:text-base leading-relaxed mb-6"
                style={{ color: '#4B5563' }}
              >
                Our friendly team is always here to help you with quick, clear, and reliable answers whenever needed.
              </p>

              <a
                href="mailto:support@heyyakku.com"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer"
                style={{
                  background: '#111111',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.16)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2A2A2A';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#111111';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.16)';
                }}
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* Right Column: Stacked White Cards with Clear Gaps */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              width: '100%',
            }}
          >
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;

              return (
                <div
                  key={faq.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1px solid #E5E7EB',
                    boxShadow: isOpen
                      ? '0 6px 20px -2px rgba(0, 0, 0, 0.05)'
                      : '0 1px 4px rgba(0, 0, 0, 0.02)',
                    overflow: 'hidden',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '24px 28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      style={{
                        fontFamily: designTokens.typography.fontFamilies.heading,
                        fontWeight: 700,
                        fontSize: '17px',
                        lineHeight: 1.35,
                        color: '#111111',
                        paddingRight: '8px',
                      }}
                    >
                      {faq.question}
                    </span>

                    {/* Circular Outline Icon: Minus (-) when Open, Plus (+) when Closed */}
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1.5px solid #9CA3AF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#1F2937',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isOpen ? (
                        /* Minus (-) icon */
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      ) : (
                        /* Plus (+) icon */
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </span>
                  </button>

                  {/* Collapsible Answer Content */}
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 28px 26px 28px',
                      }}
                      className="animate-fade-in"
                    >
                      <p
                        style={{
                          fontSize: '15px',
                          color: '#4B5563',
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
