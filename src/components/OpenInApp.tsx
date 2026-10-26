import { mobilePlatform, openInApp } from '../lib/openApp.ts';

// Shown on phones only; desktop visitors just vote on the web.
export function OpenInApp({ shareCode }: { shareCode: string }) {
  if (!shareCode || mobilePlatform() === null) return null;
  return (
    <button
      type="button"
      onClick={() => openInApp(shareCode)}
      style={{
        width: '100%',
        height: 48,
        marginBottom: 14,
        borderRadius: 12,
        border: '1.5px solid #D02E62',
        background: 'rgba(208, 46, 98, 0.08)',
        color: '#D02E62',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      Open in Yakku app
    </button>
  );
}
