// "Open in app": browsers cannot tell whether an app is installed, so we try to launch it and
// fall back to the store if nothing took over.

import { appConfig } from 'virtual:app-config';

// Package name comes from config/appsettings.{environment}.json (see config/appConfigPlugin.ts).
const ANDROID_PACKAGE = appConfig.android.packageName;
const SCHEME = 'yakku';

export const androidStoreUrl =
  import.meta.env.VITE_ANDROID_STORE_URL || `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const iosStoreUrl = import.meta.env.VITE_IOS_STORE_URL || 'https://apps.apple.com/app/yakku';

export type MobilePlatform = 'android' | 'ios' | null;

export function mobilePlatform(): MobilePlatform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  return null;
}

export function openInApp(shareCode: string): void {
  const platform = mobilePlatform();
  const path = `/vote/${encodeURIComponent(shareCode)}`;

  if (platform === 'android') {
    // HTTPS App Links: the intent carries the real website host and scheme=https, so Android
    // resolves it to the verified app link. If the app is missing (or the in-app browser, e.g.
    // Instagram, blocks the launch) the browser stays on / returns to this same web page, which
    // remains fully usable. Must be called from a user click, never on page load.
    const fallbackUrl = `${window.location.origin}${path}`;
    window.location.href =
      `intent://${window.location.host}${path}` +
      `#Intent;scheme=https;package=${ANDROID_PACKAGE};` +
      `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
    return;
  }

  if (platform === 'ios') {
    // iOS gives no signal when the scheme is unhandled: if the page is still visible after a
    // moment, the app did not open, so go to the App Store.
    let left = false;
    const markLeft = () => {
      if (document.visibilityState === 'hidden') left = true;
    };
    document.addEventListener('visibilitychange', markLeft);
    window.addEventListener('pagehide', () => (left = true), { once: true });
    window.location.href = `${SCHEME}://${path}`;
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', markLeft);
      if (!left && document.visibilityState === 'visible') window.location.href = iosStoreUrl;
    }, 1800);
  }
}
