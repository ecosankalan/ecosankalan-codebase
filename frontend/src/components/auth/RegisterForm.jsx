/**
 * RegisterForm — handles new user registration via Appwrite
 * Used by: RegisterPage.jsx
 * Auth: raw Appwrite SDK for email signup (account-only, no session)
 *       + OAuth2 token flow for Google (createOAuth2Token → /auth/success)
 *
 * Strict verify-before-use flow:
 *   1. Create account via account.create() — no session is created
 *   2. Dispatch the verification email via a short-lived ephemeral session
 *      (createVerification requires auth; the raw SDK calls below never touch
 *      the React Query auth cache, so AuthContext sees no ghost login)
 *   3. Show "Check your email" screen
 *   4. User clicks link → /verify-email → updateVerification → /login
 *   5. MongoDB profile is created on first login sync (nothing reads it before)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OAuthProvider, Account, ID } from 'appwrite';
import appwriteClient from '../../lib/appwrite';
import OAuthReturnHint, { markOAuthPending } from './OAuthReturnHint';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [verifySent, setVerifySent] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    markOAuthPending();
    try {
      // Token flow: navigates the browser to Google; do not redirect manually.
      // Google → Appwrite → /auth/success (createSession) → /dashboard.
      const account = new Account(appwriteClient);
      await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: `${window.location.origin}/auth/success`,
        failure: `${window.location.origin}/auth/failure`,
      });
    } catch (err) {
      setError(err.message || t('auth.googleSignupFailed'));
      setLoading(false);
    }
  };

  const getFriendlyError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('already') && msg.includes('user'))
      return t('auth.errExists');
    if (msg.includes('password') && msg.includes('too'))
      return t('auth.errPassShort');
    if (msg.includes('email') && msg.includes('invalid'))
      return t('auth.invalidEmail');
    return err?.message || t('auth.registerFailed');
  };

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError(t('auth.fillAll'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.resetMismatch'));
      return;
    }
    if (formData.password.length < 8) {
      setError(t('auth.errPassShort'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const account = new Account(appwriteClient);

      // 1. Register the account only — creates NO session.
      await account.create({
        userId: ID.unique(),
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      // 2. Dispatch the verification email via a short-lived ephemeral session.
      // createVerification requires auth, so we log in, send, and log back out
      // using the raw SDK (bypasses the React Query auth cache, so AuthContext
      // never observes this transient session and no redirect can fire).
      try {
        await account.createEmailPasswordSession({
          email: formData.email,
          password: formData.password,
        });
        const redirectUrl = `${window.location.origin}/verify-email`;
        await account.createVerification(redirectUrl);
      } catch (err) {
        console.warn('Failed to send verification email:', err?.message);
      } finally {
        try {
          await account.deleteSession('current');
        } catch {
          // Ignore — already logged out or session never established
        }
      }

      // 3. Show "Check your email" screen (MongoDB profile is created
      // on first login sync — nothing reads it before then).
      setVerifyEmail(formData.email);
      setVerifySent(true);
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // Show "Check your email" screen after signup
  if (verifySent) {
    return (
      <div className="auth-form-wrapper">
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)' }}>
            mark_email_read
          </span>
          <h3 style={{ margin: '1rem 0 0.5rem' }}>{t('auth.checkEmail')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {t('auth.verifyLinkSentA')} <strong>{verifyEmail}</strong>.
            <br />{t('auth.verifyLinkSentB')}
            <br />{t('auth.verifyLinkSentC')}
          </p>
          <button
            className="submit-btn"
            onClick={() => navigate('/login')}
          >
            {t('auth.goToSignIn')} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignup}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', border: '1px solid #ddd', borderRadius: '8px',
            background: '#fff', cursor: loading ? 'wait' : 'pointer',
            fontSize: '0.95rem', fontWeight: 500,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('auth.googleSignIn')}
        </button>
      </div>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">{t('auth.orEmail')}</span>
        <div className="divider-line" />
      </div>

      {error && <div className="error-banner">{error}</div>}
      <OAuthReturnHint />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="reg-name">{t('auth.fullName')}</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">person</span>
            <input
              id="reg-name" name="name" type="text"
              placeholder={t('auth.namePh')}
              value={formData.name} onChange={handleChange}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-email">{t('auth.emailLabel')}</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input
              id="reg-email" name="email" type="email"
              placeholder={t('auth.emailPh')}
              value={formData.email} onChange={handleChange}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-phone">{t('auth.phoneOptional')}</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">phone</span>
            <input
              id="reg-phone" name="phone" type="tel"
              placeholder={t('auth.phonePh')}
              value={formData.phone} onChange={handleChange}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-password">{t('auth.passwordLabel')}</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              id="reg-password" name="password" type="password"
              placeholder={t('auth.passPh')}
              value={formData.password} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-confirm">{t('auth.confirmPassword')}</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock_reset</span>
            <input
              id="reg-confirm" name="confirmPassword" type="password"
              placeholder={t('auth.confirmPh')}
              value={formData.confirmPassword} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? <span className="spinner" />
            : <> {t('auth.createAccountBtn')} <span className="material-symbols-outlined">arrow_forward</span> </>
          }
        </button>
      </form>
    </div>
  );
}
