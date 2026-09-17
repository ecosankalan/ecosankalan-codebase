/**
 * RegisterForm — handles new user registration via Appwrite
 * Used by: RegisterPage.jsx
 * Auth: Appwrite useSignUp() + useSignIn() hooks from @appwrite.io/react
 *
 * Flow:
 *   1. Create account + session via useSignUp().emailPassword()
 *   2. Send verification email via account.createVerification()
 *   3. Show "Check your email" screen
 *   4. User clicks link → /verify-email → auto-verifies → redirects to /dashboard
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUp, useSignIn } from '@appwrite.io/react';
import { OAuthProvider, Account } from 'appwrite';
import appwriteClient from '../../lib/appwrite';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { emailPassword: signUpEmailPassword, isPending: signUpPending } = useSignUp();
  const { oAuth, isPending: signInPending } = useSignIn();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [verifySent, setVerifySent] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleAuthSuccess = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleGoogleSignup = () => {
    setLoading(true);
    setError('');
    oAuth({
      provider: OAuthProvider.Google,
      scopes: [],
      onSuccess: handleAuthSuccess,
      onError: (err) => {
        setError(err.message || 'Google signup failed. Please try again.');
        setLoading(false);
      },
    });
  };

  const getFriendlyError = (err) => {
    const msg = (err?.message || '').toLowerCase();
    if (msg.includes('already') && msg.includes('user'))
      return 'An account with this email already exists. Please sign in.';
    if (msg.includes('password') && msg.includes('too'))
      return 'Password must be at least 8 characters.';
    if (msg.includes('email') && msg.includes('invalid'))
      return 'Please enter a valid email address.';
    return err?.message || 'Registration failed. Please try again.';
  };

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      // Delete any existing session first to avoid conflicts
      try {
        const account = new Account(appwriteClient);
        await account.deleteSession('current');
      } catch {
        // No existing session — expected on first signup
      }

      signUpEmailPassword({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        onSuccess: async () => {
          // Send verification email
          try {
            const account = new Account(appwriteClient);
            const redirectUrl = `${window.location.origin}/verify-email`;
            await account.createVerification(redirectUrl);
          } catch (err) {
            console.warn('Failed to send verification email:', err?.message);
          }

          // Delete session so user stays on "Check your email" screen
          // (don't want AuthContext to redirect to /dashboard)
          try {
            const account = new Account(appwriteClient);
            await account.deleteSession('current');
          } catch {
            // Ignore
          }

          // Show "Check your email" screen
          setVerifyEmail(formData.email);
          setVerifySent(true);
          setLoading(false);
        },
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

  // Show "Check your email" screen after signup
  if (verifySent) {
    return (
      <div className="auth-form-wrapper">
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)' }}>
            mark_email_read
          </span>
          <h3 style={{ margin: '1rem 0 0.5rem' }}>Check your email</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We sent a verification link to <strong>{verifyEmail}</strong>.
            <br />Click the link to verify your account.
            <br />If you don't see the email, check your spam folder.
          </p>
          <button
            className="submit-btn"
            onClick={() => navigate('/login')}
          >
            Go to Sign In <span className="material-symbols-outlined">arrow_forward</span>
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
          disabled={loading || signUpPending || signInPending}
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
          <label htmlFor="reg-name">Full Name</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">person</span>
            <input
              id="reg-name" name="name" type="text"
              placeholder="Vipin Gupta"
              value={formData.name} onChange={handleChange}
              autoComplete="name"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-email">Email Address</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">mail</span>
            <input
              id="reg-email" name="email" type="email"
              placeholder="name@impact.com"
              value={formData.email} onChange={handleChange}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-phone">Phone Number (optional)</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">phone</span>
            <input
              id="reg-phone" name="phone" type="tel"
              placeholder="9876543210"
              value={formData.phone} onChange={handleChange}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-password">Password</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              id="reg-password" name="password" type="password"
              placeholder="Min. 8 characters"
              value={formData.password} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="reg-confirm">Confirm Password</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock_reset</span>
            <input
              id="reg-confirm" name="confirmPassword" type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword} onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading || signUpPending}>
          {loading || signUpPending
            ? <span className="spinner" />
            : <> Create Account <span className="material-symbols-outlined">arrow_forward</span> </>
          }
        </button>
      </form>
    </div>
  );
}
