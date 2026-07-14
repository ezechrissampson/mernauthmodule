import { Link } from 'react-router-dom';

/** Shared shell for full-page status states (401/403/404/500/offline/maintenance). */
export default function StatusPage({ icon, code, title, message, actionLabel = 'Go Home', actionTo = '/' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-center px-3">
      <i className={`bi ${icon} text-primary`} style={{ fontSize: '4rem' }} />
      {code && <h1 className="display-4 fw-bold mt-3 mb-0">{code}</h1>}
      <h4 className="mt-2">{title}</h4>
      <p className="text-secondary" style={{ maxWidth: '420px' }}>
        {message}
      </p>
      <Link to={actionTo} className="btn btn-primary mt-2">
        {actionLabel}
      </Link>
    </div>
  );
}
