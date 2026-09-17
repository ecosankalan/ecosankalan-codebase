/**
 * OAuthPage — Google Sign-in using Appwrite OAuth2 Token Flow
 * Route: /auth
 *
 * Uses account.createOAuth2Token() which redirects to Google.
 * On success, Google redirects to /auth/success with userId + secret.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Account, OAuthProvider } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export default function OAuthPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // Auth guard: if already signed in, redirect to dashboard
  useEffect(() => {
    account.get()
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setChecking(false));
  }, [navigate]);

  const signInWithGoogle = async () => {
    const success = `${window.location.origin}/auth/success`;
    const failure = `${window.location.origin}/auth/failure`;

    await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success,
      failure,
    });
  };

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1.5rem' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Welcome to EcoSankalan</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Sign in to continue
          </p>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={signInWithGoogle}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            width: '100%', padding: '0.75rem 1.5rem',
            border: '1px solid #ddd', borderRadius: '8px',
            background: '#fff', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 500,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z" fill="#C4C6D7"/>
          </svg>
          Sign in with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Or sign in with email instead
          </a>
        </div>
      </div>
    </div>
  );
}
