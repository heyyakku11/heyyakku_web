import { androidStoreUrl } from '../lib/openApp.ts';

// Google Play badge. Everything inside is sized in em, so it scales with the one font-size below.
export function GooglePlayBadge({ href = androidStoreUrl }: { href?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className="cta-store-btn transition-all duration-200"
      style={{
        background: '#000000',
        color: '#FFFFFF',
        border: '1px solid #A6A6A6',
        borderRadius: 8,
        fontSize: 'clamp(16px, 1.6vw + 10px, 26px)',
        width: 'auto',
        height: '3.6em',
        alignSelf: 'center',
        padding: '0 1.6em 0 1.2em',
        gap: '0.55em',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg style={{ width: '1.35em', height: '1.45em' }} viewBox="0 0 24 24">
        <path fill="#00A0FF" d="M1.48 3.66a1.75 1.75 0 0 0-.48 1.23v14.22c0 .47.17.9.48 1.23l.07.06 7.96-7.96v-.19L1.55 3.6l-.07.06z" />
        <path fill="#FFD500" d="M18.52 13.06l-2.72-1.61-2.84 2.84 2.84 2.84 2.73-1.62c.78-.46.78-1.99-.01-2.45z" />
        <path fill="#FF3A44" d="M3.18 23.76c.3.17.64.22.98.14l11.65-6.9-2.52-2.52-10.11 9.28z" />
        <path fill="#00F076" d="M4.16.14C3.82.06 3.48.11 3.18.28L13.3 10.4l2.52-2.52L4.16.14z" />
      </svg>
      <div style={{ textAlign: 'left' }}>
        <p style={{ margin: 0, lineHeight: 1, textTransform: 'uppercase', fontSize: '0.5em', letterSpacing: '0.04em' }}>
          Get it on
        </p>
        <p style={{ margin: '0.1em 0 0', lineHeight: 1.25, fontSize: '1.1em', fontWeight: 500 }}>Google Play</p>
      </div>
    </a>
  );
}

export default GooglePlayBadge;
