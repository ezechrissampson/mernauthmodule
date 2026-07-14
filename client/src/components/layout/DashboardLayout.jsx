import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/dashboard">
            <i className="bi bi-shield-lock-fill me-2" />
            MERN Auth
          </Link>
          <div className="d-flex align-items-center gap-3">
            <Link to="/security" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-shield-check me-1" /> Security
            </Link>
            <Link to="/profile/edit" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-pencil-square me-1" /> Edit Profile
            </Link>
            <div className="dropdown">
              <button
                className="btn btn-sm btn-light d-flex align-items-center gap-2 border"
                data-bs-toggle="dropdown"
              >
                <img
                  src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=DCFCE7&color=14532D`}
                  alt="avatar"
                  width="28"
                  height="28"
                  className="rounded-circle"
                />
                <span>{user?.username}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow-1 bg-body-tertiary" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="container py-4">{children}</div>
      </main>
    </div>
  );
}
