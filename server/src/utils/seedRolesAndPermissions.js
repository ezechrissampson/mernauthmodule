/**
 * Idempotent — safe to re-run. Seeds the Role catalog, Permission catalog, and default
 * role->permission grants from constants/permissions.js. Run with: npm run seed:rbac
 * Does NOT create any user accounts — see seedSuperAdmin.js for that.
 */
import { validateEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import logger from './logger.js';
import Role from '../models/Role.js';
import { Permission, RolePermission } from '../models/Permission.js';
import { USER_ROLES } from '../constants/index.js';
import { PERMISSIONS, PERMISSION_DESCRIPTIONS, DEFAULT_ROLE_PERMISSIONS } from '../constants/permissions.js';
import { invalidateAllRolePermissionCaches } from '../services/permission.service.js';

const ROLE_METADATA = {
  [USER_ROLES.GUEST]: { name: 'Guest', color: '#9CA3AF', icon: 'bi-person-x', description: 'Unauthenticated visitor — public content only.' },
  [USER_ROLES.USER]: { name: 'User', color: '#6B7280', icon: 'bi-person', description: 'Standard registered user.' },
  [USER_ROLES.AUTHOR]: { name: 'Author', color: '#8B5CF6', icon: 'bi-feather', description: 'Creates and edits their own posts only.' },
  [USER_ROLES.EDITOR]: { name: 'Editor', color: '#2563EB', icon: 'bi-pencil-square', description: 'Creates and edits any post.' },
  [USER_ROLES.MODERATOR]: { name: 'Moderator', color: '#0EA5E9', icon: 'bi-flag', description: 'Moderates posts and comments.' },
  [USER_ROLES.SUPPORT]: { name: 'Support', color: '#F59E0B', icon: 'bi-headset', description: 'Handles customer support tickets.' },
  [USER_ROLES.ANALYST]: { name: 'Analyst', color: '#0891B2', icon: 'bi-bar-chart', description: 'Read-only analytics access.' },
  [USER_ROLES.FINANCE]: { name: 'Finance', color: '#DC2626', icon: 'bi-cash-coin', description: 'Billing and financial reports access.' },
  [USER_ROLES.MANAGER]: { name: 'Manager', color: '#22C55E', icon: 'bi-diagram-3', description: 'Reviews and approves trader applications.' },
  [USER_ROLES.ADMIN]: { name: 'Admin', color: '#16A34A', icon: 'bi-shield-lock', description: 'Administrative access, excluding billing and security root controls.' },
  [USER_ROLES.SUPER_ADMIN]: { name: 'Super Admin', color: '#14532D', icon: 'bi-shield-fill-check', description: 'Full unrestricted access to every module.' },
};

async function seedRoles() {
  const roles = {};
  for (const [slug, meta] of Object.entries(ROLE_METADATA)) {
    let role = await Role.findOne({ slug });
    if (!role) {
      role = await Role.create({ slug, ...meta });
      logger.info(`Seeded role: ${role.name}`);
    }
    roles[slug] = role;
  }
  return roles;
}

async function seedPermissions() {
  const permissions = {};
  for (const key of Object.values(PERMISSIONS)) {
    let permission = await Permission.findOne({ key });
    if (!permission) {
      permission = await Permission.create({ key, description: PERMISSION_DESCRIPTIONS[key] || '' });
      logger.info(`Seeded permission: ${permission.key}`);
    }
    permissions[key] = permission;
  }
  return permissions;
}

async function seedGrants(roles, permissions) {
  for (const [roleSlug, permissionKeys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = roles[roleSlug];
    if (!role) continue;

    // Replace grants wholesale so re-running the seed after editing permissions.js
    // (e.g. removing a permission from a role) actually reflects the change.
    const desiredPermissionIds = permissionKeys.map((k) => permissions[k]?._id).filter(Boolean);
    await RolePermission.deleteMany({ role: role._id, permission: { $nin: desiredPermissionIds } });

    const ops = desiredPermissionIds.map((permissionId) => ({
      updateOne: {
        filter: { role: role._id, permission: permissionId },
        update: { $setOnInsert: { role: role._id, permission: permissionId } },
        upsert: true,
      },
    }));
    if (ops.length) await RolePermission.bulkWrite(ops, { ordered: false });
  }
  logger.info('Role -> permission grants synced.');
}

async function run() {
  validateEnv();
  await connectDB();

  const roles = await seedRoles();
  const permissions = await seedPermissions();
  await seedGrants(roles, permissions);
  await invalidateAllRolePermissionCaches();

  logger.info('RBAC seed complete.');
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  logger.error(`RBAC seed failed: ${err.message}`);
  process.exit(1);
});
