import { useEffect, useState } from 'react';
import { traderApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

const STATUS_STYLES = {
  pending: 'bg-warning-subtle text-warning',
  approved: 'bg-success-subtle text-success',
  rejected: 'bg-danger-subtle text-danger',
};

export default function TraderApplyTab() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await traderApi.mine();
      setApplications(data.data.applications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const hasPending = applications.some((a) => a.status === 'pending');

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await traderApi.apply(message);
      showToast('Application submitted', 'success');
      setMessage('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card p-4">
      <h5 className="mb-1">Become a Verified Trader</h5>
      <p className="text-secondary small mb-3">Tell us about your trading experience. A manager will review your application.</p>

      {!hasPending && (
        <>
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Briefly describe your trading experience..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />
          <button className="btn btn-primary btn-sm mb-4" onClick={handleSubmit} disabled={submitting || !message.trim()}>
            {submitting ? <span className="spinner-border spinner-border-sm me-1" /> : null}
            Submit Application
          </button>
        </>
      )}

      <h6 className="small text-uppercase text-secondary mb-2">Your Applications</h6>
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      ) : !applications.length ? (
        <p className="text-secondary small">You haven't applied yet.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {applications.map((app) => (
            <li key={app._id} className="list-group-item px-0">
              <div className="d-flex justify-content-between align-items-start">
                <p className="small mb-1">{app.message}</p>
                <span className={`badge text-capitalize ${STATUS_STYLES[app.status]}`}>{app.status}</span>
              </div>
              {app.reviewNote && <div className="text-secondary small">Note: {app.reviewNote}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
