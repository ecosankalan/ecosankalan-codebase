/**
 * OAuthSuccessPage — handles OAuth callback after Google redirect
 * Route: /auth/success?userId=...&secret=...
 *
 * Reads userId + secret from query string, creates an Appwrite session,
 * then redirects to /dashboard.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const secret = searchParams.get('secret');
    const userId = searchParams.get('userId');

    if (!secret || !userId) {
      setError('Missing OAuth credentials. Please try signing in again.');
      return;
    }

    let mounted = true;

    account.createSession({ userId, secret })
      .then(() => {
        if (mounted) navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        if (mounted) setError(err?.message || 'Failed to create session. Please try again.');
      });

    return () => { mounted = false; };
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)' }}>
            error
          </span>
          <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign-in Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="submit-btn" onClick={() => navigate('/auth')}>
            Back to Sign In <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <span className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1.5rem' }} />
        <h3>Signing you in...</h3>
      </div>
    </div>
  );
}
