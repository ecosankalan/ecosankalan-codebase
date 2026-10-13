/**
 * ForgotPasswordPage — enter email to receive password reset link
 * Flow: /login → /forgot-password → email link → /reset-password
 *
 * Uses Appwrite account.createRecovery() which sends a reset link.
 * For security, shows the same message whether email exists or not.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Client, Account } from 'appwrite';
import '../styles/login.css';
import '../styles/auth-extra.css';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t('auth.invalidEmail'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      await account.createRecovery(email, redirectUrl);
    } catch {
      // Silently ignore — don't reveal whether email exists
    }
    // Always show same message for security
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="auth-focused-root">
        <div className="blob blob-tl" />
        <div className="blob blob-br" />
        <main className="auth-focused-main">
          <div className="auth-icon-header">
            <div className="auth-icon-circle">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <div className="auth-text-center">
              <h1>{t('auth.checkEmail')}</h1>
              <p>
                {t('auth.resetSentA')} <strong>{email}</strong>{t('auth.resetSentB')}
              </p>
            </div>
          </div>
          <button
            className="submit-btn"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/login')}
          >
            {t('auth.backToLogin')} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <p className="auth-support-text" style={{ marginTop: '1.5rem' }}>
            {t('auth.didntReceive')}{' '}
            <button
              type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 'inherit', padding: 0 }}
              onClick={() => { setSent(false); setEmail(''); }}
            >
              {t('auth.tryAnother')}
            </button>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-focused-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      {/* Top bar */}
      <header className="auth-top-bar">
        <button className="auth-back-btn" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">arrow_back</span>
          {t('auth.backToLogin')}
        </button>
        <div className="auth-top-brand">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          EcoSankalan
        </div>
        <div className="auth-top-spacer" />
      </header>

      <main className="auth-focused-main">
        {/* Illustration */}
        <div className="auth-illustration">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDioo39r7ih6H0lkeRrA8sKzrJr3ueQ2EEJ8B_0vLEs4Stq6efW4CLwwUbJNPBcC8F8LQ5py-diRqpSCdvNuwEYUW720AgSolRYmpvo3AMDF6yfzpSi4B9Nw9p8SzXgSkvmfMPDnhuOzC7TRIP3a99MzpSiiMgJlrNz1VEh1cigDmbS-bOEgAugfCuKONiZmBU7TJ64hM2TTRslHBaPD3VyxWEy0L5s-e-sWy1ZrToqPlE0a9-_hBVOZkg_1FqoGEy7NQxiVIw9AhU"
            alt={t('auth.securityAlt')}
          />
        </div>

        {/* Heading */}
        <div className="auth-text-center">
          <h1>{t('auth.forgotTitle')}</h1>
          <p>{t('auth.forgotSub')}</p>
        </div>

        {/* Form */}
        <form
          className="auth-form"
          style={{ width: '100%' }}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="field-group">
            <label htmlFor="fp-email">{t('auth.emailLabel')}</label>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">mail</span>
              <input
                id="fp-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                autoComplete="email"
                required
              />
            </div>
            {error && <div className="error-banner" style={{ marginTop: '0.5rem' }}>{error}</div>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : <>{t('auth.sendReset')} <span className="material-symbols-outlined">arrow_forward</span></>
            }
          </button>
        </form>

        {/* Support */}
        <p className="auth-support-text">
          {t('auth.rememberPass')}{' '}
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 'inherit', padding: 0 }}
            onClick={() => navigate('/login')}
          >
            {t('auth.signIn')}
          </button>
        </p>
      </main>
    </div>
  );
}
