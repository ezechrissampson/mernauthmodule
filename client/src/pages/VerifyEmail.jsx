import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import { authApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage } from '../utils/validation.js';

export default function VerifyEmail() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const linkToken = searchParams.get('token');
  const userId = location.state?.userId;
  const email = location.state?.email;

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    timerRef.current = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  if (linkToken) {
    return <LinkVerification token={linkToken} navigate={navigate} showToast={showToast} />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!userId) {
      showToast('Missing account reference. Please sign up again.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await authApi.verifyEmailCode(userId, code);
      showToast('Email verified! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Invalid or expired code'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await authApi.resendVerification(email);
      showToast('A new verification code has been sent.', 'success');
      setCooldown(60);
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code sent to ${email || 'your email'}`}>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          className="form-control form-control-lg text-center mb-3"
          style={{ letterSpacing: '10px', fontWeight: 700 }}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="------"
        />
        <button type="submit" className="btn btn-primary w-100 mb-3" disabled={isSubmitting || code.length !== 6}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
          Verify Email
        </button>
        <div className="text-center">
          <button type="button" className="btn btn-link p-0" onClick={handleResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

function LinkVerification({ token, navigate, showToast }) {
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        const api = (await import('../api/axiosInstance.js')).default;
        await api.get(`/auth/verify-email/link?token=${token}`);
        setStatus('success');
        showToast('Email verified successfully!', 'success');
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setStatus('failed');
        showToast(getApiErrorMessage(err, 'Verification failed'), 'error');
      }
    })();
  }, [token, navigate, showToast]);

  return (
    <AuthLayout title="Email Verification">
      <div className="text-center py-3">
        {status === 'verifying' && (
          <>
            <div className="spinner-border text-primary mb-3" />
            <p className="text-secondary">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }} />
            <p className="mt-3">Your email has been verified. Redirecting to login...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }} />
            <p className="mt-3">This link is invalid or has expired.</p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
