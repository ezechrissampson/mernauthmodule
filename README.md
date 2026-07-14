# Merged Platform: Authentication + Role-Based Authorization

This merges two modules into one app:
1. **Authentication** (login, signup, email verification, password reset, sessions) — your existing MERN auth module, unchanged in its core security logic.
2. **Authorization** (roles, permissions, role-specific dashboard tabs) — layered on top, deliberately kept simple: **one role per user**, not a multi-role/hierarchy system.

## Roles

| Role | Slug | Access |
|---|---|---|
| Guest | `guest` | Unauthenticated visitor — public posts + contact form only |
| User | `user` | Own dashboard, can comment, can apply to become a Verified Trader |
| Author | `author` | Create posts, edit/delete **only their own** posts |
| Editor | `editor` | Create posts, edit/delete **any** post (no moderation actions) |
| Moderator | `moderator` | Reject / unpublish / archive / flag / delete any post or comment |
| Support | `support` | View and resolve customer support tickets |
| Analyst | `analyst` | Read-only analytics tab (page views, 7d/1m/3m/9m) |
| Finance | `finance` | Billing & financial reports tab |
| Manager | `manager` | Reviews Verified Trader applications (approve/reject) |
| Admin | `admin` | Everything above except **Billing** and **Security Root Control** |
| Super Admin | `super_admin` | Everything, no exceptions. Only role that can grant/revoke Super Admin. |

The signed-in user's **role never changes their route** — there's one `/dashboard`. What changes is which **tabs** render on it, computed from their permissions (see `server/src/constants/permissions.js` for the exact grant table). That's what makes "assigning a role changes the dashboard" true without maintaining a dozen separate dashboard pages.

## First-time setup

```bash
# 1. Install
cd server && npm install
cd ../client && npm install

# 2. Configure server/.env (copy from .env.example) — Mongo URI, Redis URL, JWT secrets, etc.

# 3. Seed the role/permission catalog (idempotent, safe to re-run)
cd server && npm run seed:rbac

# 4. Create the one Super Admin account (Ezechris / ezeokon070@gmail.com)
npm run seed:super-admin
```

**No other admin account is ever auto-created.** Every other user registers normally via `/register` and starts as `user` — a Super Admin or Admin then assigns them a role from the Users tab.

⚠️ The seeded Super Admin password (`ezeokon070`) does **not** meet this app's own password policy (needs upper+lower+number+symbol) — that's fine for first login since it bypasses the signup validator, but change it immediately via the dashboard's Security tab.

## What's genuinely built vs. intentionally minimal

Built and enforced end-to-end: authentication (unchanged), the permission engine + middleware, all 8 role tabs, own-vs-any content ownership checks, moderation actions, trader approval workflow, support ticket workflow, analytics aggregation, and the Users/role-assignment table.

Intentionally minimal, by your explicit spec: no rich text editor (textarea only), no draft/review workflow for posts (publish-on-submit), no real payment processor behind Billing (placeholder figures, real gate enforcement), no user suspension/ban/impersonation in the Users tab.

See `docs/RBAC.md` for the full permission table and how to add a new permission or role.
