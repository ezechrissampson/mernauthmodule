import mongoose from 'mongoose';
import { AUDIT_EVENTS } from '../constants/index.js';

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    event: { type: String, enum: Object.values(AUDIT_EVENTS), required: true },
    ip: { type: String, default: 'Unknown' },
    userAgent: { type: String, default: 'Unknown' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ event: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
