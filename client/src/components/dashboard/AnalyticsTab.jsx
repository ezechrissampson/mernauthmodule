import { useEffect, useState } from 'react';
import { adminApi } from '../../api/featureApi.js';
import { useToast } from '../../hooks/useToast.jsx';

const RANGES = [
  { value: '7d', label: '7 Days' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '9m', label: '9 Months' },
];

export default function AnalyticsTab() {
  const { showToast } = useToast();
  const [range, setRange] = useState('7d');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .analytics(range)
      .then(({ data }) => setSummary(data.data))
      .catch((err) => showToast(err.response?.data?.message || 'Failed to load analytics', 'danger'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const maxViews = summary?.dailyViews?.length ? Math.max(...summary.dailyViews.map((d) => d.views), 1) : 1;

  return (
    <div className="auth-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Analytics</h5>
        <div className="btn-group btn-group-sm">
          {RANGES.map((r) => (
            <button key={r.value} className={`btn ${range === r.value ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-4">
              <div className="p-3 rounded-3" style={{ background: 'var(--color-primary-light)' }}>
                <div className="text-secondary small">Total Views</div>
                <div className="fs-4 fw-bold text-primary">{summary?.totalViews ?? 0}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">New Posts</div>
                <div className="fs-4 fw-bold">{summary?.totalPosts ?? 0}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded-3 bg-light">
                <div className="text-secondary small">New Comments</div>
                <div className="fs-4 fw-bold">{summary?.totalComments ?? 0}</div>
              </div>
            </div>
          </div>

          <h6 className="small text-uppercase text-secondary mb-2">Views over time</h6>
          {!summary?.dailyViews?.length ? (
            <p className="text-secondary small">No views recorded in this range yet.</p>
          ) : (
            <div className="d-flex align-items-end gap-1 mb-4" style={{ height: 120 }}>
              {summary.dailyViews.map((d) => (
                <div key={d.date} className="flex-grow-1 d-flex flex-column justify-content-end align-items-center" title={`${d.date}: ${d.views} views`}>
                  <div style={{ width: '100%', height: `${(d.views / maxViews) * 100}%`, minHeight: 2, background: 'var(--color-primary)', borderRadius: 3 }} />
                </div>
              ))}
            </div>
          )}

          <h6 className="small text-uppercase text-secondary mb-2">Top Posts</h6>
          {!summary?.topPosts?.length ? (
            <p className="text-secondary small">No posts yet.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {summary.topPosts.map((p) => (
                <li key={p._id} className="list-group-item px-0 d-flex justify-content-between">
                  <span>{p.title}</span>
                  <span className="text-secondary small">
                    {p.viewCount} views &middot; {p.commentCount} comments
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
