import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { authService } from '../services/auth.service.js';
import { auditService } from '../services/audit.service.js';
import { setAuthCookies, clearAuthCookies, verifyAccessToken } from '../utils/tokenUtils.js';
import { redisTokenService } from '../services/redisToken.service.js';
import { getPermissionsForRole } from '../services/permission.service.js';
import { COOKIE_NAMES, AUDIT_EVENTS } from '../constants/index.js';
import { env } from '../config/env.js';

export const signup = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;
  const user = await authService.signup({ fullName, username, email, password });

  await auditService.log(AUDIT_EVENTS.SIGNUP, req, user._id);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: user.toSafeJSON(), verificationMethod: env.emailVerification.method },
        'Account created. Please verify your email to continue.'
      )
    );
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);
  await auditService.log(AUDIT_EVENTS.VERIFICATION_RESENT, req, null, { email: req.body.email });

  // Always return the same generic response regardless of whether the account exists/was already verified
  res.status(200).json(new ApiResponse(200, null, 'If an unverified account exists for that email, a new verification email has been sent.'));
});

export const verifyEmailCode = asyncHandler(async (req, res) => {
  // Client must be authenticated OR pass userId — here we require the pending user's id
  // via a short-lived pre-auth token issued at signup response, simplified here as req.body.userId
  const { userId, code } = req.body;
  if (!userId) throw ApiError.badRequest('userId is required');

  const user = await authService.verifyEmailByCode(userId, code);
  await auditService.log(AUDIT_EVENTS.EMAIL_VERIFIED, req, user._id);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeJSON() }, 'Email verified successfully.'));
});

export const verifyEmailLink = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw ApiError.badRequest('Verification token is required.');

  const user = await authService.verifyEmailByLink(token);
  await auditService.log(AUDIT_EVENTS.EMAIL_VERIFIED, req, user._id);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeJSON() }, 'Email verified successfully.'));
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password, rememberMe } = req.body;

  try {
    const { user, accessToken, refreshToken } = await authService.login({
      identifier,
      password,
      req,
      rememberMe: !!rememberMe,
    });

    const suspicious = await auditService.isSuspiciousLogin(user._id, req.ip);
    await auditService.recordLogin(req, user._id, true, null, suspicious);
    await auditService.log(AUDIT_EVENTS.LOGIN_SUCCESS, req, user._id);
    if (suspicious) await auditService.log(AUDIT_EVENTS.SUSPICIOUS_LOGIN, req, user._id);

    setAuthCookies(res, { accessToken, refreshToken, rememberMe: !!rememberMe });

    res.status(200).json(
      new ApiResponse(
        200,
        { user: user.toSafeJSON(), accessToken, suspiciousLogin: suspicious },
        'Login successful'
      )
    );
  } catch (err) {
    await auditService.log(AUDIT_EVENTS.LOGIN_FAILED, req, null, { identifier });
    throw err;
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  if (!raw) throw ApiError.unauthorized('No refresh token provided.');

  const { user, accessToken, refreshToken: newRefreshToken } = await authService.rotateRefreshToken(raw, req);

  setAuthCookies(res, { accessToken, refreshToken: newRefreshToken, rememberMe: true });
  await auditService.log(AUDIT_EVENTS.TOKEN_REFRESHED, req, user._id);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeJSON(), accessToken }, 'Token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  await authService.revokeRefreshToken(raw);

  // Blacklist current access token until its natural expiry
  const accessTokenRaw = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (accessTokenRaw) {
    try {
      const decoded = verifyAccessToken(accessTokenRaw);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      await redisTokenService.blacklistToken(decoded.jti, ttl);
    } catch {
      /* token already invalid/expired — nothing to blacklist */
    }
  }

  clearAuthCookies(res);
  if (req.user) await auditService.log(AUDIT_EVENTS.LOGOUT, req, req.user._id);

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.revokeAllSessions(req.user._id);
  clearAuthCookies(res);
  await auditService.log(AUDIT_EVENTS.LOGOUT_ALL, req, req.user._id);

  res.status(200).json(new ApiResponse(200, null, 'Logged out from all devices'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email, req);
  await auditService.log(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, req, null, { email: req.body.email });

  res.status(200).json(new ApiResponse(200, null, 'If an account exists for that email, a password reset link has been sent.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await authService.resetPassword(token, password);
  await auditService.log(AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, req, user._id);

  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. Please log in with your new password.'));
});

export const getMe = asyncHandler(async (req, res) => {
  const permissions = await getPermissionsForRole(req.user.role);
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeJSON(), permissions }, 'Current user fetched'));
});
