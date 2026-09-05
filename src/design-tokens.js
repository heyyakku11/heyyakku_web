/**
 * CENTRALIZED DESIGN TOKENS FOR YAKKU WEB APPLICATION
 * 
 * Modify values in this single file to instantly update styling across the entire site.
 * No need to touch component logic or multiple files.
 */

export const designTokens = {
  // 1. COLORS
  colors: {
    // Primary Brand Accent (Lavender)
    primary: '#7C65C1',
    primaryHover: '#684EB5',
    primaryLight: 'rgba(124, 101, 193, 0.10)',
    primarySubtle: 'rgba(124, 101, 193, 0.05)',
    primaryGlow: 'rgba(124, 101, 193, 0.25)',

    // Dark Neutrals & Headings
    dark: '#111111',
    darkAlt: '#1f2937',
    
    // Text Grays
    textPrimary: '#1f2937',
    textSecondary: '#4b5563',
    textMuted: '#6b7280',
    textSubtle: '#9ca3af',
    textWhite: '#ffffff',
    textWhiteMuted: 'rgba(255, 255, 255, 0.55)',
    textWhiteSubtle: 'rgba(255, 255, 255, 0.3)',

    // Borders & Dividers
    border: '#e5e7eb',
    borderDark: '#d1d5db',
    borderLight: '#f3f4f6',

    // Backgrounds
    bgWhite: '#ffffff',
    bgPage: '#fafafa',
    bgSecondary: '#f9fafb',
    bgMuted: '#f3f4f6',
    bgHeroLilac: '#E8E4F8',
    bgWatermark: 'rgba(160, 140, 220, 0.13)',
    bgDark: '#111111',

    transparent: 'transparent',
  },

  // 2. TYPOGRAPHY
  typography: {
    fontFamilies: {
      heading: "'Outfit', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      brand: "'Pacifico', cursive",
      watermark: "'Georgia', serif",
    },

    fontSizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      md: '1.125rem',    // 18px
      lg: '1.25rem',     // 20px
      xl: '1.5rem',      // 24px
      '2xl': '1.75rem',  // 28px
      '3xl': '2rem',     // 32px
      '4xl': '2.5rem',   // 40px
      '7xl': '4.5rem',   // 72px

      // Fluid/Responsive Font Sizes
      hero: 'clamp(40px, 12vw, 108px)',
      heroSubtitle: '16px',
      statNumber: 'clamp(32px, 5vw, 56px)',
      sectionHeading: 'clamp(36px, 5vw, 64px)',
      ctaHeading: 'clamp(40px, 6vw, 72px)',
      watermark: 'clamp(80px, 14vw, 180px)',
    },

    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    lineHeights: {
      none: 1,
      hero: 0.92,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
    },

    letterSpacings: {
      tight: '-0.03em',
      normal: '0em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // 3. SPACING (Margins & Paddings)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // 4. BORDER RADIUS
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // 5. SHADOWS & ELEVATION
  shadows: {
    none: 'none',
    navbarScroll: '0 1px 2px rgba(0, 0, 0, 0.05)',
    card: '0 4px 6px rgba(0, 0, 0, 0.07)',
    cardHover: '0 10px 15px rgba(0, 0, 0, 0.1)',
    buttonGlow: '0 4px 12px rgba(0, 196, 122, 0.25)',
    phoneHero: 'drop-shadow(0 24px 48px rgba(0, 0, 0, 0.22))',
    phoneHeroMobile: 'drop-shadow(0 16px 32px rgba(0, 0, 0, 0.18))',
    phoneProcess: 'drop-shadow(0 32px 64px rgba(0, 0, 0, 0.22))',
  },

  // 6. RESPONSIVE BREAKPOINTS
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },

  // 7. TRANSITIONS & ANIMATIONS
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 700ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Injects tokens into document CSS variables so they can be referenced in CSS
 */
export function applyDesignTokensToCss() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Colors
  Object.entries(designTokens.colors).forEach(([key, val]) => {
    root.style.setProperty(`--color-${key}`, val);
  });

  // Typography
  Object.entries(designTokens.typography.fontFamilies).forEach(([key, val]) => {
    root.style.setProperty(`--font-${key}`, val);
  });

  // Border Radii
  Object.entries(designTokens.borderRadius).forEach(([key, val]) => {
    root.style.setProperty(`--radius-${key}`, val);
  });

  // Spacings
  Object.entries(designTokens.spacing).forEach(([key, val]) => {
    root.style.setProperty(`--spacing-${key}`, val);
  });

  // Shadows
  Object.entries(designTokens.shadows).forEach(([key, val]) => {
    root.style.setProperty(`--shadow-${key}`, val);
  });
}

export default designTokens;
