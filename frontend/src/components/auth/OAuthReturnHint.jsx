/**
 * OAuthReturnHint — self-diagnosis for Google sign-in redirects that
 * come back without completing.
 *
 * Google buttons call markOAuthPending() before redirecting to Appwrite.
 * When this component mounts with that flag set, it watches auth state:
 *   - No Appwrite session after grace period  → session didn't persist.
 *     Almost always third-party cookies blocked (Incognito/private mode).
 *   - Appwrite session exists but no MongoDB user → backend /sync failing.
 */
import { useEffect, useState } from 'react';
import { useAuth as useAppwriteAuth } from '@appwrite.io/react';
import { useAuth as useAppAuth } from '../../context/AuthContext';

const FLAG = 'oauth_pending';
const FLAG_TTL_MS = 5 * 60 * 1000;
const GRACE_MS = 6000;

export const markOAuthPending = () => {
  try {
    sessionStorage.setItem(FLAG, String(Date.now()));
  } catch {
    // storage unavailable — hint simply won't show
  }
};

const clearFlag = () => {
  try {
    sessionStorage.removeItem(FLAG);
  } catch {
    // ignore
  }
};

export default function OAuthReturnHint() {
  const { user: appwriteUser, isLoading: appwriteLoading } = useAppwriteAuth();
  const { user: mongoUser, isLoading: authLoading } = useAppAuth();
  const [hint, setHint] = useState(null); // null | 'session' | 'backend'

  useEffect(() => {
    let ts = null;
    try {
      ts = Number(sessionStorage.getItem(FLAG));
    } catch {
      return;
    }
    if (!ts || Date.now() - ts > FLAG_TTL_MS) return;
    if (appwriteLoading || authLoading) return;

    if (!appwriteUser) {
      const t = setTimeout(() => setHint('session'), GRACE_MS);
      return () => clearTimeout(t);
    }
    if (!mongoUser) {
      const t = setTimeout(() => setHint('backend'), GRACE_MS);
      return () => clearTimeout(t);
    }
    clearFlag();
    setHint(null);
  }, [appwriteUser, appwriteLoading, mongoUser, authLoading]);

  if (!hint) return null;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="error-banner">
      {hint === 'session' ? (
        <>
          Google sign-in didn&apos;t complete in this browser. Allow third-party
          cookies for this site (Incognito/private windows block them by default),
          then try again.
        </>
      ) : (
        <>
          Connected to Google, but the app backend isn&apos;t responding
          ({apiUrl}). Start it and refresh, or check the console for the sync error.
        </>
      )}
      <div style={{ marginTop: '0.5rem' }}>
        <button
          type="button"
          className="resend-btn"
          onClick={() => { clearFlag(); setHint(null); }}
        >
          Dismiss — I&apos;ll try again
        </button>
      </div>
    </div>
  );
}
