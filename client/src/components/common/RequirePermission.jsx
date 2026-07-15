import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

/**
 * Redirects away from a dashboard sub-page the user's role doesn't grant. This is UX only —
 * every API call the page would make is independently re-checked server-side regardless of
 * whether this guard exists, so it's safe purely as a "don't show a dead page" convenience.
 */
export default function RequirePermission({ perm, any, children }) {
  const { can, canAny } = useAuth();
  const allowed = perm ? can(perm) : any ? canAny(any) : true;
  if (!allowed) return <Navigate to="/dashboard" replace />;
  return children;
}
