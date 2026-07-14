import Role from '../models/Role.js';
import { RolePermission } from '../models/Permission.js';
import redisClient from '../config/redis.js';
import logger from '../utils/logger.js';

const CACHE_PREFIX = 'perm:role:';
const CACHE_TTL_SECONDS = 300;

/**
 * Returns the permission key array granted to a role slug (e.g. 'editor' -> ['dashboard.view',
 * 'content.create', 'content.editAny']). Cached in Redis since this is looked up on every
 * permission-gated request; invalidated whenever an admin changes role grants (there's no
 * self-service grant editing in this simplified module, so in practice this only changes
 * when the seed script runs — but the cache + invalidation path is here for correctness).
 */
export async function getPermissionsForRole(roleSlug) {
  if (!roleSlug) return [];

  const cacheKey = `${CACHE_PREFIX}${roleSlug}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    logger.warn(`Permission cache read failed, falling back to DB: ${err.message}`);
  }

  const role = await Role.findOne({ slug: roleSlug });
  if (!role) return [];

  const grants = await RolePermission.find({ role: role._id }).populate('permission');
  const keys = grants.map((g) => g.permission?.key).filter(Boolean);

  try {
    await redisClient.set(cacheKey, JSON.stringify(keys), 'EX', CACHE_TTL_SECONDS);
  } catch (err) {
    logger.warn(`Permission cache write failed (non-fatal): ${err.message}`);
  }

  return keys;
}

export async function invalidateRolePermissionCache(roleSlug) {
  try {
    await redisClient.del(`${CACHE_PREFIX}${roleSlug}`);
  } catch (err) {
    logger.warn(`Permission cache invalidation failed (non-fatal): ${err.message}`);
  }
}

export async function invalidateAllRolePermissionCaches() {
  const roles = await Role.find({}, 'slug');
  await Promise.all(roles.map((r) => invalidateRolePermissionCache(r.slug)));
}

export async function userHasPermission(user, permissionKey) {
  if (!user) return false;
  const keys = await getPermissionsForRole(user.role);
  return keys.includes(permissionKey);
}

export async function userHasAnyPermission(user, permissionKeys) {
  if (!user) return false;
  const keys = await getPermissionsForRole(user.role);
  return permissionKeys.some((k) => keys.includes(k));
}
