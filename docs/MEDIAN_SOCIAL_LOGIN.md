# Median native Google login — setup guide

Web-based Google OAuth does **not** work inside the Median wrapper (Google
blocks embedded WebViews, and the session lands outside the app). Median's
documented fix is the **Social Login native plugin**. This repo already
implements the website + backend half — you only need console setup.

## "Which redirectUri?" — you don't invent one

The redirect URI is our own backend endpoint, built automatically:

```
https://<your-api-domain>/api/v1/auth/google/native-callback
```

The in-app Google button calls
`median.socialLogin.google.login({ redirectUri })` with
`redirectUri = VITE_API_URL + /api/v1/auth/google/native-callback`.
Median runs the native Google SDK, then loads that URL in the WebView with
`?idToken=...`. The backend verifies the token, mints an Appwrite session
token, and redirects the WebView to the existing
`/auth/success?userId=...&secret=...` page — from there login completes
exactly like web Google login (same dashboard, same Mongo sync).

Requirements: `VITE_API_URL` must be your public API domain (not localhost)
and backend `CLIENT_URL` must be your public frontend domain.

## Step 1 — Google Cloud Console

1. APIs & Services → Credentials → **Create Credentials → OAuth client ID**.
2. Application type **Android**, Name anything (e.g. `EcoSankalan Android`).
3. Package name: `co.median.android.jbjljpo` (your app's package).
4. SHA-1 fingerprint: Median App Studio shows your release cert SHA-1; if
   Google Play signs the app, use Play Console → Setup → App Integrity.
5. Note the client ID (`...apps.googleusercontent.com`).

## Step 2 — Median App Studio

1. Native Plugins → install **Social Login**.
2. Social Login → Settings → enter the Google client IDs.
3. Rebuild the app (debug build is enough for testing).

## Step 3 — Backend env

```env
# Optional but recommended: native ID tokens carry the Android client as
# audience. Without it, verification still tries the web client ID only.
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

`GOOGLE_CLIENT_ID` (web) already exists. Restart the backend after editing.

## Step 4 — Test on a real device

1. Install the Median debug build, open it, tap Continue with Google.
2. Native Google account picker appears → pick an account.
3. You land on the dashboard with full session (points, history, profile).
4. Failure modes: `?error=` lands on `/auth/failure`; unverified email or
   bad token also lands there; backend logs the reason. Email login is
   unaffected and always available as fallback.

## How to tell which path ran

- Browser → Appwrite web OAuth (unchanged).
- Median app + plugin → `median.socialLogin.google.login` (new).
- Median app without plugin → clear "update the app / use email" message
  instead of a dead WebView failure.

See also: `src/controllers/nativeAuthController.js`,
`frontend/src/lib/median.js`, `tests/nativeAuth.test.js`.
