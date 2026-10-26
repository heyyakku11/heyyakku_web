// "Open in app": browsers cannot tell whether an app is installed, so we try to launch it and
// fall back to the store if nothing took over.

const ANDROID_PACKAGE = 'com.example.yakku';
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
    // Android launches the app if present, otherwise follows browser_fallback_url itself.
    const fallback = encodeURIComponent(androidStoreUrl);
    window.location.href = `intent://${path}#Intent;scheme=${SCHEME};package=${ANDROID_PACKAGE};S.browser_fallback_url=${fallback};end`;
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
