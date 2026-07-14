import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { userHasPermission, userHasAnyPermission } from '../services/permission.service.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_EVENTS } from '../constants/index.js';

/**
 * Every check here assumes `protect` (middlewares/auth.middleware.js) already ran and set
 * req.user to a real, loaded User document. Authorization is always computed server-side
 * from the role's DB-backed permission grants — never from anything the client sends.
 * Denials are audit-logged so repeated probing is visible in the audit log.
 */
export const requirePermission = (permissionKey) =>
  asyncHandler(async (req, _res, next) => {
    const allowed = await userHasPermission(req.user, permissionKey);
    if (!allowed) {
      await auditService.log(AUDIT_EVENTS.ACCESS_DENIED, req, req.user?._id, { permission: permissionKey, route: req.originalUrl });
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  });

export const requireAnyPermission = (permissionKeys) =>
  asyncHandler(async (req, _res, next) => {
    const allowed = await userHasAnyPermission(req.user, permissionKeys);
    if (!allowed) {
      await auditService.log(AUDIT_EVENTS.ACCESS_DENIED, req, req.user?._id, { anyOf: permissionKeys, route: req.originalUrl });
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  });

/** Restricts to specific role slugs directly (used sparingly — prefer requirePermission). */
export const requireRole = (...roleSlugs) =>
  asyncHandler(async (req, _res, next) => {
    if (!roleSlugs.includes(req.user.role)) {
      await auditService.log(AUDIT_EVENTS.ACCESS_DENIED, req, req.user?._id, { requiredRole: roleSlugs, actualRole: req.user.role, route: req.originalUrl });
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  });

/**
 * Allows the request through if the acting user OWNS the resource (loadOwnerId returns the
 * resource's owner id) OR holds the given override permission (e.g. Editor's content.editAny
 * bypassing Author's own-content-only restriction). This is how "Author can only edit their
 * own post, Editor can edit anyone's" is enforced — a real ownership check, not just a hidden
 * button on the frontend.
 */
export const requireOwnerOrPermission = (overridePermissionKey, loadOwnerId) =>
  asyncHandler(async (req, _res, next) => {
    const ownerId = await loadOwnerId(req);
    if (ownerId && String(ownerId) === String(req.user._id)) return next();

    const allowed = await userHasPermission(req.user, overridePermissionKey);
    if (!allowed) {
      await auditService.log(AUDIT_EVENTS.ACCESS_DENIED, req, req.user?._id, { overridePermission: overridePermissionKey, route: req.originalUrl });
      throw ApiError.forbidden('You can only modify your own content.');
    }
    next();
  });
