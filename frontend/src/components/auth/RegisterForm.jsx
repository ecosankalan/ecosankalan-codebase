/**
 * RegisterForm — handles new user registration
 * Used by: RegisterPage.jsx
 * API: registerUser() → verifyOTP() from services/api.js (Month 2)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/api';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      // ── Uncomment when backend is live (Month 2) ────────────
      // await registerUser({ name: formData.name, email: formData.email, password: formData.password });
      // navigate('/otp', { state: { email: formData.email } });

      // ── MOCK for Month 1 ─────────────────────────────────────
      await new Promise(r => setTimeout(r, 900));
      navigate('/otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
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
          <label htmlFor="reg-password">Password</label>
          <div className="input-wrap">
            <span className="material-symbols-outlined input-icon">lock</span>
            <input
              id="reg-password" name="password" type="password"
              placeholder="Min. 6 characters"
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? <span className="spinner" />
            : <> Create Account <span className="material-symbols-outlined">arrow_forward</span> </>
          }
        </button>
      </form>
    </div>
  );
}
