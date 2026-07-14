import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenUtils.js';
import {
  generateSecureToken,
  hashToken,
  generateNumericOTP,
  timingSafeEqual,
  generateDeviceId,
} from '../utils/crypto.js';
import { emailService } from './email.service.js';
import { redisTokenService } from './redisToken.service.js';
import { ACCOUNT_STATUS } from '../constants/index.js';

const LOCKOUT_WINDOW_SEC = env.lockout.durationMin * 60;

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

async function signup({ fullName, username, email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  }).lean();

  if (existing) {
    if (existing.email === normalizedEmail) throw ApiError.conflict('Email is already registered');
    throw ApiError.conflict('Username is already taken');
  }

  const user = await User.create({
    fullName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    termsAcceptedAt: new Date(),
  });

  await issueEmailVerification(user, 'signup');

  return user;
}

// ---------------------------------------------------------------------------
// Email verification (supports both "code" and "link" strategies)
// ---------------------------------------------------------------------------

async function issueEmailVerification(user, purpose = 'signup', newEmail = null) {
  // Invalidate any previous pending tokens of the same purpose
  await EmailVerificationToken.updateMany(
    { user: user._id, purpose, used: false },
    { $set: { used: true } }
  );

  const expiresAt = new Date(Date.now() + env.emailVerification.expiresMin * 60 * 1000);
  const targetEmail = purpose === 'email_change' ? newEmail : user.email;

  if (env.emailVerification.method === 'code') {
    const code = generateNumericOTP(6);
    await EmailVerificationToken.create({
      user: user._id,
      purpose,
      newEmail,
      codeHash: hashToken(code),
      expiresAt,
    });
    await emailService.sendVerificationCode(targetEmail, user.fullName, code);
  } else {
    const { rawToken, hashedToken } = generateSecureToken();
    await EmailVerificationToken.create({
      user: user._id,
      purpose,
      newEmail,
      tokenHash: hashedToken,
      expiresAt,
    });
    const link = `${env.clientUrl}/verify-email?token=${rawToken}&purpose=${purpose}`;
    await emailService.sendVerificationLink(targetEmail, user.fullName, link);
  }
}

async function resendVerification(email) {
  const user = await User.findOne({ email: email.toLowerCase(), status: ACCOUNT_STATUS.ACTIVE });

  // Do not reveal whether the email exists — always resolve the same way
  if (!user || user.isEmailVerified) return;

  const cooldown = await redisTokenService.isOnCooldown(user._id.toString(), 'email_verification');
  if (cooldown > 0) {
    throw ApiError.tooManyRequests(`Please wait ${cooldown}s before requesting another code.`);
  }

  await issueEmailVerification(user, 'signup');
  await redisTokenService.setCooldown(
    user._id.toString(),
    'email_verification',
    env.emailVerification.resendCooldownSec
  );
}

async function verifyEmailByCode(userId, code) {
  const record = await EmailVerificationToken.findOne({
    user: userId,
    purpose: 'signup',
    used: false,
  }).sort({ createdAt: -1 });

  if (!record) throw ApiError.badRequest('No pending verification found. Please request a new code.');
  if (record.expiresAt < new Date()) throw ApiError.badRequest('Verification code has expired.');

  if (record.attempts >= 5) {
    throw ApiError.tooManyRequests('Too many incorrect attempts. Please request a new code.');
  }

  if (!timingSafeEqual(hashToken(code), record.codeHash)) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Invalid verification code.');
  }

  record.used = true;
  await record.save();

  const user = await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });
  await emailService.sendWelcome(user.email, user.fullName);
  return user;
}

async function verifyEmailByLink(rawToken) {
  const tokenHash = hashToken(rawToken);
  const record = await EmailVerificationToken.findOne({
    tokenHash,
    purpose: 'signup',
    used: false,
  });

  if (!record) throw ApiError.badRequest('Invalid or already used verification link.');
  if (record.expiresAt < new Date()) throw ApiError.badRequest('Verification link has expired.');

  record.used = true;
  await record.save();

  const user = await User.findByIdAndUpdate(record.user, { isEmailVerified: true }, { new: true });
  await emailService.sendWelcome(user.email, user.fullName);
  return user;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

async function login({ identifier, password, req, rememberMe = false }) {
  const normalized = identifier.toLowerCase().trim();
  const user = await User.findOne({
    $or: [{ email: normalized }, { username: normalized }],
    status: { $ne: ACCOUNT_STATUS.DELETED },
  }).select('+password');

  // Generic failure message — never reveal whether identifier exists (user enumeration protection)
  const genericError = () => ApiError.unauthorized('Invalid credentials');

  if (!user) throw genericError();

  if (user.isLocked()) {
    const minsLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.forbidden(`Account temporarily locked due to repeated failed attempts. Try again in ${minsLeft} minute(s).`);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const attempts = await redisTokenService.incrementLoginAttempts(user._id.toString(), LOCKOUT_WINDOW_SEC);
    user.failedLoginAttempts = attempts;

    if (attempts >= env.lockout.maxAttempts) {
      user.lockUntil = new Date(Date.now() + env.lockout.durationMin * 60 * 1000);
    }
    await user.save();
    throw genericError();
  }

  if (user.status === ACCOUNT_STATUS.PENDING_DELETION) {
    // Reactivate account since the user is proving ownership by logging in
    user.status = ACCOUNT_STATUS.ACTIVE;
    user.deletionRequestedAt = null;
    user.scheduledPurgeAt = null;
  }

  // Successful login — reset counters
  await redisTokenService.resetLoginAttempts(user._id.toString());
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const { accessToken, refreshToken, refreshTokenDoc } = await issueTokenPair(user, req, rememberMe);

  return { user, accessToken, refreshToken, refreshTokenDoc };
}

// ---------------------------------------------------------------------------
// Token issuance / rotation / revocation
// ---------------------------------------------------------------------------

async function issueTokenPair(user, req, rememberMe = false) {
  const jti = uuidv4();
  const accessToken = signAccessToken({ sub: user._id.toString(), tokenVersion: user.tokenVersion, jti });

  const refreshJti = uuidv4();
  const refreshToken = signRefreshToken({ sub: user._id.toString(), jti: refreshJti }, rememberMe);

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  const refreshTokenDoc = await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    deviceId: req.cookies?.deviceId || generateDeviceId(),
    userAgent: req.headers['user-agent'] || 'Unknown',
    ip: req.ip,
    rememberMe,
    expiresAt,
  });

  return { accessToken, refreshToken, refreshTokenDoc };
}

