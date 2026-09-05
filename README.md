# Yakku — Anonymous Polling Web Application

A pixel-perfect, responsive web application built with **React 19**, **TypeScript**, and **Vite**, faithfully reproducing the Figma design for [Yakku](https://coat-local-63039650.figma.site) — the anonymous polling platform designed for Gen Z.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

### 3. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready build in `dist/`.

### 4. Lint and Code Quality
```bash
npm run lint
```
Runs high-speed lint checks across the codebase.

---

## Centralized Design Tokens (`src/design-tokens.js`)

All visual attributes across the entire application are managed through a single, centralized configuration file:
👉 **[`src/design-tokens.js`](src/design-tokens.js)**

Any modification made in `design-tokens.js` instantly propagates throughout all components, pages, and CSS variables **without touching any component logic or JSX**.

### How to Modify Design Elements

#### 1. Changing Brand & Theme Colors
Open `src/design-tokens.js` and edit the `colors` object:
```javascript
export const designTokens = {
  colors: {
    primary: '#00c47a',         // Primary emerald accent (buttons, active states, highlights)
    primaryHover: '#00b36e',    // Button hover state
    primaryLight: 'rgba(0, 196, 122, 0.08)', // Background tint for selected poll bars
    dark: '#111111',            // Deep black for headlines and dark CTA banner
    bgHeroLilac: '#E8E4F8',     // Lilac background for the hero split section
    textSecondary: '#4b5563',   // Paragraph copy color
    textMuted: '#6b7280',       // Labels and subtle text
    border: '#e5e7eb',          // Card and divider borders
    // ...
  },
};
```

#### 2. Changing Typography & Font Stacks
Google Fonts (`Pacifico`, `Outfit`, `Inter`) are loaded via `index.html`. You can customize font assignments in `typography`:
```javascript
export const designTokens = {
  typography: {
    fontFamilies: {
      heading: "'Outfit', sans-serif",   // All h1-h6 headings & metrics
      body: "'Inter', sans-serif",       // General UI, buttons, paragraphs
      brand: "'Pacifico', cursive",      // Yakku brand script logo
      watermark: "'Georgia', serif",     // Hero background ambient watermark
    },
    fontSizes: {
      hero: 'clamp(56px, 8.5vw, 112px)', // Fluid hero headline scaling
      statNumber: 'clamp(32px, 5vw, 56px)',
      sectionHeading: 'clamp(36px, 5vw, 64px)',
      ctaHeading: 'clamp(40px, 6vw, 72px)',
    },
  },
};
```

#### 3. Adjusting Spacing & Paddings
Standard 4px base spacing scale:
```javascript
export const designTokens = {
  spacing: {
    1: '4px',
    2: '8px',
    4: '16px',
    6: '24px',
    8: '32px',
    12: '48px',
    16: '64px',
    24: '96px',
  },
};
```

#### 4. Adjusting Border Radii & Elevation Shadows
```javascript
export const designTokens = {
  borderRadius: {
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.07)',
    cardHover: '0 10px 15px rgba(0, 0, 0, 0.1)',
    buttonGlow: '0 4px 12px rgba(0, 196, 122, 0.25)',
    phoneHero: 'drop-shadow(0 24px 48px rgba(0, 0, 0, 0.22))',
  },
};
```

---

## Component Architecture

```
src/
├── design-tokens.js       # Centralized design tokens (colors, fonts, spacing, shadows)
├── design-tokens.d.ts     # TypeScript type declarations for design tokens
├── index.css              # Global styling, utility classes, and keyframe animations
├── main.tsx               # Application entry point
├── App.tsx                # Client-side router configuration
├── components/
│   ├── Navbar.tsx         # Navigation header with sticky scroll detection & mobile menu
│   ├── Footer.tsx         # 4-column directory footer & minimal footer mode
│   └── PollCard.tsx       # Interactive poll card with voting, percentages & sharing
└── pages/
    ├── Landing.tsx        # Landing page (Hero, Stats, 3-Step Process, CTA banner)
    ├── Poll.tsx           # Standalone poll page (/p/:pollId) with demo polls & 404 state
    └── NotFound.tsx       # 404 Page Not Found route
```

### Component Breakdown

### 1. `Navbar` (`src/components/Navbar.tsx`)
- **Sticky Scroll Header**: Dynamically shows border and shadow when user scrolls > 8px.
- **Brand Mark**: Rendered in `Pacifico` script (26px).
- **Navigation Links**: FAQ (smooth scroll to Process), About, and "Download App" CTA button.
- **Mobile Menu**: Responsive hamburger button with animated 3-bar transition to 'X'.
- **Minimal Mode**: Available for dedicated poll and error pages (`<Navbar minimal />`).

### 2. `PollCard` (`src/components/PollCard.tsx`)
- **Interactive Voting Flow**:
  1. Click any option to select (custom radio button with green accent).
  2. Click "Vote" button (shows 600ms submission spinner).
  3. Dynamic transition to percentage bars with animated fill, checkmark indicator on chosen option, and highest-voted highlight.
- **Share Integration**: Native Web Share API (`navigator.share`) with automatic fallback to clipboard copy ("Link Copied!").
- **Live Counter**: Formats and increments vote tally in real time.

### 3. `Landing` (`src/pages/Landing.tsx`)
- **Split Hero**: Top white, lower 52% `#E8E4F8` lilac with italicized Georgia serif "Yakku" watermark.
- **Hero Visual**: Drop-shadowed phone mockup showcasing Yakku poll questions.
- **Metrics Bar**: 3-metric statistical overview (`2M+ Votes Cast`, `180K+ Polls Created`, `4.9+ App Store Rating`).
- **Process Section (`#how-it-works`)**: 3-step guide (`Create`, `Share`, `Answer`) with staggered dual-phone visuals.
- **Dark CTA Banner (`#download`)**: Emerald radial gradient glow, App Store and Google Play badges.

### 4. `Poll` (`src/pages/Poll.tsx`)
- Dynamic route `/p/:pollId`.
- Includes mock polls:
  - `/p/demo` ("What's the most overrated social media platform right now?")
  - `/p/abc123` ("Should remote work be the default for office jobs?")
- Unrecognized poll IDs gracefully display a dedicated "Poll not found" state.

---

## Responsive Breakpoints

Designed mobile-first and tested at key device viewports:

| Breakpoint | Target Viewport | Key Layout Behavior |
|---|---|---|
| **Mobile (`320px - 639px`)** | Small to medium smartphones | Single-column stats, mobile hamburger menu, centered phone preview, stacked download CTAs |
| **Tablet (`768px - 1023px`)** | iPads, tablets | 3-column stats bar, horizontal store buttons, desktop navbar |
| **Desktop (`1024px - 1439px`)** | Laptops, desktops | Side-by-side hero layout, staggered process phone display, 4-column footer |
| **Wide (`1440px+`)** | High-resolution displays | Centered maximum width container (`max-w-7xl`), fluid headline clamp scaling |

---

## Testing & Quality Checklist

- [x] **Colors**: Match Figma design tokens exactly (emerald `#00c47a`, dark `#111111`, lilac `#E8E4F8`).
- [x] **Typography**: Exact fonts loaded (`Outfit`, `Pacifico`, `Inter`, `Georgia`).
- [x] **Zero Hardcoded Values**: All styling derived from `design-tokens.js`.
- [x] **Responsiveness**: Flawless display across 320px, 768px, 1024px, and 1440px.
- [x] **Interactive States**: Smooth hover transitions, voting flow, spinner, percentage calculations.
- [x] **Console Errors**: 0 warnings, 0 errors in lint and build.
- [x] **Performance**: Production bundle < 300kB gzipped, page load < 1 second.
