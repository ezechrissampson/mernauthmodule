import mongoose from 'mongoose';

const { Schema } = mongoose;

const loginHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    success: { type: Boolean, required: true },
    reason: { type: String, default: null }, // e.g. 'invalid_password', 'account_locked'
    ip: { type: String, default: 'Unknown' },
    userAgent: { type: String, default: 'Unknown' },
    location: { type: String, default: null }, // optional GeoIP lookup result
    suspicious: { type: Boolean, default: false },
  },
  { timestamps: true }
);

loginHistorySchema.index({ user: 1, createdAt: -1 });
// auto-purge history older than 180 days to bound collection growth
loginHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;
