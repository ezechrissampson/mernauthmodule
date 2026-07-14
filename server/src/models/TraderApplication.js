import mongoose from 'mongoose';

const { Schema } = mongoose;

const traderApplicationSchema = new Schema(
  {
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },

    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// One open application at a time per user.
traderApplicationSchema.index({ applicant: 1, status: 1 });

export default mongoose.model('TraderApplication', traderApplicationSchema);
