import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Note: import useLocation if adding route-aware nav links
import { designTokens } from '../design-tokens.js';

interface NavbarProps {
  minimal?: boolean;
}

export function Navbar({ minimal = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Unused for now while nav links are temporarily removed. Uncomment when adding new links:
  // const location = useLocation();
  // const handleNavClick = (anchorId: string) => {
  //   setMobileMenuOpen(false);
  //   if (location.pathname !== '/') {
  //     window.location.href = `/#${anchorId}`;
  //     return;
  //   }
  //   const element = document.getElementById(anchorId);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth' });
  //   }
  // };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: designTokens.colors.bgWhite,
        borderBottom: isScrolled
          ? `1px solid ${designTokens.colors.border}`
          : `1px solid ${designTokens.colors.transparent}`,
        boxShadow: isScrolled ? designTokens.shadows.navbarScroll : designTokens.shadows.none,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center">
          <span
            style={{
              fontFamily: designTokens.typography.fontFamilies.brand,
              fontSize: '26px',
              color: designTokens.colors.dark,
              lineHeight: 1,
            }}
          >
            Yakku
          </span>
        </Link>

        {/* Minimal Mode: Back Link */}
        {minimal && (
          <Link
            to="/"
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: designTokens.colors.textMuted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = designTokens.colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = designTokens.colors.textMuted;
            }}
          >
            ← Back to Yakku
          </Link>
        )}
      </div>

    </nav>
  );
}

export default Navbar;
