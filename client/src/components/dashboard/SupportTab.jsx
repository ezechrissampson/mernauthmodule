import { useEffect, useState } from 'react';
import { supportApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function SupportTab() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supportApi.list(filter ? { status: filter } : {});
      setTickets(data.data.tickets);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load tickets', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await supportApi.update(id, { status });
      showToast('Ticket updated', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update ticket', 'danger');
    }
  };

  return (
    <div className="auth-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Support Tickets</h5>
        <select className="form-select form-select-sm" style={{ width: 160 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : !tickets.length ? (
        <p className="text-secondary">No tickets.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {tickets.map((t) => (
            <li key={t._id} className="list-group-item px-0">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">{t.subject}</div>
                  <div className="text-secondary small">
                    {t.name} &middot; {t.email} &middot; {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`badge text-capitalize align-self-start ${
                    t.status === 'resolved' ? 'bg-success-subtle text-success' : t.status === 'in_progress' ? 'bg-warning-subtle text-warning' : 'bg-secondary-subtle text-secondary'
                  }`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>
              <p className="small mt-2 mb-2">{t.message}</p>
              {t.status !== 'resolved' && (
                <div className="d-flex gap-2">
                  {t.status === 'open' && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateStatus(t._id, 'in_progress')}>
                      Mark In Progress
                    </button>
                  )}
                  <button className="btn btn-sm btn-primary" onClick={() => updateStatus(t._id, 'resolved')}>
                    Mark Resolved
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
