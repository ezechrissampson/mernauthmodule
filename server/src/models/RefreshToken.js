import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * One document per issued refresh token = one "device session".
 * Storing the hashed token (never the raw JWT) lets us revoke individual
 * sessions and list "active sessions" per user without decoding JWTs.
 */
const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    userAgent: { type: String, default: 'Unknown' },
    ip: { type: String, default: 'Unknown' },
    rememberMe: { type: Boolean, default: false },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null }, // rotation trail
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL index — MongoDB automatically deletes the document once expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
