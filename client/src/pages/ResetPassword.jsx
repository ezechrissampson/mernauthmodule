import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import { authApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage, getFieldErrors, PASSWORD_REGEX } from '../utils/validation.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <div className="text-center py-2">
          <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '2.5rem' }} />
          <p className="mt-3 text-secondary">This password reset link is missing a token.</p>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!PASSWORD_REGEX.test(password)) {
      next.password = 'Password needs 8+ characters, upper & lower case, a number, and a symbol';
    }
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, password, confirmPassword);
      showToast('Password reset successfully. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err, 'Reset link is invalid or expired'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new, strong password">
      <form onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          showStrength
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
          Reset Password
        </button>
      </form>
    </AuthLayout>
  );
}
