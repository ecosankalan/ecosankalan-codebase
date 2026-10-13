/**
 * ResetPasswordPage — enter new password after clicking reset link
 * Flow: /forgot-password → email link → /reset-password?userId=...&secret=...
 *
 * Uses Appwrite account.updateRecovery() to set the new password.
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Client, Account } from 'appwrite';
import '../styles/login.css';
import '../styles/auth-extra.css';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  // Validate link on mount
  useEffect(() => {
    if (!userId || !secret) {
      setInvalidLink(true);
    }
  }, [userId, secret]);

  // Password strength checks
  const has8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !secret) {
      setError(t('auth.resetInvalidLink'));
      return;
    }
    if (!has8 || !hasUpper || !hasSymbol) {
      setError(t('auth.resetWeak'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.resetMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await account.updateRecovery(userId, secret, password);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Invalid link screen
  if (invalidLink) {
    return (
      <div className="auth-focused-root">
        <div className="blob blob-tl" />
        <div className="blob blob-br" />
        <main className="auth-focused-main">
          <div className="auth-icon-header">
            <div className="auth-icon-circle">
              <span className="material-symbols-outlined">error</span>
            </div>
            <div className="auth-text-center">
              <h1>{t('auth.invalidLinkTitle')}</h1>
              <p>{t('auth.invalidLinkSub')}</p>
            </div>
          </div>
          <button
            className="submit-btn"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/forgot-password')}
          >
            {t('auth.requestNewLink')} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </main>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="auth-focused-root">
        <div className="blob blob-tl" />
        <div className="blob blob-br" />
        <main className="auth-focused-main">
          <div className="auth-icon-header">
            <div className="auth-icon-circle">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div className="auth-text-center">
              <h1>{t('auth.resetDoneTitle')}</h1>
              <p>{t('auth.resetDoneSub')}</p>
            </div>
          </div>
          <button
            className="submit-btn"
            style={{ marginTop: '1.5rem' }}
            onClick={() => navigate('/login')}
          >
            {t('auth.goToSignIn')} <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-focused-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="auth-focused-main" style={{ paddingTop: '3.5rem' }}>
        {/* Icon header */}
        <div className="auth-icon-header">
          <div className="auth-icon-circle">
            <span className="material-symbols-outlined">lock_reset</span>
          </div>
          <div className="auth-text-center">
            <h1>{t('auth.resetTitle')}</h1>
            <p>{t('auth.resetSub')}</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="error-banner">{error}</div>}

            {/* New password */}
            <div className="field-group">
              <label htmlFor="rp-password">{t('auth.newPassword')}</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  id="rp-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={t('auth.togglePass')}
                >
                  <span className="material-symbols-outlined">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="reset-strength-hints">
                <StrengthHint met={has8} label={t('auth.hint8')} />
                <StrengthHint met={hasUpper} label={t('auth.hintUpper')} />
                <StrengthHint met={hasSymbol} label={t('auth.hintSymbol')} />
              </div>
            </div>

            {/* Confirm password */}
            <div className="field-group">
              <label htmlFor="rp-confirm">{t('auth.confirmPassword')}</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock_clock</span>
                <input
                  id="rp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowConfirm(p => !p)}
                  aria-label={t('auth.toggleConfirmPass')}
                >
                  <span className="material-symbols-outlined">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <span className="spinner" />
                : <>{t('auth.resetBtn')} <span className="material-symbols-outlined">arrow_forward</span></>
              }
            </button>
          </form>
        </div>

        {/* Back to login */}
        <button className="auth-footer-link" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">arrow_back</span>
          {t('auth.backToLogin')}
        </button>
      </main>
    </div>
  );
}

const StrengthHint = ({ met, label }) => (
  <span className={`strength-hint${met ? ' met' : ''}`}>
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: met ? "'FILL' 1" : "'wght' 200" }}
    >
      {met ? 'check_circle' : 'circle'}
    </span>
    {label}
  </span>
);
