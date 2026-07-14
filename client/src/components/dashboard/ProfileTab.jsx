import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProfileTab() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="row">
      <div className="col-lg-4 mb-4">
        <div className="auth-card p-4 text-center">
          <img
            src={
              user.avatar?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=DCFCE7&color=14532D&size=128`
            }
            alt="Profile"
            className="rounded-circle mb-3"
            width="100"
            height="100"
            style={{ objectFit: 'cover' }}
          />
          <h5 className="mb-0">{user.fullName}</h5>
          <p className="text-secondary mb-2">@{user.username}</p>
          <span className="badge bg-primary-light text-primary text-capitalize mb-2">{user.role.replace('_', ' ')}</span>
          <div>
            {user.isEmailVerified ? (
              <span className="badge bg-primary-light text-primary">
                <i className="bi bi-patch-check-fill me-1" /> Verified
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning">
                <i className="bi bi-exclamation-triangle-fill me-1" /> Unverified
              </span>
            )}
          </div>
          <div className="d-grid gap-2 mt-4">
            <Link to="/profile/edit" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-pencil-square me-1" /> Edit Profile
            </Link>
            <Link to="/security" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-shield-check me-1" /> Security
            </Link>
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        <div className="auth-card p-4">
          <h5 className="mb-4">Account Overview</h5>
          <dl className="row mb-0">
            <dt className="col-sm-4 text-secondary fw-normal">Email</dt>
            <dd className="col-sm-8">{user.email}</dd>

            <dt className="col-sm-4 text-secondary fw-normal">Username</dt>
            <dd className="col-sm-8">@{user.username}</dd>

            <dt className="col-sm-4 text-secondary fw-normal">Role</dt>
            <dd className="col-sm-8 text-capitalize">{user.role.replace('_', ' ')}</dd>

            <dt className="col-sm-4 text-secondary fw-normal">Bio</dt>
            <dd className="col-sm-8">{user.bio || <span className="text-secondary">No bio yet</span>}</dd>

            <dt className="col-sm-4 text-secondary fw-normal">Account Created</dt>
            <dd className="col-sm-8">{new Date(user.createdAt).toLocaleDateString()}</dd>

            <dt className="col-sm-4 text-secondary fw-normal">Last Login</dt>
            <dd className="col-sm-8">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'This is your first login'}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
