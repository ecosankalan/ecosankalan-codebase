/**
 * OAuthSuccessPage — handles OAuth callback after Google redirect
 * Route: /auth/success
 *
 * Robust flow (fixes the "Sign-in Failed → click → lands on dashboard" loop):
 *   1. If Appwrite already holds a session (cookie set during the OAuth
 *      callback), sync with the backend and go straight to /dashboard.
 *   2. Else, use userId + secret from the URL (query or hash) to create
 *      the session manually, then sync and go to /dashboard.
 *   3. Only if both fail, show the error state.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Account } from 'appwrite';
import appwriteClient from '../lib/appwrite';
import { syncUser } from '../services/api';
import { FullscreenLoader } from '../components/common/Loader';

const account = new Account(appwriteClient);

function readOAuthParams(searchParams) {
  const fromQuery = {
    userId: searchParams.get('userId'),
    secret: searchParams.get('secret'),
  };
  if (fromQuery.userId && fromQuery.secret) return fromQuery;
  // Some providers/setups append params to the hash fragment instead.
  try {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const userId = hash.get('userId');
    const secret = hash.get('secret');
    if (userId && secret) return { userId, secret };
  } catch { /* ignore */ }
  return { userId: null, secret: null };
}

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  // Nearest QueryClientProvider is the SDK's own (AppwriteProvider nests one
  // inside ours), so this invalidates the SDK's ["auth", "user"] cache.
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);

  const finishLogin = useCallback(async () => {
    // Create the MongoDB user before landing on /dashboard,
    // otherwise ProtectedRoute bounces back to /login.
    try {
      await syncUser();
    } catch (err) {
      console.warn('Failed to sync user with backend:', err?.message);
    }
    // Refresh the SDK's cached user (raw createSession bypasses the
    // React hooks, so without this the app still thinks we're logged out).
    try {
      await queryClient.refetchQueries({ queryKey: ['auth', 'user'] });
    } catch {
      // Non-fatal — AuthContext will pick the session up on next check.
    }
    navigate('/dashboard', { replace: true });
  }, [navigate, queryClient]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1. Session may already exist (Appwrite sets it during the callback).
      try {
        await account.get();
        if (mounted) await finishLogin();
        return;
      } catch {
        // No active session — fall through to manual creation.
      }

      // 2. Manual session creation from URL params.
      const { userId, secret } = readOAuthParams(searchParams);
      if (!userId || !secret) {
        if (mounted) {
          setError(t('auth.oauthMissing'));
          setBusy(false);
        }
        return;
      }
      try {
        await account.createSession({ userId, secret });
        if (mounted) await finishLogin();
      } catch (err) {
        // 3. Last chance: the session may have been created concurrently
        // (double redirect / StrictMode double-effect). Re-check before failing.
        try {
          await account.get();
          if (mounted) await finishLogin();
          return;
        } catch { /* truly no session */ }
        if (mounted) {
          setError(err?.message || t('auth.oauthFailed'));
          setBusy(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, [searchParams, finishLogin, t]);

  if (busy && !error) {
    return <FullscreenLoader text={t('loader.auth')} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)' }}>
          error
        </span>
        <h3 style={{ margin: '1rem 0 0.5rem' }}>{t('auth.oauthFailedTitle')}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <button className="submit-btn" onClick={() => navigate('/auth')}>
          {t('auth.backToSignIn')} <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
    </div>
  );
}
