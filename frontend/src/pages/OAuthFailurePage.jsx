/**
 * OAuthFailurePage — handles OAuth failure callback
 * Route: /auth/failure
 *
 * If a session actually exists (false-negative redirect from the provider),
 * skip the error screen and go straight to the dashboard.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Account } from 'appwrite';
import appwriteClient from '../lib/appwrite';
import { FullscreenLoader } from '../components/common/Loader';

const account = new Account(appwriteClient);

export default function OAuthFailurePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    account.get()
      .then(() => {
        if (mounted) navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        if (mounted) setChecking(false);
      });
    return () => { mounted = false; };
  }, [navigate]);

  if (checking) {
    return <FullscreenLoader text={t('loader.auth')} />;
  }

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)' }}>
          error
        </span>
        <h3 style={{ margin: '1rem 0 0.5rem' }}>{t('auth.oauthFailedTitle')}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {t('auth.oauthCancelled')}
        </p>
        <button className="submit-btn" onClick={() => navigate('/auth')}>
          {t('auth.backToSignIn')} <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
    </div>
  );
}
