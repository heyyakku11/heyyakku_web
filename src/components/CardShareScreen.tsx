import { useState, type CSSProperties, type ReactNode } from 'react';

/** Mirrors YakkuPalette + card_share_screen / share_destinations.dart */
const ui = {
  cream: '#FFF9F6',
  ink: '#21191D',
  raspberry: '#D02E62',
  white: '#FFFFFF',
  charcoal: '#1B1418',
  whatsapp: '#25D366',
  snapchat: '#FFFC00',
  facebook: '#1877F2',
  muted: 'rgba(33, 25, 29, 0.55)',
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

function shareNative(url: string, question: string) {
  if (navigator.share) {
    void navigator.share({ title: 'Yakku', text: question, url }).catch(() => undefined);
    return;
  }
  void copyLink(url);
}

function shareWhatsApp(url: string, question: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(`${question}\n${url}`)}`, '_blank', 'noopener,noreferrer');
}

function shareFacebook(url: string) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
}

function Icon({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Font Awesome–style glyphs at the same 24px the app uses. */
const icons = {
  chevronLeft: (
    <Icon size={18}>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </Icon>
  ),
  instagram: (
    <Icon size={24}>
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8A3.6 3.6 0 007.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6A3.6 3.6 0 0016.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z" />
    </Icon>
  ),
  whatsapp: (
    <Icon size={24}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </Icon>
  ),
  snapchat: (
    <Icon size={24}>
      <path d="M12.148.502c2.208 0 3.766 1.598 3.937 3.795.047.59.09 1.19.136 1.775.031.39.145.563.48.74.27.144.62.277.988.422.783.31 1.66.68 1.66 1.66 0 .43-.26.74-.74.98-.12.06-.25.15-.25.29 0 .16.18.3.36.42.86.53 2.06 1.27 1.57 2.5-.28.68-1.02.98-2.13 1.05-.42.03-.74.15-.92.45-.34.54-1.01 1.45-2.84 1.45-.25 0-.5-.02-.76-.04-.17.39-.56.95-1.76 1.13v1.56h-1.6v-1.54c-1.2-.18-1.59-.74-1.76-1.13-.26.02-.51.04-.76.04-1.83 0-2.5-.91-2.84-1.45-.18-.3-.5-.42-.92-.45-1.11-.07-1.85-.37-2.13-1.05-.49-1.23.71-1.97 1.57-2.5.18-.12.36-.26.36-.42 0-.14-.13-.23-.25-.29-.48-.24-.74-.55-.74-.98 0-.98.88-1.35 1.66-1.66.37-.145.72-.278.99-.422.33-.177.45-.35.48-.74.04-.585.09-1.185.13-1.775C8.38 2.1 9.94.502 12.148.502z" />
    </Icon>
  ),
  facebookF: (
    <Icon size={22}>
      <path d="M15.12 7.5H13V5.75c0-.55.36-.68.61-.68H15V2.5h-2.29C10.1 2.5 9.5 4.1 9.5 5.55V7.5H7.75v2.75H9.5V17.5h3.5v-7.25H15l.12-2.75z" />
    </Icon>
  ),
  link: (
    <Icon size={22}>
      <path d="M3.9 12a5 5 0 017.07-7.07l1.41 1.41-1.41 1.41A3 3 0 105.3 13.7l1.41 1.41A5 5 0 013.9 12zm4.24 1.41l1.41-1.41a3 3 0 004.24-4.24l1.41-1.41a5 5 0 11-7.07 7.07l-.001-.001zM10.59 13.41l2.83-2.83 1.41 1.41-2.83 2.83-1.41-1.41z" />
    </Icon>
  ),
};

type DestinationKey = 'instagram' | 'whatsapp' | 'snapchat' | 'facebook' | 'copy';

type Destination = {
  key: DestinationKey;
  label: string;
  bg: string;
  iconColor: string;
  icon: ReactNode;
  run: (url: string, question: string) => void | Promise<void>;
};

/** App standardShareDestinations — circle 52, icon 24, column 66. */
const DESTINATIONS: Destination[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    bg: 'linear-gradient(to top right, #FEDA75, #D62976, #4F5BD5)',
    iconColor: ui.white,
    icon: icons.instagram,
    run: (url, question) => shareNative(url, question),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    bg: ui.whatsapp,
    iconColor: ui.white,
    icon: icons.whatsapp,
    run: (url, question) => shareWhatsApp(url, question),
  },
  {
    key: 'snapchat',
    label: 'Snapchat',
    bg: ui.snapchat,
    iconColor: '#000',
    icon: icons.snapchat,
    run: (url, question) => shareNative(url, question),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    bg: ui.facebook,
    iconColor: ui.white,
    icon: icons.facebookF,
    run: (url) => shareFacebook(url),
  },
  {
    key: 'copy',
    label: 'Copy link',
    bg: ui.charcoal,
    iconColor: ui.white,
    icon: icons.link,
    run: async (url) => {
      await copyLink(url);
    },
  },
];

export function ShareDestinationRow({
  url,
  question,
  onShared,
}: {
  url: string;
  question: string;
  onShared?: () => void;
}) {
  const [busy, setBusy] = useState<DestinationKey | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      {DESTINATIONS.map((d) => {
        const label = d.key === 'copy' && copied ? 'Copied' : d.label;
        return (
          <button
            key={d.key}
            type="button"
            aria-label={`Share via ${d.label}`}
            disabled={busy != null}
            onClick={() => {
              setBusy(d.key);
              void Promise.resolve(d.run(url, question)).then(() => {
                if (d.key === 'copy') {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                }
                setBusy(null);
                onShared?.();
              });
            }}
            style={{
              width: 66,
              flex: '0 0 66px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: busy != null ? 'default' : 'pointer',
              fontFamily: ui.body,
              color: ui.ink,
            }}
          >
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: d.bg,
                color: d.iconColor,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              {busy === d.key ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2.2px solid ${d.iconColor}`,
                    borderTopColor: 'transparent',
                    boxSizing: 'border-box',
                    animation: 'card-share-spin 0.7s linear infinite',
                  }}
                />
              ) : (
                d.icon
              )}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: 7,
                fontSize: 11,
                fontWeight: 600,
                color: ui.ink,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function StoryButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ borderRadius: 999, boxShadow: `0 4px 0 ${ui.ink}` }}>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          height: 54,
          border: 'none',
          borderRadius: 999,
          background: ui.raspberry,
          color: ui.white,
          fontFamily: ui.body,
          fontSize: 16,
          fontWeight: 800,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {icons.instagram}
        Share to Instagram Story
      </button>
    </div>
  );
}

