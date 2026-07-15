import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { WORKSPACE_NAV, ACCOUNT_NAV } from '../../constants/dashboardNav.js';

export default function Sidebar({ open, onClose }) {
  const { user, can } = useAuth();

  const visibleWorkspaceItems = WORKSPACE_NAV.filter((item) => {
    if (item.roleOnly) return user?.role === item.roleOnly;
    if (item.perm) return can(item.perm);
    return true;
  });

  return (
    <>
      {/* Mobile backdrop — click to close */}
      <div className={`app-sidebar-backdrop d-lg-none ${open ? 'show' : ''}`} onClick={onClose} />

      <aside className={`app-sidebar ${open ? 'show' : ''}`}>
        <div className="app-sidebar-brand">
          <NavLink to="/dashboard" className="d-flex align-items-center gap-2 text-decoration-none" onClick={onClose}>
            <span className="app-sidebar-brand-icon">
              <i className="bi bi-shield-lock-fill" />
            </span>
            <span>
              <div className="fw-bold text-body">MERN Auth</div>
              <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                Access Control Panel
              </div>
            </span>
          </NavLink>
          <button className="btn-close d-lg-none" onClick={onClose} aria-label="Close menu" />
        </div>

        <div className="app-sidebar-scroll">
          <div className="app-sidebar-section">
            <div className="app-sidebar-heading">Overview</div>
            <nav className="nav flex-column gap-1">
              <NavLink to="/dashboard" end className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <i className="bi bi-speedometer2" />
                Dashboard
              </NavLink>
            </nav>
          </div>

          {!!visibleWorkspaceItems.length && (
            <div className="app-sidebar-section">
              <div className="app-sidebar-heading">Workspace</div>
              <nav className="nav flex-column gap-1">
                {visibleWorkspaceItems.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}

          <div className="app-sidebar-section">
            <div className="app-sidebar-heading">Account</div>
            <nav className="nav flex-column gap-1">
              {ACCOUNT_NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                  <i className={`bi ${item.icon}`} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="app-sidebar-footer">
          <div className="d-flex align-items-center gap-2">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=DCFCE7&color=14532D`}
              alt=""
              width="36"
              height="36"
              className="rounded-circle"
              style={{ objectFit: 'cover' }}
            />
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-semibold small text-truncate">{user?.fullName}</div>
              <div className="text-secondary text-capitalize" style={{ fontSize: '0.72rem' }}>
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
