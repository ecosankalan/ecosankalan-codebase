/**
 * OAuthDashboardPage — signed-in dashboard with Appwrite auth guard
 * Route: /oauth-dashboard
 *
 * Auth guard: checks account.get() before rendering.
 * If not authenticated, redirects to /auth.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

export default function OAuthDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch(() => {
        navigate('/auth', { replace: true });
      });
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await account.deleteSession({ sessionId: 'current' });
    } catch {
      // Ignore errors
    }
    navigate('/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <span className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1.5rem' }} />
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)' }}>
          person
        </span>
        <h2 style={{ margin: '1rem 0 0.5rem' }}>
          Welcome, {user?.name || user?.email || 'User'}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          {user?.email}
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          You are signed in with Google via Appwrite OAuth2.
        </p>
        <button className="submit-btn" onClick={handleSignOut}>
          Sign Out <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  );
}
