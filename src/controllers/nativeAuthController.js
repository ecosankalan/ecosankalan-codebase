/**
 * controllers/nativeAuthController.js
 * Median Social Login (native Google SDK) callback.
 *
 * Why this exists: inside the Median-wrapped Android/iOS app, web-based
 * Google OAuth runs in a WebView, which Google blocks and which strands
 * the session outside the app. Median's docs require native SDK login
 * there instead. Flow:
 *
 *   1. In-app Google button calls
 *      median.socialLogin.google.login({ redirectUri, state })
 *      with redirectUri = <API>/api/v1/auth/google/native-callback
 *   2. Median runs the native Google SDK, then loads redirectUri in the
 *      WebView with ?idToken=...&type=google&state=... (or ?error=...)
 *   3. Here we verify the Google ID token, find-or-create the Appwrite
 *      user via the Admin SDK, mint a session token, and redirect the
 *      WebView to the frontend /auth/success page — which already knows
 *      how to turn userId+secret into a session (see OAuthSuccessPage).
 *   4. Normal /auth/sync then creates/links the MongoDB profile, so
 *      points, history, and profile work identically to web login.
 */

const { OAuth2Client } = require('google-auth-library');
const { getClient, sdk } = require('../config/appwrite');

const googleClient = new OAuth2Client();

const failureRedirect = (req, res) => {
  const base = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  return res.redirect(302, base ? `${base}/auth/failure` : '/auth/failure');
};

const googleNativeCallback = async (req, res) => {
  const base = (process.env.CLIENT_URL || '').replace(/\/$/, '');
  const { idToken, error } = req.query;

  if (error || !idToken) {
    console.warn('Native Google login cancelled/failed:', error || 'missing idToken');
    return failureRedirect(req, res);
  }

  try {
    // Audiences: web client ID + optional Android client ID (native SDK
    // tokens carry the Android client as audience).
    const audiences = [process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean);
    const ticket = await googleClient.verifyIdToken({
      idToken,
      ...(audiences.length ? { audience: audiences } : {}),
    });
    const payload = ticket.getPayload() || {};
    const email = String(payload.email || '').toLowerCase().trim();
    const name = payload.name || email.split('@')[0] || 'Eco Warrior';

    if (!email || payload.email_verified === false) {
      console.warn('Native Google login: email missing or unverified');
      return failureRedirect(req, res);
    }

    const adminClient = getClient();
    const users = new sdk.Users(adminClient);

    // Find-or-create the Appwrite user by email.
    let appwriteUserId = null;
    try {
      const existing = await users.list([sdk.Query.equal('email', [email])]);
      if (existing && existing.total > 0 && existing.users[0]) {
        appwriteUserId = existing.users[0].$id;
      }
    } catch (listErr) {
      console.error('Native Google login: Appwrite user lookup failed:', listErr?.message);
      return failureRedirect(req, res);
    }

    if (!appwriteUserId) {
      try {
        const created = await users.create(sdk.ID.unique(), email, undefined, undefined, name);
        appwriteUserId = created.$id;
      } catch (createErr) {
        console.error('Native Google login: Appwrite user creation failed:', createErr?.message);
        return failureRedirect(req, res);
      }
    }

    // Mint a session token and hand the WebView to the existing
    // frontend success page (userId+secret -> createSession -> /dashboard).
    const token = await users.createToken(appwriteUserId);
    const target = base
      ? `${base}/auth/success?userId=${encodeURIComponent(token.userId)}&secret=${encodeURIComponent(token.secret)}`
      : `/auth/success?userId=${encodeURIComponent(token.userId)}&secret=${encodeURIComponent(token.secret)}`;
    return res.redirect(302, target);
  } catch (err) {
    console.error('Native Google login failed:', err?.message);
    return failureRedirect(req, res);
  }
};

module.exports = { googleNativeCallback };
