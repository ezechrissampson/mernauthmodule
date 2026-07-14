import { useEffect, useState } from 'react';
import { adminApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function SecurityControlTab() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi
      .security()
      .then((res) => setData(res.data.data))
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load security data', 'danger'));
  }, [showToast]);

  return (
    <div className="auth-card p-4">
      <h5 className="mb-1">
        <i className="bi bi-shield-fill-check text-primary me-1" /> Security Root Control
      </h5>
      <p className="text-secondary small mb-3">Visible only to Super Admin.</p>

      {!data ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">Locked Accounts</div>
                <div className="fs-4 fw-bold">{data.lockedAccounts}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 rounded-3" style={{ background: 'var(--color-primary-light)' }}>
                <div className="text-secondary small">Super Admin Accounts</div>
                <div className="fs-4 fw-bold text-primary">{data.superAdminCount}</div>
              </div>
            </div>
          </div>
          <div className="alert alert-info small mb-0">
            <i className="bi bi-info-circle me-1" /> {data.note}
          </div>
        </>
      )}
    </div>
  );
}
