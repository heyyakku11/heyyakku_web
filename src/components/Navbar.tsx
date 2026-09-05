import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Note: import useLocation if adding route-aware nav links
import { designTokens } from '../design-tokens.js';

interface NavbarProps {
  minimal?: boolean;
}

export function Navbar({ minimal = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Desktop Navigation */}
        {!minimal && (
          <>
            {/* Navigation links (temporarily hidden - ready for future links) */}
            {/*
            <div className="hidden md:flex items-center gap-8">
              <button
                type="button"
                onClick={() => handleNavClick('how-it-works')}
                className="text-sm font-medium transition-colors duration-150 cursor-pointer"
                style={{ color: designTokens.colors.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = designTokens.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = designTokens.colors.textMuted;
                }}
              >
                FAQ
              </button>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('how-it-works');
                }}
                className="text-sm font-medium transition-colors duration-150"
                style={{ color: designTokens.colors.textMuted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = designTokens.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = designTokens.colors.textMuted;
                }}
              >
                About
              </a>
            </div>
            */}

            <div className="hidden md:flex items-center gap-3">
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  const cta = document.getElementById('download');
                  if (cta) cta.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm font-bold px-6 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: designTokens.colors.dark,
                  color: designTokens.colors.dark,
                  background: designTokens.colors.transparent,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = designTokens.colors.dark;
                  e.currentTarget.style.color = designTokens.colors.textWhite;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = designTokens.colors.transparent;
                  e.currentTarget.style.color = designTokens.colors.dark;
                }}
              >
                Download App
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <span
                className="block w-5 h-0.5 transition-all duration-200"
                style={{
                  background: designTokens.colors.darkAlt,
                  transform: mobileMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block w-5 h-0.5 transition-all duration-200"
                style={{
                  background: designTokens.colors.darkAlt,
                  opacity: mobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="block w-5 h-0.5 transition-all duration-200"
                style={{
                  background: designTokens.colors.darkAlt,
                  transform: mobileMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </>
        )}

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

      {/* Mobile Drawer Menu */}
      {!minimal && mobileMenuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{
            borderColor: designTokens.colors.border,
            background: designTokens.colors.bgWhite,
          }}
        >
          {/* Navigation links (temporarily hidden - ready for future links) */}
          {/*
          <button
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="text-sm font-medium text-left"
            style={{ color: designTokens.colors.textMuted }}
          >
            FAQ
          </button>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('how-it-works');
            }}
            className="text-sm font-medium"
            style={{ color: designTokens.colors.textMuted }}
          >
            About
          </a>
          */}
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              const cta = document.getElementById('download');
              if (cta) cta.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-bold px-6 py-2.5 rounded-full border-2 text-center"
            style={{
              borderColor: designTokens.colors.dark,
              color: designTokens.colors.dark,
            }}
          >
            Download App
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
