/**
 * OTPForm — 6-digit OTP verification
 * Used by: OTPPage.jsx
 * NOTE: Backend OTP endpoints are stubs (501). This is mock flow for Month 1.
 */
import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP } from '../../services/api';

export default function OTPForm() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const email     = location.state?.email || 'your email';
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      // ── Uncomment when backend is live (Month 2) ────────────
      // await verifyOTP({ email, otp: code });
      // OTP verified — redirect to sign-in
      // navigate('/sign-in', { replace: true });

      // ── MOCK for Month 1 ─────────────────────────────────────
      await new Promise(r => setTimeout(r, 900));
      navigate('/sign-in', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-wrapper">
      <p className="otp-hint">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="otp-inputs">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? <span className="spinner" />
            : <> Verify OTP <span className="material-symbols-outlined">verified</span> </>
          }
        </button>

        <button
          type="button"
          className="resend-btn"
          onClick={() => setOtp(['', '', '', '', '', ''])}
        >
          Didn't receive code? Resend
        </button>
      </form>
    </div>
  );
}
