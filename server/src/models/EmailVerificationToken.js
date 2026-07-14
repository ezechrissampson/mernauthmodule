import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Handles BOTH verification strategies:
 * - "link" mode: `tokenHash` is set (SHA-256 of a random 32-byte token)
 * - "code" mode: `codeHash` is set (SHA-256 of a 6-digit numeric OTP)
 * Only one of the two is populated depending on EMAIL_VERIFICATION_METHOD.
 * Also reused for the "change email" flow via the `purpose` field, where
 * `newEmail` carries the address being verified.
 */
const emailVerificationTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: ['signup', 'email_change'], default: 'signup' },
    newEmail: { type: String, default: null }, // only for 'email_change'
    tokenHash: { type: String, default: null },
    codeHash: { type: String, default: null },
    attempts: { type: Number, default: 0 }, // failed code attempts, to rate-limit guessing
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);
export default EmailVerificationToken;
