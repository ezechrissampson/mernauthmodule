import mongoose from 'mongoose';

const { Schema } = mongoose;

const supportTicketSchema = new Schema(
  {
    // Nullable: a guest (unauthenticated visitor) can submit a ticket too — they supply
    // name/email directly since there's no account to attach it to.
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },

    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open', index: true },

    handledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, trim: true, maxlength: 1000, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

supportTicketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('SupportTicket', supportTicketSchema);
