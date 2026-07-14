import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import PasswordInput from '../components/auth/PasswordInput.jsx';
import { userApi } from '../api/authApi.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage, getFieldErrors, PASSWORD_REGEX } from '../utils/validation.js';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!currentPassword) next.currentPassword = 'Current password is required';
    if (!PASSWORD_REGEX.test(newPassword)) {
      next.newPassword = 'Password needs 8+ characters, upper & lower case, a number, and a symbol';
    }
    if (confirmPassword !== newPassword) next.confirmPassword = 'Passwords do not match';
    if (newPassword === currentPassword && currentPassword) {
      next.newPassword = 'New password must be different from current password';
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setIsSubmitting(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword, confirmPassword });
      showToast('Password changed successfully', 'success');
      navigate('/security');
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="auth-card p-4 p-md-5">
            <h5 className="mb-4">Change Password</h5>
            <form onSubmit={handleSubmit} noValidate>
              <PasswordInput
                id="currentPassword"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={errors.currentPassword}
              />
              <PasswordInput
                id="newPassword"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
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
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
