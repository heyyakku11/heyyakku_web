import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Footer } from '../components/Footer.tsx';
import { designTokens } from '../design-tokens.js';

export function NotFound() {
  return (
    <div className="min-h-full flex flex-col" style={{ background: designTokens.colors.bgPage }}>
      <Navbar minimal />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-sm">
          <div
            className="text-7xl font-extrabold mb-4"
            style={{
              fontFamily: designTokens.typography.fontFamilies.heading,
              color: designTokens.colors.border,
            }}
          >
            404
          </div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: designTokens.typography.fontFamilies.heading,
              color: designTokens.colors.textPrimary,
            }}
          >
            Page not found
          </h1>
          <p className="text-sm mb-6" style={{ color: designTokens.colors.textMuted }}>
            Nothing to see here. Maybe the poll link you're looking for is at{' '}
            <code
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: designTokens.colors.bgSubtle,
                color: designTokens.colors.textPrimary,
              }}
            >
              /p/demo
            </code>
            .
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

export default NotFound;
