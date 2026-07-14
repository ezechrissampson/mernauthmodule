import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { userApi } from '../api/authApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage } from '../utils/validation.js';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const canDelete = password.length > 0 && confirmText === 'DELETE';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canDelete) return;

    setIsSubmitting(true);
    try {
      await userApi.deleteAccount(password);
      setUser(null);
      showToast('Your account has been scheduled for deletion.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="auth-card p-4 p-md-5 border-danger-subtle">
            <div className="text-center mb-4">
              <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '2.5rem' }} />
              <h5 className="mt-3 mb-0">Delete Your Account</h5>
            </div>
            <p className="text-secondary small">
              Your account will be deactivated immediately and permanently deleted after the configured grace
              period. You can cancel by logging back in before then.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-medium">
                  Confirm your password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmText" className="form-label fw-medium">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  id="confirmText"
                  type="text"
                  className="form-control"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-danger w-100" disabled={!canDelete || isSubmitting}>
                {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                Permanently Delete My Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
