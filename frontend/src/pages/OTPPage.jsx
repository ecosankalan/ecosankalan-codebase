import OTPForm from '../components/auth/OTPForm';
import '../styles/login.css';
import '../styles/otp.css';

export default function OTPPage() {
  return (
    <div className="login-root">
      <div className="blob blob-tl" />
      <div className="blob blob-br" />

      <main className="otp-card">
        {/* Logo */}
        <div className="otp-logo">
          <div className="otp-logo-icon">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", color: 'var(--on-primary)' }}
            >
              eco
            </span>
          </div>
          <span className="otp-brand-name">EcoSankalan</span>
        </div>

        {/* Icon */}
        <div className="otp-icon-wrap">
          <span
            className="material-symbols-outlined otp-main-icon"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>

        {/* Heading */}
        <div className="form-heading" style={{ textAlign: 'center' }}>
          <h3>Check your email</h3>
          <p>Enter the 6-digit code we sent to verify your account.</p>
        </div>

        <OTPForm />
      </main>
    </div>
  );
}
