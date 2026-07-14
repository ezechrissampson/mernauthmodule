import { useEffect, useState } from 'react';
import { adminApi } from '../../api/featureApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.jsx';

const ASSIGNABLE_ROLES = ['user', 'author', 'editor', 'moderator', 'support', 'analyst', 'finance', 'manager', 'admin'];
const SUPER_ADMIN_ROLE = 'super_admin';

export default function UsersTab() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers();
      setUsers(data.data.users);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load users', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    try {
      await adminApi.assignRole(userId, role);
      showToast('Role updated', 'success');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role', 'danger');
    } finally {
      setSavingId(null);
    }
  };

  // Only a Super Admin may assign/see the Super Admin option — mirrors the server-side rule.
  const roleOptions = me?.role === SUPER_ADMIN_ROLE ? [...ASSIGNABLE_ROLES, SUPER_ADMIN_ROLE] : ASSIGNABLE_ROLES;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="auth-card p-4">
      <h5 className="mb-1">Users</h5>
      <p className="text-secondary small mb-3">All registered users. Assign a role to change what they can access.</p>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr className="text-secondary small text-uppercase">
              <th>User</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Assign Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <div className="fw-semibold">{u.fullName}</div>
                  <div className="text-secondary small">@{u.username}</div>
                </td>
                <td className="small">{u.email}</td>
                <td>
                  <span className="badge bg-primary-light text-primary text-capitalize">{u.role.replace('_', ' ')}</span>
                </td>
                <td>
                  {String(u._id) === String(me._id) ? (
                    <span className="text-secondary small">— that's you —</span>
                  ) : u.role === SUPER_ADMIN_ROLE && me.role !== SUPER_ADMIN_ROLE ? (
                    <span className="text-secondary small">Only a Super Admin can change this</span>
                  ) : (
                    <select
                      className="form-select form-select-sm"
                      style={{ maxWidth: 180 }}
                      value={u.role}
                      disabled={savingId === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
