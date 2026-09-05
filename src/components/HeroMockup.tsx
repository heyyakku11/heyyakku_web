import { designTokens } from '../design-tokens.js';

interface HeroMockupProps {
  imageSrc?: string;
  alt?: string;
}

export function HeroMockup({
  imageSrc = '/yakku_hero.png',
  alt = 'Yakku app showing anonymous poll questions',
}: HeroMockupProps) {
  return (
    <>
      {/* Desktop Phone Mockup (Layer 2: Highest z-index: 20) */}
      <div
        className="hidden lg:flex flex-shrink-0 items-end justify-center pointer-events-none"
        style={{
          position: 'relative',
          zIndex: 20, // Highest layer: above base hero and lavender area
        }}
      >
        <img
          src={imageSrc}
          alt={alt}
          style={{
            height: 'clamp(660px, 84vh, 920px)',
            width: 'auto',
            display: 'block',
            filter: designTokens.shadows.phoneHero,
            transform: 'translateY(2px)',
            pointerEvents: 'auto',
          }}
        />
      </div>

      {/* Mobile Phone Mockup (Layer 2: Highest z-index: 20) */}
      <div
        className="lg:hidden flex justify-center px-6 pb-0 mt-8 pointer-events-none"
        style={{
          position: 'relative',
          zIndex: 20,
        }}
      >
        <img
          src={imageSrc}
          alt={alt}
          style={{
            height: 'clamp(440px, 88vw, 540px)',
            width: 'auto',
            filter: designTokens.shadows.phoneHeroMobile,
            transform: 'translateY(2px)',
            pointerEvents: 'auto',
          }}
        />
      </div>
    </>
  );
}
