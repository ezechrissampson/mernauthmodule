import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * One row per post view. Deliberately minimal (no session/device/geo tracking — this is a
 * read-only analytics *tab*, not an analytics platform). Aggregated by day in
 * analytics.service.js for the 7d/1m/3m/9m range views.
 */
const pageViewSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    viewedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

pageViewSchema.index({ viewedAt: 1 });

export default mongoose.model('PageView', pageViewSchema);