/**
 * Web counterpart of app CardShareScreen:
 * back → preview → Instagram Story CTA → destination row → Continue.
 */
export function CardShareScreen({
  preview,
  url,
  question,
  title,
  onBack,
  onContinue,
}: {
  preview: ReactNode;
  url: string;
  question: string;
  title?: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  const shell: CSSProperties = {
    minHeight: '100dvh',
    background: ui.cream,
    fontFamily: ui.body,
    color: ui.ink,
    display: 'flex',
    justifyContent: 'center',
  };

  return (
    <div style={shell}>
      <style>{`@keyframes card-share-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100dvh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* App: EdgeInsets.fromLTRB(8, 6, 8, 0) + chevron 18 */}
        <div style={{ padding: '6px 8px 0', alignSelf: 'flex-start' }}>
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            style={{
              width: 40,
              height: 40,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: ui.ink,
              padding: 0,
            }}
          >
            {icons.chevronLeft}
          </button>
        </div>

        {title ? (
          <p
            style={{
              margin: '0 20px 4px',
              textAlign: 'center',
              fontFamily: ui.heading,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: -0.8,
              color: ui.ink,
            }}
          >
            {title}
          </p>
        ) : null}

        {/* App: Expanded + SingleChildScrollView padding h22 v12 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '12px 22px',
            boxSizing: 'border-box',
          }}
        >
          {preview}
        </div>

        {/* App: padding fromLTRB(18, 8, 18, 0) then 28 gap */}
        <div style={{ padding: '8px 18px 0' }}>
          <StoryButton
            onClick={() => {
              shareNative(url, question);
              onContinue();
            }}
          />
        </div>

        <div style={{ height: 28 }} />

        {/* App: padding fromLTRB(10, 0, 10, 20) */}
        <div style={{ padding: '0 10px 20px' }}>
          <ShareDestinationRow url={url} question={question} onShared={onContinue} />
        </div>

        <button
          type="button"
          onClick={onContinue}
          style={{
            background: 'none',
            border: 'none',
            color: ui.muted,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '0 8px 28px',
            fontFamily: ui.body,
            fontSize: 14,
            alignSelf: 'center',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default CardShareScreen;
