import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing.tsx';
import { Poll } from './pages/Poll.tsx';
import { Vote } from './pages/Vote.tsx';
import { CardResult } from './pages/CardResult.tsx';
import { PersonalityVote } from './pages/PersonalityVote.tsx';
import { CheckDetail } from './pages/CheckDetail.tsx';
import { AskLogin } from './pages/AskLogin.tsx';
import { AskOtp } from './pages/AskOtp.tsx';
import { CreatedCheck } from './pages/CreatedCheck.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';
import { TermsOfService } from './pages/TermsOfService.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { applyDesignTokensToCss } from './design-tokens.js';

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
        <Route path="/vote/:pollId" element={<Vote />} />
        <Route path="/result/:shareCode" element={<CardResult />} />
        <Route path="/personality/:shareCode" element={<PersonalityVote />} />
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
