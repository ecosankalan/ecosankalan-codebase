/**
 * LoginForm — handles email/password login via Appwrite
 * Used by: LoginPage.jsx
 * Auth: Appwrite useSignIn() hook from @appwrite.io/react
 */
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignIn } from '@appwrite.io/react';
import { OAuthProvider, Account } from 'appwrite';
import appwriteClient from '../../lib/appwrite';

export default function LoginForm() {
  const navigate = useNavigate();
  const { emailPassword, oAuth, isPending } = useSignIn();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleAuthSuccess = useCallback(() => {
    // AuthContext.useEffect watches appwriteUser and syncs with backend.
    // After that, ProtectedRoute redirects to /dashboard.
    navigate('/dashboard');
  }, [navigate]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    oAuth({
      provider: OAuthProvider.Google,
      scopes: [],
      onSuccess: handleAuthSuccess,
      onError: (err) => {
        setError(err.message || 'Google login failed. Please try again.');
        setLoading(false);
      },
    });
  };

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getFriendlyError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('invalid credentials') || msg.includes('password'))
      return 'Incorrect email or password. Please try again.';
    if (msg.includes('user not found') || msg.includes('no user'))
      return 'No account found with this email. Please sign up first.';
    if (msg.includes('email') && msg.includes('already'))
      return 'An account with this email already exists. Please sign in.';
    if (msg.includes('verification') || msg.includes('unauthorized'))
      return 'Please verify your email before signing in.';
    return err?.message || 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // Delete any existing session first to avoid "session already active" error
      try {
        const account = new Account(appwriteClient);
        await account.deleteSession('current');
      } catch {
        // No existing session — this is expected on first login
      }

      emailPassword({
        email: formData.email,
        password: formData.password,
        onSuccess: handleAuthSuccess,
        onError: (err) => {
          setError(getFriendlyError(err));
          setLoading(false);
        },
      });
    } catch (err) {
      setError(getFriendlyError(err));
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading || isPending}
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
          Continue with Google
        </button>
      </div>

      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">Or with email</span>
        <div className="divider-line" />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input
              id="email" name="email" type="email"
              placeholder="name@impact.com"
              value={formData.email} onChange={handleChange}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field-group">
          <div className="label-row">
            <label htmlFor="password">Password</label>
            <a href="#" className="forgot-link" onClick={e => { e.preventDefault(); navigate('/forgot-password'); }}>Forgot?</a>
          </div>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              id="password" name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
              autoComplete="current-password"
            />
            <button
              type="button" className="toggle-pass"
              onClick={() => setShowPass(p => !p)}
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined">
                {showPass ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="remember-row">
          <input
            id="remember" type="checkbox"
            checked={remember} onChange={e => setRemember(e.target.checked)}
          />
          <label htmlFor="remember">Remember for 30 days</label>
        </div>

        <button type="submit" className="submit-btn" disabled={loading || isPending}>
          {loading || isPending
            ? <span className="spinner" />
            : <> Sign In <span className="material-symbols-outlined">arrow_forward</span> </>
          }
        </button>
      </form>
    </div>
  );
}
