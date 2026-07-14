import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Stores only the SHA-256 hash of the reset token, never the raw value.
 * `used` enforces single-use; the TTL index guarantees automatic expiry cleanup.
 */
const passwordResetTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    ip: { type: String, default: 'Unknown' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
