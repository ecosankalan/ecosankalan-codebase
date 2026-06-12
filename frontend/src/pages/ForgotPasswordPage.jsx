/**
 * ForgotPasswordPage — user enters phone number to receive OTP
 * Flow: /login → /forgot-password → /verify-phone → /reset-password
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import '../styles/auth-extra.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      // ── Uncomment when backend is live (Month 2) ────────────
      // await sendForgotOTP({ phone: `+91${digits}` });
      await new Promise(r => setTimeout(r, 800)); // mock delay
      navigate('/verify-phone', { state: { phone: digits, flow: 'forgot' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-focused-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      {/* Top bar */}
      <header className="auth-top-bar">
        <button className="auth-back-btn" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Login
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
            alt="Security concept"
          />
        </div>

        {/* Heading */}
        <div className="auth-text-center">
          <h1>Forgot Password</h1>
          <p>Enter your phone number and we'll send you an OTP to reset your account access.</p>
        </div>

        {/* Form */}
        <form
          className="auth-form"
          style={{ width: '100%' }}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="field-group">
            <label htmlFor="fp-phone">Phone Number</label>
            <div className="phone-input-wrap">
              <div className="phone-prefix">
                <span className="material-symbols-outlined">phone</span>
                <span className="phone-prefix-code">+91</span>
              </div>
              <input
                id="fp-phone"
                className="phone-input"
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError(''); }}
                autoComplete="tel"
                required
              />
            </div>
            {error && <div className="error-banner" style={{ marginTop: '0.5rem' }}>{error}</div>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? <span className="spinner" />
              : <>Send OTP <span className="material-symbols-outlined">arrow_forward</span></>
            }
          </button>
        </form>

        {/* Support */}
        <p className="auth-support-text">
          Having trouble?
          <a href="#">Contact Support</a>
        </p>

      </main>
    </div>
  );
}
