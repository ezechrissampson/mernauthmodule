import PageView from '../models/PageView.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const RANGE_DAYS = { '7d': 7, '1m': 30, '3m': 90, '9m': 270 };

/** Analyst (+ Admin/Super Admin): page views over time, bucketed by day, filterable by range. */
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const range = RANGE_DAYS[req.query.range] ? req.query.range : '7d';
  const days = RANGE_DAYS[range];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [dailyViews, totalViews, totalPosts, totalComments, topPosts] = await Promise.all([
    PageView.aggregate([
      { $match: { viewedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    PageView.countDocuments({ viewedAt: { $gte: since } }),
    Post.countDocuments({ isDeleted: false, createdAt: { $gte: since } }),
    Comment.countDocuments({ isDeleted: false, createdAt: { $gte: since } }),
    Post.find({ isDeleted: false }).sort({ viewCount: -1 }).limit(5).select('title viewCount commentCount'),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      range,
      totalViews,
      totalPosts,
      totalComments,
      dailyViews: dailyViews.map((d) => ({ date: d._id, views: d.count })),
      topPosts,
    })
  );
});
