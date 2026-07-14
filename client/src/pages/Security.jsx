import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { userApi } from '../api/authApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { getApiErrorMessage } from '../utils/validation.js';

export default function Security() {
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userApi.getSecurityOverview();
        setOverview(data.data);
      } catch (err) {
        showToast(getApiErrorMessage(err), 'error');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [showToast]);

  const handleRevokeSession = async (id) => {
    try {
      await userApi.revokeSession(id);
      setOverview((prev) => ({
        ...prev,
        activeSessions: prev.activeSessions.filter((s) => s.id !== id),
      }));
      showToast('Session revoked', 'success');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      await userApi.revokeAllSessions();
      showToast('All other sessions have been logged out', 'success');
      const { data } = await userApi.getSecurityOverview();
      setOverview(data.data);
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const handleLogoutEverywhere = async () => {
    try {
      await logout();
      showToast('Logged out from all devices', 'success');
      navigate('/login');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  return (
    <DashboardLayout>
      <h4 className="mb-4">Security Settings</h4>

      {isLoading ? (
        <div className="skeleton" style={{ height: '200px' }} />
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-6 mb-4 mb-md-0">
              <div className="auth-card p-4">
                <h6 className="mb-3">Account Security</h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary">Password</span>
                  <span>
                    {overview.passwordChangedAt
                      ? `Changed ${new Date(overview.passwordChangedAt).toLocaleDateString()}`
                      : 'Never changed'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary">Email Verification</span>
                  {overview.isEmailVerified ? (
                    <span className="badge bg-primary-light text-primary">Verified</span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning">Unverified</span>
                  )}
                </div>
                <div className="d-grid gap-2">
                  <Link to="/security/change-password" className="btn btn-outline-primary btn-sm">
                    Change Password
                  </Link>
                  <Link to="/security/change-email" className="btn btn-outline-secondary btn-sm">
                    Change Email
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="auth-card p-4">
                <h6 className="mb-3">Danger Zone</h6>
                <p className="text-secondary small">These actions affect all of your active sessions.</p>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-warning btn-sm" onClick={handleLogoutAllOthers}>
                    Log Out All Other Devices
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogoutEverywhere}>
                    Log Out Everywhere
                  </button>
                  <Link to="/security/delete-account" className="btn btn-danger btn-sm">
                    Delete Account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-card p-4 mb-4">
            <h6 className="mb-3">Active Sessions</h6>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-secondary small">
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Last Active</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {overview.activeSessions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        {s.userAgent}
                        {s.isCurrent && <span className="badge bg-primary-light text-primary ms-2">This device</span>}
                      </td>
                      <td>{s.ip}</td>
                      <td>{new Date(s.lastUsedAt).toLocaleString()}</td>
                      <td className="text-end">
                        {!s.isCurrent && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevokeSession(s.id)}>
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="auth-card p-4">
            <h6 className="mb-3">Recent Login History</h6>
            <ul className="list-group list-group-flush">
              {overview.recentLogins.map((entry) => (
                <li key={entry._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <i
                      className={`bi ${entry.success ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}
                    />
                    {entry.ip} &middot; {entry.userAgent}
                    {entry.suspicious && <span className="badge bg-warning-subtle text-warning ms-2">Suspicious</span>}
                  </div>
                  <small className="text-secondary">{new Date(entry.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
