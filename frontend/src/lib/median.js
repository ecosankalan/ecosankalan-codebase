/**
 * lib/median.js
 * Median (native wrapper) detection + Social Login bridge helpers.
 *
 * Inside the Median Android/iOS app, web-based Google OAuth must NOT be
 * used (Google blocks embedded WebViews and the session lands outside
 * the app). Median's documented fix is the Social Login native plugin:
 * the site calls median.socialLogin.google.login() and Median loads our
 * backend redirectUri in the WebView with the native ID token.
 * See docs/MEDIAN_SOCIAL_LOGIN.md.
 */

/** True when the site runs inside the Median native wrapper. */
export const isMedianApp = () =>
  typeof navigator !== 'undefined' &&
  /median/i.test(navigator.userAgent || '');

/** True when the Median Social Login bridge is available. */
export const hasMedianGoogleBridge = () =>
  isMedianApp() &&
  typeof window !== 'undefined' &&
  !!window.median?.socialLogin?.google?.login;

/**
 * Start the native Google flow. Resolves immediately after handing off;
 * Median navigates the WebView to redirectUri on completion.
 */
export const medianGoogleLogin = (redirectUri) => {
  const state = `ecosankalan-${Date.now()}`;
  window.median.socialLogin.google.login({ redirectUri, state });
};

/** Backend endpoint Median redirects to with ?idToken=... */
export const nativeCallbackUrl = () => {
  const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
  return `${String(apiBase).replace(/\/$/, '')}/api/v1/auth/google/native-callback`;
};
