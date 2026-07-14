import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';

export default function Landing() {
  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <div className="row align-items-center min-vh-50 py-5">
          <div className="col-lg-7">
            <span className="badge bg-primary-light text-primary mb-3 px-3 py-2 rounded-pill">
              Production-Ready Auth Module
            </span>
            <h1 className="display-5 fw-bold mb-3">
              Secure authentication, <span className="text-primary">done right.</span>
            </h1>
            <p className="text-secondary fs-5 mb-4">
              A complete, reusable MERN authentication system with email verification, password
              recovery, session management, and OWASP-aligned security — ready to drop into any project.
            </p>
            <div className="d-flex gap-3">
              <Link to="/register" className="btn btn-primary btn-lg px-4">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg px-4">
                Log In
              </Link>
            </div>
          </div>
          <div className="col-lg-5 mt-5 mt-lg-0">
            <div className="auth-card p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-patch-check-fill text-primary fs-3" />
                <div>
                  <div className="fw-semibold">Email Verification</div>
                  <small className="text-secondary">Code or link based, your choice</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-shield-lock-fill text-primary fs-3" />
                <div>
                  <div className="fw-semibold">JWT + Refresh Rotation</div>
                  <small className="text-secondary">HttpOnly cookies, device sessions</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-eye-fill text-primary fs-3" />
                <div>
                  <div className="fw-semibold">Full Audit Trail</div>
                  <small className="text-secondary">Login history & suspicious activity hooks</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
