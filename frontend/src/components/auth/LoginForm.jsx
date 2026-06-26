/**
 * LoginForm — handles email/password login
 * Used by: LoginPage.jsx
 * API: loginUser() from services/api.js (mock in Month 1, real in Month 2)
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { loginUser, authGoogle } from '../../services/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await authGoogle({ token: tokenResponse.credential });
      if (res.data && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // ── Call real backend API ────────────────────────────────
      const res = await loginUser(formData);
      
      // Using Context login method (which sets localStorage and state)
      if (res.data && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          useOneTap
        />
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? <span className="spinner" />
            : <> Sign In <span className="material-symbols-outlined">arrow_forward</span> </>
          }
        </button>
      </form>
    </div>
  );
}
