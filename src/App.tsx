import { useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useParams } from 'react-router-dom';
import { Landing } from './pages/Landing.tsx';
import { Poll } from './pages/Poll.tsx';
import { Vote } from './pages/Vote.tsx';
import { VoteResult } from './pages/VoteResult.tsx';
import { LiveCheck } from './pages/LiveCheck.tsx';
import { CardResult } from './pages/CardResult.tsx';
import { LegacyPersonalityRedirect, PersonalityVote } from './pages/PersonalityVote.tsx';
import { CheckDetail } from './pages/CheckDetail.tsx';
import { CheckCreate } from './pages/CheckCreate.tsx';
import { CreatePoll } from './pages/CreatePoll.tsx';
import { AskLogin } from './pages/AskLogin.tsx';
import { AskOtp } from './pages/AskOtp.tsx';
import { Auth } from './pages/Auth.tsx';
import { CreatedCheck } from './pages/CreatedCheck.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';
import { TermsOfService } from './pages/TermsOfService.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { votePath, voteResultPath } from './lib/voteLinks.ts';
import { applyDesignTokensToCss } from './design-tokens.js';

/** Old path links `/vote/{code}` → `/vote?share_code={code}`. */
function LegacyVoteRedirect({ result = false }: { result?: boolean }) {
  const { pollId } = useParams<{ pollId: string }>();
  if (!pollId || pollId === 'result') return <Navigate to="/" replace />;
  return <Navigate to={result ? voteResultPath(pollId) : votePath(pollId)} replace />;
}

export function App() {
  useEffect(() => {
    // Synchronize design tokens to CSS custom properties
    applyDesignTokensToCss();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/p/:pollId" element={<Poll />} />
        <Route path="/vote/result" element={<VoteResult />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/vote/:pollId/result" element={<LegacyVoteRedirect result />} />
        <Route path="/vote/:pollId" element={<LegacyVoteRedirect />} />
        <Route path="/live-check" element={<LiveCheck />} />
        <Route path="/create" element={<CreatePoll />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/result/:shareCode" element={<CardResult />} />
        <Route path="/personality" element={<PersonalityVote />} />
        <Route path="/personality/:shareCode" element={<LegacyPersonalityRedirect />} />
        <Route path="/check/:checkId/create" element={<CheckCreate />} />
        <Route path="/check/:checkId" element={<CheckDetail />} />
        <Route path="/ask/login" element={<AskLogin />} />
        <Route path="/ask/otp" element={<AskOtp />} />
        <Route path="/created/:shareCode" element={<CreatedCheck />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
