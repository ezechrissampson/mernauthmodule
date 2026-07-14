import streamifier from 'streamifier';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import ApiError from '../utils/ApiError.js';
import { RESERVED_USERNAMES, ACCOUNT_STATUS } from '../constants/index.js';
import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { emailService } from './email.service.js';
import { authService } from './auth.service.js';
import { hashToken, timingSafeEqual } from '../utils/crypto.js';

async function changePassword(user, currentPassword, newPassword, req) {
  const fullUser = await User.findById(user._id).select('+password');
  const isMatch = await fullUser.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect.');

  fullUser.password = newPassword;
  fullUser.tokenVersion += 1; // invalidate every other session
  await fullUser.save();

  await RefreshToken.updateMany({ user: fullUser._id, revoked: false }, { $set: { revoked: true, revokedAt: new Date() } });

  await emailService.sendPasswordChanged(
    fullUser.email,
    fullUser.fullName,
    req.ip,
    req.headers['user-agent'] || 'Unknown'
  );

  return fullUser;
}

async function requestEmailChange(user, newEmail, password) {
  const fullUser = await User.findById(user._id).select('+password');
  const isMatch = await fullUser.comparePassword(password);
  if (!isMatch) throw ApiError.badRequest('Password is incorrect.');

  const normalized = newEmail.toLowerCase().trim();
  if (normalized === fullUser.email) throw ApiError.badRequest('This is already your current email.');

  const taken = await User.findOne({ email: normalized });
  if (taken) throw ApiError.conflict('This email is already in use.');

  fullUser.pendingEmail = normalized;
  await fullUser.save();

  await authService.issueEmailVerification(fullUser, 'email_change', normalized);
  return fullUser;
}

/** Completes an email change once the token/code record has been validated. */
async function finalizeEmailChange(record) {
  const user = await User.findById(record.user);
  const oldEmail = user.email;
  user.email = record.newEmail;
  user.pendingEmail = null;
  user.isEmailVerified = true;
  await user.save();

  record.used = true;
  await record.save();

  await emailService.sendEmailChangedNotification(oldEmail, user.fullName, oldEmail, user.email);
  await emailService.sendEmailChangedNotification(user.email, user.fullName, oldEmail, user.email);

  return user;
}

async function confirmEmailChangeByCode(userId, code) {
  const record = await EmailVerificationToken.findOne({
    user: userId,
    purpose: 'email_change',
    used: false,
  }).sort({ createdAt: -1 });

  if (!record) throw ApiError.badRequest('No pending email change found.');
  if (record.expiresAt < new Date()) throw ApiError.badRequest('Verification code has expired.');
  if (!timingSafeEqual(hashToken(code), record.codeHash)) {
    throw ApiError.badRequest('Invalid verification code.');
  }

  return finalizeEmailChange(record);
}

async function confirmEmailChangeByLink(rawToken) {
  const record = await EmailVerificationToken.findOne({
    tokenHash: hashToken(rawToken),
    purpose: 'email_change',
    used: false,
  });

  if (!record) throw ApiError.badRequest('Invalid or already used link.');
  if (record.expiresAt < new Date()) throw ApiError.badRequest('Link has expired.');

  return finalizeEmailChange(record);
}

async function changeUsername(user, newUsername) {
  const normalized = newUsername.toLowerCase().trim();

  if (RESERVED_USERNAMES.includes(normalized)) {
    throw ApiError.badRequest('This username is reserved.');
  }

  if (normalized === user.username) {
    throw ApiError.badRequest('This is already your current username.');
  }

  const taken = await User.findOne({ username: normalized });
  if (taken) throw ApiError.conflict('This username is already taken.');

  const updated = await User.findByIdAndUpdate(user._id, { username: normalized }, { new: true });
  return updated;
}

async function checkUsernameAvailability(username) {
  const normalized = username.toLowerCase().trim();
  if (RESERVED_USERNAMES.includes(normalized)) return false;
  const existing = await User.findOne({ username: normalized }).lean();
  return !existing;
}

async function updateProfile(user, { fullName, bio }) {
  const update = {};
  if (fullName !== undefined) update.fullName = fullName;
  if (bio !== undefined) update.bio = bio;

  const updated = await User.findByIdAndUpdate(user._id, update, { new: true, runValidators: true });
  return updated;
}

/**
 * Uploads a new avatar to Cloudinary and deletes the previous one (if any).
 * File validation (mime type, size) happens in the multer middleware before
 * this function is ever called.
 */
async function updateAvatar(user, fileBuffer) {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mern-auth/avatars',
        public_id: `user_${user._id}`,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good' }],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

  const previousPublicId = user.avatar?.publicId;

  const updated = await User.findByIdAndUpdate(
    user._id,
    { avatar: { url: uploadResult.secure_url, publicId: uploadResult.public_id } },
    { new: true }
  );

  if (previousPublicId && previousPublicId !== uploadResult.public_id) {
    await cloudinary.uploader.destroy(previousPublicId).catch(() => {});
  }

  return updated;
}

async function removeAvatar(user) {
  if (user.avatar?.publicId) {
    await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
  }
  return User.findByIdAndUpdate(user._id, { avatar: { url: null, publicId: null } }, { new: true });
}

/** Soft delete with a configurable grace period before permanent purge. */
async function requestAccountDeletion(user, password) {
  const fullUser = await User.findById(user._id).select('+password');
  const isMatch = await fullUser.comparePassword(password);
  if (!isMatch) throw ApiError.badRequest('Password is incorrect.');

  const purgeDate = new Date(Date.now() + env.accountDeletion.graceDays * 24 * 60 * 60 * 1000);

  fullUser.status = ACCOUNT_STATUS.PENDING_DELETION;
  fullUser.deletionRequestedAt = new Date();
  fullUser.scheduledPurgeAt = purgeDate;
  fullUser.tokenVersion += 1;
  await fullUser.save();

  await RefreshToken.updateMany({ user: fullUser._id, revoked: false }, { $set: { revoked: true, revokedAt: new Date() } });

  await emailService.sendAccountDeletionScheduled(fullUser.email, fullUser.fullName, env.accountDeletion.graceDays, purgeDate);

  return fullUser;
}

export const userService = {
  changePassword,
  requestEmailChange,
  confirmEmailChangeByCode,
  confirmEmailChangeByLink,
  changeUsername,
  checkUsernameAvailability,
  updateProfile,
  updateAvatar,
  removeAvatar,
  requestAccountDeletion,
};
