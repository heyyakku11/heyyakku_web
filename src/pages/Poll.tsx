import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { PollCard, type PollOption } from '../components/PollCard.tsx';
import { designTokens } from '../design-tokens.js';

interface PollDefinition {
  question: string;
  options: PollOption[];
  totalVotes: number;
}

const PRESET_POLLS: Record<string, PollDefinition> = {
  demo: {
    question: "What's the most overrated social media platform right now?",
    options: [
      { id: 'a', text: 'Instagram — too many ads', votes: 214 },
      { id: 'b', text: 'X / Twitter — chaotic mess', votes: 389 },
      { id: 'c', text: 'LinkedIn — cringe content', votes: 176 },
      { id: 'd', text: 'TikTok — attention-drain', votes: 98 },
    ],
    totalVotes: 877,
  },
  abc123: {
    question: 'Should remote work be the default for office jobs?',
    options: [
      { id: 'a', text: 'Yes — always, no exceptions', votes: 541 },
      { id: 'b', text: 'Hybrid is the sweet spot', votes: 312 },
      { id: 'c', text: 'No — office culture matters', votes: 89 },
    ],
    totalVotes: 942,
  },
};

export function Poll() {
  const { pollId } = useParams<{ pollId: string }>();
  const currentPoll = pollId ? PRESET_POLLS[pollId] ?? null : null;

  if (!currentPoll) {
    return (
      <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgPage }}>
        <Navbar minimal />
        <main className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-2xl"
              style={{ background: designTokens.colors.bgSubtle }}
            >
              🔍
            </div>
            <h1
              className="text-2xl font-bold mb-3"
              style={{
                fontFamily: designTokens.typography.fontFamilies.heading,
                color: designTokens.colors.textPrimary,
              }}
            >
              Poll not found
            </h1>
            <p className="text-sm mb-6" style={{ color: designTokens.colors.textMuted }}>
              This poll may have expired or the link might be broken.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
              style={{
                background: designTokens.colors.primary,
                color: designTokens.colors.textWhite,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = designTokens.colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = designTokens.colors.primary;
              }}
            >
              Back to Yakku
            </Link>
          </div>
        </main>
        <Footer minimal />
      </div>
    );
  }

  return (
    <div
      className="min-h-full flex flex-col"
      style={{ background: designTokens.colors.bgSecondary }}
    >
      <Navbar minimal />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md animate-fade-in" style={{ opacity: 0 }}>
          <div className="text-center mb-8">
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: designTokens.colors.textSubtle }}
            >
              Anonymous Poll
            </p>
          </div>

          <PollCard
            question={currentPoll.question}
            options={currentPoll.options}
            totalVotes={currentPoll.totalVotes}
          />

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: designTokens.colors.textSubtle }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = designTokens.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = designTokens.colors.textSubtle;
              }}
            >
              ← Powered by Yakku
            </Link>
          </div>
        </div>
      </main>
      <Footer minimal />
    </div>
  );
}

export default Poll;
