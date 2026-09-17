/**
 * OTPForm — Email verification handler
 * Used by: OTPPage.jsx at /verify-email?userId=...&secret=...
 *
 * Flow: auto-verifies on mount, then redirects to login.
 * The user signed up, we deleted the session to keep them on "Check your email".
 * After verification they need to sign in to get a fresh session.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Account } from 'appwrite';
import appwriteClient from '../../lib/appwrite';

export default function OTPForm() {
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (!userId || !secret) {
      return;
    }

    let redirected = false;

    const verifyEmail = async () => {
      try {
        const account = new Account(appwriteClient);
        await account.updateVerification(userId, secret);
      } catch {
        // Already verified, expired, or invalid — still redirect
      }

      if (!redirected) {
        redirected = true;
        navigate('/login', { replace: true });
      }
    };

    verifyEmail();

    return () => { redirected = true; };
  }, [searchParams, navigate]);

  return (
    <div className="auth-form-wrapper" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <span className="spinner" style={{ width: 48, height: 48, margin: '0 auto 1.5rem' }} />
      <h3>Verifying your email...</h3>
    </div>
  );
}
