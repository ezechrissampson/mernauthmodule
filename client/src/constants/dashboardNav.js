/**
 * One place that defines every dashboard nav item: its route, icon, label, and the
 * permission (if any) required to see it. Sidebar.jsx renders from this list, and each
 * corresponding page wraps itself in <RequirePermission> using the same key — so a new
 * tab only needs to be added here once.
 */
export const WORKSPACE_NAV = [
  { to: '/dashboard/trader', label: 'Verified Trader', icon: 'bi-patch-check', roleOnly: 'user' },
  { to: '/dashboard/content', label: 'My Content', icon: 'bi-pencil-square', perm: 'content.create' },
  { to: '/dashboard/moderation', label: 'Moderation', icon: 'bi-flag', perm: 'content.moderate' },
  { to: '/dashboard/approvals', label: 'Approvals', icon: 'bi-check2-square', perm: 'approvals.manage' },
  { to: '/dashboard/support', label: 'Support Tickets', icon: 'bi-headset', perm: 'support.manage' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: 'bi-bar-chart', perm: 'analytics.view' },
  { to: '/dashboard/users', label: 'Users', icon: 'bi-people', perm: 'users.manage' },
  { to: '/dashboard/billing', label: 'Billing', icon: 'bi-cash-coin', perm: 'billing.manage' },
  { to: '/dashboard/security-control', label: 'Security Control', icon: 'bi-shield-fill-check', perm: 'security.manage' },
];

export const ACCOUNT_NAV = [
  { to: '/profile/edit', label: 'Edit Profile', icon: 'bi-person-gear' },
  { to: '/security', label: 'Security', icon: 'bi-shield-check' },
];
