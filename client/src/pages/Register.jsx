import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import FormInput from '../components/common/FormInput.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import { authApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage, getFieldErrors, PASSWORD_REGEX } from '../utils/validation.js';

const initialForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    const value = field === 'acceptTerms' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateClientSide = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters';
    if (form.username.trim().length < 3) next.username = 'Username must be at least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please provide a valid email address';
    if (!PASSWORD_REGEX.test(form.password)) {
      next.password = 'Password needs 8+ characters, upper & lower case, a number, and a symbol';
    }
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) next.acceptTerms = 'You must accept the Terms and Conditions';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await authApi.signup(form);
      showToast('Account created! Check your email to verify.', 'success');
      navigate('/verify-email', { state: { userId: data.data.user._id ?? data.data.user.id, email: form.email } });
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start securing your app in minutes"
      footer={
        <span className="text-secondary">
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormInput
          id="fullName"
          label="Full Name"
          icon="bi-person"
          placeholder="Jane Doe"
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
        />
        <FormInput
          id="username"
          label="Username"
          icon="bi-at"
          placeholder="janedoe"
          value={form.username}
          onChange={handleChange('username')}
          error={errors.username}
        />
        <FormInput
          id="email"
          type="email"
          label="Email"
          icon="bi-envelope"
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          showStrength
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
        />
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
            id="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange('acceptTerms')}
          />
          <label className="form-check-label small" htmlFor="acceptTerms">
            I agree to the Terms and Conditions and Privacy Policy
          </label>
          {errors.acceptTerms && <div className="invalid-feedback d-block">{errors.acceptTerms}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : (
            <i className="bi bi-person-plus me-2" />
          )}
          Create Account
        </button>
      </form>
    </AuthLayout>
  );
}
