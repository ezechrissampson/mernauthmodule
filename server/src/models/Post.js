import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Deliberately simple: title + body text only, no rich page-builder. Author/Editor both use
 * the same "textarea + post button" flow described in the spec — the only difference is
 * enforced in the route layer (requireOwnerOrPermission), not in this schema.
 */
const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 20000 },

    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: {
      type: String,
      enum: ['published', 'unpublished', 'archived', 'rejected', 'flagged'],
      default: 'published',
      index: true,
    },

    // Set by a moderator when rejecting/flagging, shown to the author.
    moderationNote: { type: String, trim: true, maxlength: 500, default: '' },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt: { type: Date, default: null },

    viewCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);
