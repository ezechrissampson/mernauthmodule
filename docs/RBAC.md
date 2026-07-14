# RBAC Reference

## How authorization works, end to end

1. `middlewares/auth.middleware.js` (`protect`) verifies the JWT and loads the real `User` document onto `req.user`. This is unchanged from the auth module.
2. `services/permission.service.js` looks up `req.user.role` (a single string, e.g. `'editor'`) in the `Role` → `RolePermission` → `Permission` collections, and caches the resulting permission-key array in Redis for 5 minutes.
3. `middlewares/authorize.middleware.js` exposes `requirePermission(key)`, `requireAnyPermission([keys])`, `requireRole(...slugs)`, and `requireOwnerOrPermission(overrideKey, loadOwnerId)` — every feature route uses one of these.
4. Every denial is written to `AuditLog` via `auditService.log(AUDIT_EVENTS.ACCESS_DENIED, ...)`.

Nothing about authorization is decided from anything the client sends — the frontend's `can()`/`canAny()` (in `AuthContext`) only control which tabs/buttons *render*; the server independently re-checks every single request.

## Permission table

See `server/src/constants/permissions.js` — `DEFAULT_ROLE_PERMISSIONS` is the single source of truth, applied by `npm run seed:rbac`. Re-running that script after editing this file re-syncs the database to match (it deletes grants no longer listed, and adds new ones — it's a full reconciliation, not just an insert).

## Adding a new permission or role

1. Add the permission key to `PERMISSIONS` (and a description to `PERMISSION_DESCRIPTIONS`) in `constants/permissions.js`.
2. Add it to whichever role(s) in `DEFAULT_ROLE_PERMISSIONS` should have it.
3. If it's a brand new role slug, add it to `USER_ROLES` in `constants/index.js` (this is also the enum on the `User.role` field — Mongoose will reject an unknown role string otherwise) and give it metadata in `ROLE_METADATA` inside `utils/seedRolesAndPermissions.js`.
4. Run `npm run seed:rbac` again.
5. Gate your new route with `requirePermission(PERMISSIONS.YOUR_NEW_KEY)`.
6. If it should show a dashboard tab, add an entry to the `tabs` array in `client/src/pages/Dashboard.jsx` gated on `can('your.new.key')`.

## Why single-role-per-user instead of multi-role

The spec asked for something simple: one user, one role, assigned by an Admin/Super Admin from a plain table — not a multi-role hierarchy with inheritance. Keeping `User.role` a single string (rather than a join table) means:
- Assigning a role is one `PATCH` with no conflict resolution to reason about.
- "Which dashboard tabs does this user see" is a single lookup, not a union across N role assignments.
- It matches exactly what was asked for. If real multi-role support is ever needed later, the `Role`/`Permission`/`RolePermission` collections are already structured so a `UserRole` join table could be added without reshaping anything else.
