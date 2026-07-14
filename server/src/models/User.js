import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, ACCOUNT_STATUS } from '../constants/index.js';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned by default
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    avatar: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // Cloudinary public_id, needed to delete old image
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
      index: true,
    },

    // ---- Email verification ----
    isEmailVerified: { type: Boolean, default: false },

    // ---- Pending email change (new email must verify before replacing) ----
    pendingEmail: { type: String, default: null, lowercase: true, trim: true },

    // ---- Account lockout / brute force ----
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // ---- Password change tracking ----
    passwordChangedAt: { type: Date, default: null },

    // ---- Token invalidation ----
    // Bumped whenever ALL sessions must be invalidated (password change, logout-all).
    tokenVersion: { type: Number, default: 0 },

    // ---- Soft delete ----
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    deletionRequestedAt: { type: Date, default: null },
    scheduledPurgeAt: { type: Date, default: null },

    // ---- Metadata ----
    lastLoginAt: { type: Date, default: null },
    termsAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, status: 1 });
userSchema.index({ username: 1, status: 1 });

// ---------- Hooks ----------

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
  next();
});

// ---------- Instance methods ----------

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function isLocked() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/**
 * Strips sensitive/internal fields before sending user data to the client.
 */
userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  delete obj.tokenVersion;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
