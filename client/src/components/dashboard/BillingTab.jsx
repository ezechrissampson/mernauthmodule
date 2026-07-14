import { useEffect, useState } from 'react';
import { adminApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function BillingTab() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi
      .billing()
      .then((res) => setData(res.data.data))
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load billing data', 'danger'));
  }, [showToast]);

  return (
    <div className="auth-card p-4">
      <h5 className="mb-1">Billing &amp; Financial Reports</h5>
      <p className="text-secondary small mb-3">Visible only to Finance and Super Admin.</p>

      {!data ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-3">
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">MRR</div>
                <div className="fs-4 fw-bold">${data.mrr}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">Outstanding Invoices</div>
                <div className="fs-4 fw-bold">{data.outstandingInvoices}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">Last Payout</div>
                <div className="fw-semibold">{data.lastPayoutAt ? new Date(data.lastPayoutAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="alert alert-warning small mb-0">
            <i className="bi bi-info-circle me-1" /> {data.note}
          </div>
        </>
      )}
    </div>
  );
}