/**
 * Rotates a refresh token: verifies it, ensures it hasn't been revoked/reused
 * (reuse of a revoked token is a strong signal of theft -> revoke the whole chain),
 * issues a new pair, and marks the old one as replaced.
 */
async function rotateRefreshToken(rawRefreshToken, req) {
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored) {
    throw ApiError.unauthorized('Refresh token not recognized. Please log in again.');
  }

  if (stored.revoked) {
    // Possible token theft/replay — nuke every session for this user as a precaution
    await RefreshToken.updateMany({ user: stored.user, revoked: false }, { $set: { revoked: true, revokedAt: new Date() } });
    throw ApiError.unauthorized('Session invalid. All sessions have been revoked for your safety, please log in again.');
  }

  if (stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token expired. Please log in again.');
  }

  const user = await User.findById(decoded.sub);
  if (!user || user.status === ACCOUNT_STATUS.DELETED) {
    throw ApiError.unauthorized('Account no longer exists.');
  }

  // Rotate: revoke old, issue new
  stored.revoked = true;
  stored.revokedAt = new Date();

  const { accessToken, refreshToken, refreshTokenDoc } = await issueTokenPair(user, req, stored.rememberMe);
  stored.replacedByTokenHash = refreshTokenDoc.tokenHash;
  await stored.save();

  refreshTokenDoc.deviceId = stored.deviceId; // preserve device identity across rotation
  await refreshTokenDoc.save();

  return { user, accessToken, refreshToken };
}

async function revokeRefreshToken(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.updateOne({ tokenHash }, { $set: { revoked: true, revokedAt: new Date() } });
}

async function revokeAllSessions(userId, exceptTokenHash = null) {
  const filter = { user: userId, revoked: false };
  if (exceptTokenHash) filter.tokenHash = { $ne: exceptTokenHash };
  await RefreshToken.updateMany(filter, { $set: { revoked: true, revokedAt: new Date() } });
  // Bump tokenVersion so all outstanding access tokens are instantly invalidated too
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------

async function forgotPassword(email, req) {
  const user = await User.findOne({ email: email.toLowerCase(), status: ACCOUNT_STATUS.ACTIVE });
  if (!user) return; // do not reveal existence

  const cooldown = await redisTokenService.isOnCooldown(user._id.toString(), 'password_reset');
  if (cooldown > 0) return; // silently ignore rapid repeat requests

  const { rawToken, hashedToken } = generateSecureToken();
  const expiresAt = new Date(Date.now() + env.passwordReset.expiresMin * 60 * 1000);

  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hashedToken,
    ip: req.ip,
    expiresAt,
  });

  await redisTokenService.setCooldown(user._id.toString(), 'password_reset', 60);

  const link = `${env.clientUrl}/reset-password?token=${rawToken}`;
  await emailService.sendPasswordReset(user.email, user.fullName, link);
}

async function resetPassword(rawToken, newPassword) {
  const tokenHash = hashToken(rawToken);
  const record = await PasswordResetToken.findOne({ tokenHash, used: false });

  if (!record) throw ApiError.badRequest('Invalid or already used reset token.');
  if (record.expiresAt < new Date()) throw ApiError.badRequest('Reset token has expired.');

  const user = await User.findById(record.user);
  if (!user) throw ApiError.badRequest('Invalid reset token.');

  user.password = newPassword; // pre-save hook hashes it
  user.tokenVersion += 1; // invalidate all existing sessions
  await user.save();

  record.used = true;
  await record.save();

  await RefreshToken.updateMany({ user: user._id, revoked: false }, { $set: { revoked: true, revokedAt: new Date() } });

  return user;
}

export const authService = {
  signup,
  issueEmailVerification,
  resendVerification,
  verifyEmailByCode,
  verifyEmailByLink,
  login,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllSessions,
  forgotPassword,
  resetPassword,
};
