import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <span className="fw-bold fs-4 text-primary">
              <i className="bi bi-shield-lock-fill me-2" />
              MERN Auth
            </span>
          </Link>
        </div>
        <div className="auth-card p-4 p-md-5">
          <h2 className="h4 fw-bold mb-1">{title}</h2>
          {subtitle && <p className="text-secondary mb-4">{subtitle}</p>}
          {children}
        </div>
        {footer && <div className="text-center mt-3">{footer}</div>}
      </div>
    </div>
  );
}
