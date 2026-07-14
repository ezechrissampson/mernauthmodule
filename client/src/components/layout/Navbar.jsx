import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          <i className="bi bi-shield-lock-fill me-2" />
          MERN Auth
        </Link>
        <div className="d-flex align-items-center gap-2">
          <Link to="/posts" className="btn btn-link btn-sm text-decoration-none">
            Posts
          </Link>
          <Link to="/contact-support" className="btn btn-link btn-sm text-decoration-none">
            Contact Support
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
