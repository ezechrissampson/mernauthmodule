import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import FormInput from '../components/common/FormInput.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage, getFieldErrors } from '../utils/validation.js';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!identifier.trim() || !password) {
      setErrors({
        identifier: !identifier.trim() ? 'Email or username is required' : undefined,
        password: !password ? 'Password is required' : undefined,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier, password, rememberMe);
      showToast('Welcome back!', 'success');
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err, 'Invalid credentials'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your dashboard"
      footer={
        <span className="text-secondary">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="identifier"
          label="Email or Username"
          icon="bi-person"
          placeholder="jane@example.com or janedoe"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
          autoFocus
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="rememberMe">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="small">
            Forgot password?
          </Link>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : (
            <i className="bi bi-box-arrow-in-right me-2" />
          )}
          Log In
        </button>
      </form>
    </AuthLayout>
  );
}
