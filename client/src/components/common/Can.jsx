import { useAuth } from '../../hooks/useAuth.js';

/**
 * Declarative permission gate for UI elements. This is UX only — the server independently
 * re-checks every permission on every request, so hiding something here is never the actual
 * security boundary (see server/src/middlewares/authorize.middleware.js for that).
 */
export default function Can({ perm, any, children, fallback = null }) {
  const { can, canAny } = useAuth();
  let allowed = true;
  if (perm) allowed = can(perm);
  else if (any) allowed = canAny(any);
  return allowed ? children : fallback;
}
