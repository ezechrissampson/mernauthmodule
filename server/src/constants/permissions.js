import { USER_ROLES } from './index.js';

/**
 * Deliberately small, curated permission set — one permission per real feature this
 * platform has, not a speculative enterprise catalog. Every permission below gates an
 * actual route in this codebase; see middlewares/authorize.middleware.js for enforcement.
 */
export const PERMISSIONS = Object.freeze({
  DASHBOARD_VIEW: 'dashboard.view', // baseline: every authenticated role has this

  USERS_MANAGE: 'users.manage', // view all users + assign roles (Admin, Super Admin)
  SECURITY_MANAGE: 'security.manage', // root security control tab (Super Admin ONLY)
  BILLING_MANAGE: 'billing.manage', // billing + financial reports (Finance, Super Admin)

  CONTENT_CREATE: 'content.create', // write + submit a post (Editor, Author)
  CONTENT_EDIT_ANY: 'content.editAny', // edit/delete any user's post (Editor)
  CONTENT_MODERATE: 'content.moderate', // reject/unpublish/archive/delete/flag posts & comments (Moderator)

  APPROVALS_MANAGE: 'approvals.manage', // review trader applications (Manager)
  SUPPORT_MANAGE: 'support.manage', // view & resolve support tickets (Support)
  ANALYTICS_VIEW: 'analytics.view', // read-only analytics dashboard (Analyst)
});

export const PERMISSION_DESCRIPTIONS = Object.freeze({
  [PERMISSIONS.DASHBOARD_VIEW]: 'View their own dashboard',
  [PERMISSIONS.USERS_MANAGE]: 'View all registered users and assign roles',
  [PERMISSIONS.SECURITY_MANAGE]: 'View and manage the security root control panel',
  [PERMISSIONS.BILLING_MANAGE]: 'View billing and financial reports',
  [PERMISSIONS.CONTENT_CREATE]: 'Create posts',
  [PERMISSIONS.CONTENT_EDIT_ANY]: "Edit or delete any user's post",
  [PERMISSIONS.CONTENT_MODERATE]: 'Reject, unpublish, archive, delete, or flag posts and comments',
  [PERMISSIONS.APPROVALS_MANAGE]: 'Review and decide verified-trader applications',
  [PERMISSIONS.SUPPORT_MANAGE]: 'View and resolve customer support tickets',
  [PERMISSIONS.ANALYTICS_VIEW]: 'View read-only analytics and reports',
});

const { DASHBOARD_VIEW, USERS_MANAGE, SECURITY_MANAGE, BILLING_MANAGE, CONTENT_CREATE, CONTENT_EDIT_ANY, CONTENT_MODERATE, APPROVALS_MANAGE, SUPPORT_MANAGE, ANALYTICS_VIEW } = PERMISSIONS;

/**
 * Default permission grants per role, applied once by the seed script and re-applied
 * (idempotently) any time it's re-run. This is the single source of truth for "what can
 * each role do" — everything else (middleware, UI tabs) reads from the database copy of
 * this, not from this file directly, so an operator can later customize grants via the
 * RolePermission collection without a code deploy.
 */
export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  [USER_ROLES.GUEST]: [],
  [USER_ROLES.USER]: [DASHBOARD_VIEW],
  [USER_ROLES.AUTHOR]: [DASHBOARD_VIEW, CONTENT_CREATE],
  [USER_ROLES.EDITOR]: [DASHBOARD_VIEW, CONTENT_CREATE, CONTENT_EDIT_ANY],
  [USER_ROLES.MODERATOR]: [DASHBOARD_VIEW, CONTENT_MODERATE],
  [USER_ROLES.SUPPORT]: [DASHBOARD_VIEW, SUPPORT_MANAGE],
  [USER_ROLES.ANALYST]: [DASHBOARD_VIEW, ANALYTICS_VIEW],
  [USER_ROLES.FINANCE]: [DASHBOARD_VIEW, BILLING_MANAGE],
  [USER_ROLES.MANAGER]: [DASHBOARD_VIEW, APPROVALS_MANAGE],
  [USER_ROLES.ADMIN]: [DASHBOARD_VIEW, USERS_MANAGE, CONTENT_CREATE, CONTENT_EDIT_ANY, CONTENT_MODERATE, APPROVALS_MANAGE, SUPPORT_MANAGE, ANALYTICS_VIEW],
  // Deliberately excludes SECURITY_MANAGE and BILLING_MANAGE — per spec, Admin cannot see those tabs.
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // everything, no exceptions
});

// Roles only a Super Admin is allowed to grant or revoke (prevents an Admin from self-escalating
// or minting another Super Admin). Enforced in adminUser.service.js, not just hidden in the UI.
export const SUPER_ADMIN_ONLY_ASSIGNABLE_ROLES = Object.freeze([USER_ROLES.SUPER_ADMIN]);
