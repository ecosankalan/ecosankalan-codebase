/**
 * ResetPasswordPage — enter verification code + new password
 * Flow: /verify-phone → /reset-password → /login
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';
import '../styles/auth-extra.css';

export default function ResetPasswordPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = location.state?.token || '';

  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  // Password strength checks
  const has8    = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const handleOtpChange = (index, value, inputs) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs[index + 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit verification code.'); return; }
    if (!has8 || !hasUpper || !hasSymbol) { setError('Password does not meet the requirements.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      // ── Uncomment when backend is live (Month 2) ────────────
      // await resetPassword({ token, otp: code, password });
      await new Promise(r => setTimeout(r, 900)); // mock delay
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Separate refs array for OTP inputs
  const otpRefs = Array(6).fill(null).map(() => ({ current: null }));

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
            <h1>Reset Password</h1>
            <p>Enter the 6-digit code sent to your phone and choose a secure new password.</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {error && <div className="error-banner">{error}</div>}

            {/* Verification code */}
            <div className="field-group">
              <span className="auth-section-label">Verification Code</span>
              <div className="verify-otp-row">
                {otp.map((digit, i) => {
                  // Use a closure-based approach for refs
                  return (
                    <input
                      key={i}
                      className="verify-otp-box"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      placeholder="·"
                      onChange={e => {
                        if (!/^\d?$/.test(e.target.value)) return;
                        const next = [...otp];
                        next[i] = e.target.value;
                        setOtp(next);
                        setError('');
                        if (e.target.value && i < 5) {
                          e.target.nextElementSibling?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otp[i] && i > 0) {
                          e.target.previousElementSibling?.focus();
                        }
                      }}
                    />
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '0.5rem' }}>
                Haven't received it?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 'inherit', padding: 0 }}
                  onClick={() => navigate(-1)}
                >
                  Resend Code
                </button>
              </p>
            </div>

            {/* New password */}
            <div className="field-group">
              <label htmlFor="rp-password">New Password</label>
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
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="reset-strength-hints">
                <StrengthHint met={has8}     label="8+ characters" />
                <StrengthHint met={hasUpper} label="1 Uppercase" />
                <StrengthHint met={hasSymbol} label="1 Symbol" />
              </div>
            </div>

            {/* Confirm password */}
            <div className="field-group">
              <label htmlFor="rp-confirm">Confirm Password</label>
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
                  aria-label="Toggle confirm password visibility"
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
                : <>Reset Password <span className="material-symbols-outlined">arrow_forward</span></>
              }
            </button>

          </form>
        </div>

        {/* Back to login */}
        <button className="auth-footer-link" onClick={() => navigate('/login')}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Login
        </button>

      </main>
    </div>
  );
}
