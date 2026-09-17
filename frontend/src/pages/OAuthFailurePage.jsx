/**
 * OAuthFailurePage — handles OAuth failure callback
 * Route: /auth/failure
 *
 * Shows an error message and a way back to sign-in.
 */
import { useNavigate } from 'react-router-dom';

export default function OAuthFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--error)' }}>
          error
        </span>
        <h3 style={{ margin: '1rem 0 0.5rem' }}>Sign-in Failed</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Google sign-in was cancelled or failed. Please try again.
        </p>
        <button className="submit-btn" onClick={() => navigate('/auth')}>
          Back to Sign In <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>
    </div>
  );
}
