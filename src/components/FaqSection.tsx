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
    question: 'How does anonymous voting work, and is my identity private?',
    answer:
      'When you vote, your name, email, or device is not attached to your answer. Only the running total updates in real time, so your honest choice stays private and untraceable.',
  },
  {
    id: 'app-download',
    question: 'Do I need to download the app or create an account to vote?',
    answer:
      'No app or account is required to vote. Anyone with your link can take part in a browser on phone or desktop, so friends can respond in seconds with no extra steps.',
  },
  {
    id: 'share-platforms',
    question: 'Where can I share my poll, and who can see the results?',
    answer:
      'You can share your poll link on WhatsApp, Instagram, or in a message. You see live results as votes come in, while voters only see the totals—not who chose what.',
  },
  {
    id: 'free-and-ads',
    question: 'Is Yakku free to use, and are there ads or hidden fees?',
    answer:
      'Yakku is free to use, with no ads and no hidden or subscription fees. You can create polls and collect honest votes at any time without paying anything.',
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
      className="px-6 md:px-12"
      style={{
        paddingBlock: 'clamp(48px, 9vw, 96px)',
        background: '#F8F9FA',
        borderTop: `1px solid ${designTokens.colors.border}`,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 820 }}>
        {/* 2-Column Split Grid - Exact Match to Attached Reference UI */}
        <div className="faq-two-col-grid">
          {/* Stacked White Cards with Clear Gaps */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
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
                    borderRadius: '8px',
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
                      padding: '14px 20px',
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
                        fontSize: 'clamp(15px, 0.5vw + 13px, 19px)',
                        lineHeight: 1.35,
                        color: '#111111',
                        paddingRight: '8px',
                      }}
                    >
                      {faq.question}
                    </span>

                    {/* Chevron arrow: points down when closed, rotates up when open */}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        color: '#1F2937',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Collapsible Answer Content */}
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 20px 16px 20px',
                      }}
                      className="animate-fade-in"
                    >
                      <p
                        style={{
                          fontSize: 'clamp(14px, 0.4vw + 12.5px, 16.5px)',
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
