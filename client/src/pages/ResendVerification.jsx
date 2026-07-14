import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import FormInput from '../components/common/FormInput.jsx';
import { authApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage } from '../utils/validation.js';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.resendVerification(email);
      setSent(true);
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Resend verification email"
      subtitle="Enter your email and we'll send a new verification link or code"
      footer={
        <span className="text-secondary">
          Remembered your password? <Link to="/login">Log in</Link>
        </span>
      }
    >
      {sent ? (
        <div className="text-center py-2">
          <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: '2.5rem' }} />
          <p className="mt-3 text-secondary">
            If an unverified account exists for that email, a new verification email is on its way.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <FormInput
            id="email"
            type="email"
            label="Email"
            icon="bi-envelope"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
            Resend Verification
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
