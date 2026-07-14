export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  EMAIL_CHANGE: 'email_change',
};

export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  MODERATOR: 'moderator',
  AUTHOR: 'author',
  SUPPORT: 'support',
  FINANCE: 'finance',
  ANALYST: 'analyst',
};

// Ordered lowest -> highest authority, used only for display (badges, sort order).
// Authorization decisions never use this order directly — they use the permission catalog.
export const ROLE_DISPLAY_ORDER = [
  USER_ROLES.GUEST,
  USER_ROLES.USER,
  USER_ROLES.AUTHOR,
  USER_ROLES.EDITOR,
  USER_ROLES.MODERATOR,
  USER_ROLES.SUPPORT,
  USER_ROLES.ANALYST,
  USER_ROLES.FINANCE,
  USER_ROLES.MANAGER,
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
];

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  PENDING_DELETION: 'pending_deletion',
  DELETED: 'deleted',
  SUSPENDED: 'suspended',
};

export const AUDIT_EVENTS = {
  SIGNUP: 'SIGNUP',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  LOGOUT: 'LOGOUT',
  LOGOUT_ALL: 'LOGOUT_ALL',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  VERIFICATION_RESENT: 'VERIFICATION_RESENT',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  EMAIL_CHANGE_REQUESTED: 'EMAIL_CHANGE_REQUESTED',
  EMAIL_CHANGED: 'EMAIL_CHANGED',
  USERNAME_CHANGED: 'USERNAME_CHANGED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  ACCOUNT_DELETION_REQUESTED: 'ACCOUNT_DELETION_REQUESTED',
  ACCOUNT_DELETION_CANCELLED: 'ACCOUNT_DELETION_CANCELLED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  SUSPICIOUS_LOGIN: 'SUSPICIOUS_LOGIN',

  // ---- Authorization / role management ----
  ROLE_ASSIGNED: 'ROLE_ASSIGNED',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // ---- Content ----
  POST_CREATED: 'POST_CREATED',
  POST_UPDATED: 'POST_UPDATED',
  POST_MODERATED: 'POST_MODERATED',
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_MODERATED: 'COMMENT_MODERATED',

  // ---- Workflow ----
  TRADER_APPLICATION_SUBMITTED: 'TRADER_APPLICATION_SUBMITTED',
  TRADER_APPLICATION_REVIEWED: 'TRADER_APPLICATION_REVIEWED',
  SUPPORT_TICKET_SUBMITTED: 'SUPPORT_TICKET_SUBMITTED',
  SUPPORT_TICKET_UPDATED: 'SUPPORT_TICKET_UPDATED',
};

// Usernames that must never be assignable by end users
export const RESERVED_USERNAMES = [
  'admin', 'root', 'administrator', 'superuser', 'support', 'help',
  'api', 'auth', 'login', 'logout', 'signup', 'register', 'settings',
  'security', 'system', 'null', 'undefined', 'moderator', 'staff',
  'official', 'me', 'you', 'test', 'demo', 'owner', 'billing',
];

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  // requires at least one lowercase, one uppercase, one number, one special char
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/,
};

export const USERNAME_POLICY = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  REGEX: /^[a-z0-9_.]+$/, // normalized to lowercase; letters, numbers, underscore, dot
};
