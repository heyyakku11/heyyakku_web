import { Link } from 'react-router-dom';
import { designTokens } from '../design-tokens.js';

interface FooterProps {
  minimal?: boolean;
}

export function FooterBrand({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: designTokens.typography.fontFamilies.brand,
        fontSize: `${size}px`,
        color: designTokens.colors.dark,
        lineHeight: 1,
      }}
    >
      Yakku
    </span>
  );
}

const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: ['Explore'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Cookies'],
  },
];

export function Footer({ minimal = false }: FooterProps) {
  if (minimal) {
    return (
      <footer
        className="border-t py-6 text-center"
        style={{
          borderColor: designTokens.colors.border,
          background: designTokens.colors.bgSecondary,
        }}
      >
        <Link to="/" className="flex items-center justify-center">
          <FooterBrand size={22} />
        </Link>
        <p className="text-xs mt-2" style={{ color: designTokens.colors.textSubtle }}>
          Ask anything. Get honest answers.
        </p>
      </footer>
    );
  }

  return (
    <footer
      className="border-t"
      style={{
        borderColor: designTokens.colors.border,
        background: designTokens.colors.bgSecondary,
      }}
    >
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="inline-block mb-3">
              <FooterBrand size={24} />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: designTokens.colors.textMuted }}>
              Ask anything.
              <br />
              Get honest answers.
            </p>
          </div>

          <div className="footer-nav">
            {FOOTER_SECTIONS.map((section) => (
              <div key={section.title}>
                <p
                  className="footer-nav-title text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: designTokens.colors.textSubtle }}
                >
                  {section.title}
                </p>
                <ul
                  className="flex flex-col gap-3"
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {section.links.map((link) => (
                    <li key={link} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        className="text-sm transition-colors duration-150 inline-block"
                        style={{
                          color: designTokens.colors.textMuted,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = designTokens.colors.dark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = designTokens.colors.textMuted;
                        }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom border-t" style={{ borderColor: designTokens.colors.border }}>
          <p className="text-xs" style={{ color: designTokens.colors.textSubtle }}>
            © 2026 Yakku. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: designTokens.colors.textSubtle }}>
            Anonymous by design.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
