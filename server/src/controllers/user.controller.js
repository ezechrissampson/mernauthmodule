import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_EVENTS } from '../constants/index.js';
import RefreshToken from '../models/RefreshToken.js';
import LoginHistory from '../models/LoginHistory.js';
import { hashToken } from '../utils/crypto.js';
import { COOKIE_NAMES } from '../constants/index.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, bio } = req.body;
  const updated = await userService.updateProfile(req.user, { fullName, bio });
  await auditService.log(AUDIT_EVENTS.PROFILE_UPDATED, req, req.user._id);

  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Profile updated'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image file provided.');

  const updated = await userService.updateAvatar(req.user, req.file.buffer);
  await auditService.log(AUDIT_EVENTS.PROFILE_UPDATED, req, req.user._id, { action: 'avatar_upload' });

  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Profile picture updated'));
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const updated = await userService.removeAvatar(req.user);
  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Profile picture removed'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user, currentPassword, newPassword, req);
  await auditService.log(AUDIT_EVENTS.PASSWORD_CHANGED, req, req.user._id);

  res.status(200).json(new ApiResponse(200, null, 'Password changed. Please log in again on other devices.'));
});

export const requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail, password } = req.body;
  await userService.requestEmailChange(req.user, newEmail, password);
  await auditService.log(AUDIT_EVENTS.EMAIL_CHANGE_REQUESTED, req, req.user._id, { newEmail });

  res.status(200).json(new ApiResponse(200, null, 'Verification email sent to your new address. Confirm to complete the change.'));
});

export const confirmEmailChangeCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const updated = await userService.confirmEmailChangeByCode(req.user._id, code);
  await auditService.log(AUDIT_EVENTS.EMAIL_CHANGED, req, req.user._id);

  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Email address updated'));
});

export const confirmEmailChangeLink = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const updated = await userService.confirmEmailChangeByLink(token);
  await auditService.log(AUDIT_EVENTS.EMAIL_CHANGED, req, updated._id);

  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Email address updated'));
});

export const changeUsername = asyncHandler(async (req, res) => {
  const { newUsername } = req.body;
  const updated = await userService.changeUsername(req.user, newUsername);
  await auditService.log(AUDIT_EVENTS.USERNAME_CHANGED, req, req.user._id);

  res.status(200).json(new ApiResponse(200, { user: updated.toSafeJSON() }, 'Username updated'));
});

export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const available = await userService.checkUsernameAvailability(username);
  res.status(200).json(new ApiResponse(200, { available }, available ? 'Username is available' : 'Username is taken'));
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  await userService.requestAccountDeletion(req.user, password);
  await auditService.log(AUDIT_EVENTS.ACCOUNT_DELETION_REQUESTED, req, req.user._id);

  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);

  res.status(200).json(new ApiResponse(200, null, 'Account scheduled for deletion. Log back in within the grace period to cancel.'));
});

/** Security settings overview: password status, verification, sessions, recent logins */
export const getSecurityOverview = asyncHandler(async (req, res) => {
  const [sessions, recentLogins] = await Promise.all([
    RefreshToken.find({ user: req.user._id, revoked: false }).sort({ lastUsedAt: -1 }).lean(),
    LoginHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const currentTokenHash = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN]
    ? hashToken(req.cookies[COOKIE_NAMES.REFRESH_TOKEN])
    : null;

  res.status(200).json(
    new ApiResponse(200, {
      isEmailVerified: req.user.isEmailVerified,
      passwordChangedAt: req.user.passwordChangedAt,
      activeSessions: sessions.map((s) => ({
        id: s._id,
        deviceId: s.deviceId,
        userAgent: s.userAgent,
        ip: s.ip,
        rememberMe: s.rememberMe,
        lastUsedAt: s.lastUsedAt,
        createdAt: s.createdAt,
        isCurrent: s.tokenHash === currentTokenHash,
      })),
      recentLogins,
    }, 'Security overview fetched')
  );
});

export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await RefreshToken.findOne({ _id: sessionId, user: req.user._id });
  if (!session) throw ApiError.notFound('Session not found');

  session.revoked = true;
  session.revokedAt = new Date();
  await session.save();

  res.status(200).json(new ApiResponse(200, null, 'Session revoked'));
});

export const revokeAllSessions = asyncHandler(async (req, res) => {
  const currentTokenHash = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN]
    ? hashToken(req.cookies[COOKIE_NAMES.REFRESH_TOKEN])
    : null;

  await authService.revokeAllSessions(req.user._id, currentTokenHash);
  res.status(200).json(new ApiResponse(200, null, 'All other sessions have been logged out'));
});
