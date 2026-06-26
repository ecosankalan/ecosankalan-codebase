/**
 * VerifyPhonePage — 6-digit OTP entry to verify phone number
 * Matches the provided OTP_Verification.png design exactly.
 * Flow: /forgot-password → /verify-phone → /reset-password
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/login.css';
import '../styles/auth-extra.css';

const RESEND_SECONDS = 60;

export default function VerifyPhonePage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const phone     = location.state?.phone || '';
  const flow      = location.state?.flow  || 'forgot';

  const [otp,     setOtp]     = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [timer,   setTimer]   = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setError('');
    inputs.current[0]?.focus();
    // await resendOTP({ phone }) — wire in Month 2
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      // ── Uncomment when backend is live (Month 2) ────────────
      // await verifyPhoneOTP({ phone, otp: code });
      await new Promise(r => setTimeout(r, 800)); // mock delay
      navigate('/reset-password', { state: { phone, token: 'mock-reset-token' } });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-focused-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      {/* No top bar on this page — matches the screenshot which has none */}

      <main
        className="auth-focused-main"
        style={{ justifyContent: 'flex-start', paddingTop: '3rem' }}
      >

        {/* Logo icon */}
        <div className="verify-logo-icon">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>

        {/* Heading */}
        <div className="auth-text-center">
          <h1>Verify OTP</h1>
          <p>Enter the 6-digit code sent to your phone</p>
        </div>

        {/* OTP card */}
        <div className="verify-phone-card">

          {error && <div className="error-banner">{error}</div>}

          {/* 6-digit input boxes */}
          <div className="verify-otp-row">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                className="verify-otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                placeholder="·"
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Timer + resend */}
          <div className="verify-resend-row">
            {!canResend && (
              <span className="verify-timer">
                <span className="material-symbols-outlined">schedule</span>
                Resend OTP in {timer}s
              </span>
            )}
            <button
              type="button"
              className="verify-resend-btn"
              onClick={handleResend}
              disabled={!canResend}
            >
              Resend OTP
            </button>
          </div>

          {/* Verify button */}
          <button
            className="submit-btn"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading
              ? <span className="spinner" />
              : <>Verify <span className="material-symbols-outlined">arrow_forward</span></>
            }
          </button>
        </div>

        {/* Tagline pill — from the screenshot */}
        <p className="verify-tagline">
          Securing your journey towards a sustainable future with EcoSankalan.
        </p>

        {/* Footer copyright — from the screenshot */}
        <p style={{ fontSize: '0.8rem', color: 'var(--outline)', textAlign: 'center' }}>
          © EcoSankalan 2026
        </p>

      </main>
    </div>
  );
}
