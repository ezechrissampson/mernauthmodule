import { useEffect, useState } from 'react';
import { traderApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function ApprovalsTab() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteDrafts, setNoteDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await traderApi.list({ status: 'pending' });
      setApplications(data.data.applications);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load applications', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await traderApi.review(id, decision, noteDrafts[id] || '');
      showToast(`Application ${decision}`, 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit decision', 'danger');
    }
  };

  return (
    <div className="auth-card p-4">
      <h5 className="mb-1">Verified Trader Approvals</h5>
      <p className="text-secondary small mb-3">Pending applications from users requesting verified trader status.</p>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : !applications.length ? (
        <p className="text-secondary">No pending applications.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {applications.map((app) => (
            <li key={app._id} className="list-group-item px-0">
              <div className="fw-semibold">{app.applicant?.fullName || app.applicant?.username}</div>
              <div className="text-secondary small mb-2">{app.applicant?.email}</div>
              <p className="small mb-2">{app.message}</p>
              <input
                className="form-control form-control-sm mb-2"
                placeholder="Optional note to applicant"
                value={noteDrafts[app._id] || ''}
                onChange={(e) => setNoteDrafts((d) => ({ ...d, [app._id]: e.target.value }))}
              />
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={() => handleDecision(app._id, 'approved')}>
                  Approve
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDecision(app._id, 'rejected')}>
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
