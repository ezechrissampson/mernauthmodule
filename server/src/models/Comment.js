import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },

    status: {
      type: String,
      enum: ['visible', 'flagged', 'unpublished', 'archived'],
      default: 'visible',
      index: true,
    },

    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, status: 1, isDeleted: 1, createdAt: 1 });

export default mongoose.model('Comment', commentSchema);
