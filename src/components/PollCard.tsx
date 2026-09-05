import { useState } from 'react';
import { designTokens } from '../design-tokens.js';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  question: string;
  options: PollOption[];
  totalVotes?: number;
  initialVoted?: boolean;
  compact?: boolean;
  onVote?: (optionId: string) => void;
}

export function PollCard({
  question,
  options,
  totalVotes = 0,
  initialVoted = false,
  compact = false,
  onVote,
}: PollCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(initialVoted);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentTotalVotes, setCurrentTotalVotes] = useState<number>(totalVotes);
  const [shareFeedback, setShareFeedback] = useState<boolean>(false);

  // Compute live vote total
  const calculatedTotal = hasVoted
    ? options.reduce((sum, opt) => sum + opt.votes, 0) + (hasVoted && selectedOptionId ? 1 : 0)
    : currentTotalVotes;

  const getOptionPercentage = (opt: PollOption) => {
    const optVotes = opt.votes + (hasVoted && selectedOptionId === opt.id ? 1 : 0);
    return calculatedTotal > 0 ? Math.round((optVotes / calculatedTotal) * 100) : 0;
  };

  const handleVoteSubmit = async () => {
    if (!selectedOptionId || hasVoted || isSubmitting) return;
    setIsSubmitting(true);
    // Authentic simulated latency matching Figma specification
    await new Promise((res) => setTimeout(res, 600));
    setHasVoted(true);
    setCurrentTotalVotes((prev) => prev + 1);
    setIsSubmitting(false);
    onVote?.(selectedOptionId);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: question,
          text: `Vote on Yakku: ${question}`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  const maxPercentage = Math.max(...options.map(getOptionPercentage));

  return (
    <div
      className="bg-white rounded-xl border transition-shadow duration-200 flex flex-col"
      style={{
        borderColor: designTokens.colors.border,
        boxShadow: designTokens.shadows.card,
        padding: compact ? '20px' : '28px',
        maxWidth: compact ? '100%' : '480px',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = designTokens.shadows.cardHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = designTokens.shadows.card;
      }}
    >
      {/* Yakku Badge Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
          style={{
            background: designTokens.colors.primary,
            fontFamily: designTokens.typography.fontFamilies.heading,
          }}
        >
          Y
        </div>
        <span
          className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: designTokens.colors.textMuted }}
        >
          Yakku
        </span>
      </div>

      {/* Question Headline */}
      <h3
        className="font-bold mb-5 leading-snug"
        style={{
          fontFamily: designTokens.typography.fontFamilies.heading,
          fontSize: compact ? '18px' : '20px',
          color: designTokens.colors.textPrimary,
        }}
      >
        {question}
      </h3>

      {/* Poll Options List */}
      <div className="flex flex-col gap-3 mb-5">
        {options.map((opt, index) => {
          const percentage = getOptionPercentage(opt);
          const isSelected = selectedOptionId === opt.id;
          const isHighest = hasVoted && percentage === maxPercentage;

          if (hasVoted) {
            return (
              <div
                key={opt.id}
                className="rounded-lg overflow-hidden animate-fade-in"
                style={{
                  animationDelay: `${index * 80}ms`,
                  border: isSelected
                    ? `1.5px solid ${designTokens.colors.primary}`
                    : `1.5px solid ${designTokens.colors.border}`,
                }}
              >
                <div className="px-4 py-3 relative">
                  {/* Progress fill bar */}
                  <div
                    className="absolute inset-0 rounded-lg transition-all duration-700"
                    style={{
                      background: isSelected
                        ? designTokens.colors.primaryLight
                        : isHighest
                        ? designTokens.colors.primarySubtle
                        : 'rgba(0, 0, 0, 0.02)',
                      width: `${percentage}%`,
                    }}
                  />

                  {/* Option row content */}
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {isSelected && (
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ background: designTokens.colors.primary }}
                        >
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path
                              d="M1 3l2 2 4-4"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: isSelected ? designTokens.colors.primary : designTokens.colors.textPrimary,
                        }}
                      >
                        {opt.text}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{
                        color: isSelected ? designTokens.colors.primary : designTokens.colors.textMuted,
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Unvoted state: radio selection button
          return (
            <button
              type="button"
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left w-full transition-all duration-150 cursor-pointer group"
              style={{
                borderColor: isSelected ? designTokens.colors.primary : designTokens.colors.border,
                background: isSelected ? 'rgba(0, 196, 122, 0.06)' : designTokens.colors.bgWhite,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = designTokens.colors.bgSecondary;
                  e.currentTarget.style.borderColor = designTokens.colors.borderDark;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = designTokens.colors.bgWhite;
                  e.currentTarget.style.borderColor = designTokens.colors.border;
                }
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-150 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? designTokens.colors.primary : designTokens.colors.borderDark,
                  background: isSelected ? designTokens.colors.primary : designTokens.colors.transparent,
                }}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color: isSelected ? designTokens.colors.primary : designTokens.colors.textPrimary,
                }}
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lock Anonymous Meta Row */}
      <div className="flex items-center gap-2 mb-5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect
            x="1"
            y="4"
            width="12"
            height="9"
            rx="2"
            stroke={designTokens.colors.textSubtle}
            strokeWidth="1.2"
          />
          <path
            d="M4 4V3a3 3 0 016 0v1"
            stroke={designTokens.colors.textSubtle}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs" style={{ color: designTokens.colors.textSubtle }}>
          Anonymous poll
          {hasVoted && (
            <>
              {' · '}
              <span className="font-medium">{calculatedTotal.toLocaleString()} votes</span>
            </>
          )}
        </span>
      </div>

      {/* Primary Action Button */}
      {hasVoted ? (
        <div className="flex gap-2 animate-fade-in">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-all duration-200 flex items-center justify-center gap-1.5"
            style={{
              borderColor: designTokens.colors.primary,
              color: designTokens.colors.primary,
              background: designTokens.colors.bgWhite,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 196, 122, 0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = designTokens.colors.bgWhite;
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="11" cy="2.5" r="1.5" stroke={designTokens.colors.primary} strokeWidth="1.2" />
              <circle cx="11" cy="11.5" r="1.5" stroke={designTokens.colors.primary} strokeWidth="1.2" />
              <circle cx="3" cy="7" r="1.5" stroke={designTokens.colors.primary} strokeWidth="1.2" />
              <path
                d="M4.4 6.2L9.6 3.3M4.4 7.8L9.6 10.7"
                stroke={designTokens.colors.primary}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {shareFeedback ? 'Link Copied!' : 'Share'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleVoteSubmit}
          disabled={!selectedOptionId || isSubmitting}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background:
              selectedOptionId && !isSubmitting
                ? designTokens.colors.primary
                : designTokens.colors.border,
            color:
              selectedOptionId && !isSubmitting
                ? designTokens.colors.textWhite
                : designTokens.colors.textSubtle,
            cursor: selectedOptionId && !isSubmitting ? 'pointer' : 'not-allowed',
            boxShadow:
              selectedOptionId && !isSubmitting
                ? designTokens.shadows.buttonGlow
                : designTokens.shadows.none,
          }}
          onMouseEnter={(e) => {
            if (selectedOptionId && !isSubmitting) {
              e.currentTarget.style.background = designTokens.colors.primaryHover;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOptionId && !isSubmitting) {
              e.currentTarget.style.background = designTokens.colors.primary;
            }
          }}
        >
          {isSubmitting ? (
            <>
              <span
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                style={{ display: 'inline-block' }}
              />
              Submitting…
            </>
          ) : (
            'Vote'
          )}
        </button>
      )}
    </div>
  );
}

export default PollCard;
