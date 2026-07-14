import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_EVENTS, USER_ROLES, ACCOUNT_STATUS } from '../constants/index.js';
import { SUPER_ADMIN_ONLY_ASSIGNABLE_ROLES } from '../constants/permissions.js';

/**
 * Deliberately simple: one table, one action (assign role). No edit/suspend/ban/impersonate —
 * that's out of scope per spec ("no complex user management system").
 */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ status: { $ne: ACCOUNT_STATUS.DELETED } })
    .select('fullName username email role avatar isEmailVerified createdAt lastLoginAt')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { users }));
});

export const assignRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!Object.values(USER_ROLES).includes(role)) throw ApiError.badRequest('Invalid role');

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) throw ApiError.notFound('User not found');

  const actingRole = req.user.role;
  const isSuperAdminOnlyRoleInvolved =
    SUPER_ADMIN_ONLY_ASSIGNABLE_ROLES.includes(role) || SUPER_ADMIN_ONLY_ASSIGNABLE_ROLES.includes(targetUser.role);

  // Only a Super Admin may grant the super_admin role, demote a super_admin, or otherwise
  // touch a super_admin's role — this is enforced here, not just hidden in the UI, so an
  // Admin can never self-escalate or tamper with the root account via a direct API call.
  if (isSuperAdminOnlyRoleInvolved && actingRole !== USER_ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Only a Super Admin can assign or change the Super Admin role.');
  }

  if (String(targetUser._id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot change your own role.');
  }

  const previousRole = targetUser.role;
  targetUser.role = role;
  await targetUser.save();

  await auditService.log(AUDIT_EVENTS.ROLE_ASSIGNED, req, req.user._id, {
    targetUserId: targetUser._id,
    previousRole,
    newRole: role,
  });

  res.status(200).json(new ApiResponse(200, { user: targetUser.toSafeJSON() }, `Role updated to ${role}`));
});
