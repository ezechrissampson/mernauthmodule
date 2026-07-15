import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <header className="app-topbar">
      <button className="btn btn-light border d-lg-none" onClick={onMenuClick} aria-label="Open menu">
        <i className="bi bi-list fs-5" />
      </button>

      <Link to="/dashboard" className="app-topbar-brand d-lg-none text-decoration-none">
        <i className="bi bi-shield-lock-fill text-primary me-1" />
        <span className="fw-bold text-body">MERN Auth</span>
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2">
        {!user?.isEmailVerified && (
          <Link to="/resend-verification" className="badge bg-warning-subtle text-warning text-decoration-none d-none d-sm-inline-block">
            <i className="bi bi-exclamation-triangle-fill me-1" /> Verify email
          </Link>
        )}

        <div className="dropdown">
          <button className="btn btn-sm btn-light d-flex align-items-center gap-2 border" data-bs-toggle="dropdown">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=DCFCE7&color=14532D`}
              alt="avatar"
              width="28"
              height="28"
              className="rounded-circle"
              style={{ objectFit: 'cover' }}
            />
            <span className="d-none d-sm-inline">{user?.username}</span>
            <i className="bi bi-chevron-down small" />
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li>
              <span className="dropdown-item-text text-secondary small">Signed in as</span>
            </li>
            <li>
              <span className="dropdown-item-text fw-semibold small text-truncate d-block">{user?.email}</span>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/profile/edit">
                <i className="bi bi-person-gear me-2" /> Edit Profile
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/security">
                <i className="bi bi-shield-check me-2" /> Security
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
