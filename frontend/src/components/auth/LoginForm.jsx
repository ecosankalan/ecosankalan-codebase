/**
 * LoginForm — handles email/password login
 * Used by: LoginPage.jsx
 * API: loginUser() from services/api.js (mock in Month 1, real in Month 2)
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

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
      // ── Uncomment when backend is live (Month 2) ────────────
      // const res = await loginUser(formData);
      // login(res.data.user, res.data.token);

      // ── MOCK login for Month 1 ───────────────────────────────
      await new Promise(r => setTimeout(r, 900));
      login(
        { name: 'Vipin Gupta', email: formData.email, ecoPoints: 480 },
        'mock-jwt-token-ecosankalan'
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      {/* Google button (static — Month 1) */}
      <button className="google-btn" type="button">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk-nUL4i1EqWirCrPMTXH9VUN763RHLOjJ9N6xbtVHGW5P5PfrBs1NgJXD2Pvma-OrOHUvfMgRjIxRS0UINM_R-UgVjXqRlXoRyrwK2VD_LvJsMyElp8iEqL27f2CupD46hV8yWXwF6m0AHJS-9yTtsGsV1DHO1i7Kifdw7uKZ7McpHdPoQeFjt0Cg05vW3kdh70cz5PEOuyXk7MLqqNiGwxWkwlHYF3IoPgoiOuXPpW1YQvmBEE3_s7KZ1QcepSG2ueL6xs082IK6"
          alt="Google" width={20} height={20}
        />
        Continue with Google
      </button>

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
