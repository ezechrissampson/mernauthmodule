import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import FormInput from '../components/common/FormInput.jsx';
import { userApi } from '../api/authApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage, getFieldErrors } from '../utils/validation.js';

export default function ChangeEmail() {
  const [step, setStep] = useState('request'); // 'request' | 'confirm'
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const handleRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.requestEmailChange(newEmail, password);
      showToast('Verification code sent to your new email', 'success');
      setStep('confirm');
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userApi.confirmEmailChangeCode(code);
      await refreshUser();
      showToast('Email address updated successfully', 'success');
      setStep('request');
      setNewEmail('');
      setPassword('');
      setCode('');
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Invalid or expired code'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="auth-card p-4 p-md-5">
            <h5 className="mb-4">Change Email Address</h5>

            {step === 'request' ? (
              <form onSubmit={handleRequest} noValidate>
                <FormInput
                  id="newEmail"
                  type="email"
                  label="New Email Address"
                  icon="bi-envelope"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  error={errors.newEmail}
                />
                <FormInput
                  id="password"
                  type="password"
                  label="Confirm with Password"
                  icon="bi-lock"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                  Send Verification Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirm}>
                <p className="text-secondary small">
                  Enter the 6-digit code sent to <strong>{newEmail}</strong>
                </p>
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
                <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting || code.length !== 6}>
                  {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                  Confirm New Email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
