export interface DesignTokens {
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primarySubtle: string;
    primaryGlow: string;
    dark: string;
    darkAlt: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textSubtle: string;
    textWhite: string;
    textWhiteMuted: string;
    textWhiteSubtle: string;
    border: string;
    borderDark: string;
    borderLight: string;
    bgWhite: string;
    bgPage: string;
    bgSecondary: string;
    bgMuted: string;
    bgSubtle: string;
    bgHeroLilac: string;
    bgWatermark: string;
    bgDark: string;
    transparent: string;
  };
  typography: {
    fontFamilies: {
      heading: string;
      body: string;
      brand: string;
      watermark: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '7xl': string;
      hero: string;
      heroSubtitle: string;
      statNumber: string;
      sectionHeading: string;
      ctaHeading: string;
      watermark: string;
    };
    fontWeights: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeights: {
      none: number;
      hero: number;
      tight: number;
      snug: number;
      normal: number;
      relaxed: number;
    };
    letterSpacings: {
      tight: string;
      normal: string;
      wider: string;
      widest: string;
    };
  };
  spacing: Record<number | string, string>;
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  shadows: {
    none: string;
    navbarScroll: string;
    card: string;
    cardHover: string;
    buttonGlow: string;
    phoneHero: string;
    phoneHeroMobile: string;
    phoneProcess: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  transitions: {
    fast: string;
    default: string;
    slow: string;
  };
}

export declare const designTokens: DesignTokens;
export declare function applyDesignTokensToCss(): void;
export default designTokens;
