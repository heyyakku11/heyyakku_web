import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing.tsx';
import { Poll } from './pages/Poll.tsx';
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
