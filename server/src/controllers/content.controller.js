import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import PageView from '../models/PageView.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { auditService } from '../services/audit.service.js';
import { userHasPermission } from '../services/permission.service.js';
import { AUDIT_EVENTS } from '../constants/index.js';
import { PERMISSIONS } from '../constants/permissions.js';

/** Public: list published posts only (guests + everyone see this). */
export const listPublishedPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

  const query = { status: 'published', isDeleted: false };
  const [posts, total] = await Promise.all([
    Post.find(query).populate('author', 'username fullName avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(query),
  ]);

  res.status(200).json(new ApiResponse(200, { posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
});

/** Public: view a single published post, records a page view for analytics. */
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate('author', 'username fullName avatar');
  if (!post) throw ApiError.notFound('Post not found');

  if (post.status !== 'published') {
    // A non-published post (unpublished/archived/rejected/flagged) is only visible to its
    // own author, or to a role that can edit-any/moderate content. Any OTHER logged-in
    // user is treated exactly like a guest here — being authenticated is not by itself
    // a reason to see content that isn't public.
    const isOwner = req.user && String(post.author._id) === String(req.user._id);
    const isPrivileged = req.user && (await Promise.all([userHasPermission(req.user, PERMISSIONS.CONTENT_EDIT_ANY), userHasPermission(req.user, PERMISSIONS.CONTENT_MODERATE)])).some(Boolean);
    if (!isOwner && !isPrivileged) throw ApiError.notFound('Post not found');
  }

  await PageView.create({ post: post._id });
  Post.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).exec();

  res.status(200).json(new ApiResponse(200, { post }));
});

/** Authenticated: Author/Editor creates a post. Published immediately (no draft workflow — kept simple). */
export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({ title: req.body.title, body: req.body.body, author: req.user._id, status: 'published' });
  await auditService.log(AUDIT_EVENTS.POST_CREATED, req, req.user._id, { postId: post._id });
  res.status(201).json(new ApiResponse(201, { post }, 'Post published'));
});

/** Authenticated: Author (own post only, enforced by requireOwnerOrPermission) or Editor (any post). */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) throw ApiError.notFound('Post not found');

  if (req.body.title !== undefined) post.title = req.body.title;
  if (req.body.body !== undefined) post.body = req.body.body;
  await post.save();

  await auditService.log(AUDIT_EVENTS.POST_UPDATED, req, req.user._id, { postId: post._id });
  res.status(200).json(new ApiResponse(200, { post }, 'Post updated'));
});

/** Author deletes their own post; Editor can delete any (same ownership middleware as update). */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) throw ApiError.notFound('Post not found');
  post.isDeleted = true;
  await post.save();
  res.status(200).json(new ApiResponse(200, null, 'Post deleted'));
});

/** Used by ownership middleware to resolve the resource owner without duplicating the query. */
export async function loadPostOwnerId(req) {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).select('author');
  if (!post) throw ApiError.notFound('Post not found');
  return post.author;
}

/** Moderator (or Admin/Super Admin): list ALL posts regardless of status, for the moderation queue. */
export const listAllPostsForModeration = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const query = { isDeleted: false };
  if (req.query.status) query.status = req.query.status;

  const [posts, total] = await Promise.all([
    Post.find(query).populate('author', 'username fullName').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(query),
  ]);
  res.status(200).json(new ApiResponse(200, { posts, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
});

const MODERATION_ACTIONS = {
  unpublish: 'unpublished',
  archive: 'archived',
  reject: 'rejected',
  flag: 'flagged',
  restore: 'published',
};

/** Moderator: reject / unpublish / archive / flag / restore a post. */
export const moderatePost = asyncHandler(async (req, res) => {
  const { action, note = '' } = req.body;
  const newStatus = MODERATION_ACTIONS[action];
  if (!newStatus) throw ApiError.badRequest('Invalid moderation action');

  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) throw ApiError.notFound('Post not found');

  post.status = newStatus;
  post.moderationNote = note;
  post.moderatedBy = req.user._id;
  post.moderatedAt = new Date();
  await post.save();

  await auditService.log(AUDIT_EVENTS.POST_MODERATED, req, req.user._id, { postId: post._id, action, newStatus });
  res.status(200).json(new ApiResponse(200, { post }, `Post ${newStatus}`));
});

/** Moderator: hard-delete a post (distinct from the soft "archive"/"reject" moderation actions). */
export const moderateDeletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
  if (!post) throw ApiError.notFound('Post not found');
  post.isDeleted = true;
  await post.save();
  await auditService.log(AUDIT_EVENTS.POST_MODERATED, req, req.user._id, { postId: post._id, action: 'delete' });
  res.status(200).json(new ApiResponse(200, null, 'Post deleted'));
});

/** "My content" list for Author/Editor's own dashboard tab. */
export const listMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { posts }));
});

/** Editor (content.editAny): list every post for editing — distinct from the Moderator's
 * moderation queue (which requires content.moderate and exposes moderation actions). */
export const listAllPostsForEditing = asyncHandler(async (req, res) => {
  const posts = await Post.find({ isDeleted: false }).populate('author', 'username fullName').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { posts }));
});

// ---------------- Comments ----------------

export const listCommentsForPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id, status: 'visible', isDeleted: false })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: 1 });
  res.status(200).json(new ApiResponse(200, { comments }));
});

/** Any authenticated user (registered) can comment — guests cannot, per spec. */
export const createComment = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false, status: 'published' });
  if (!post) throw ApiError.notFound('Post not found');

  const comment = await Comment.create({ post: post._id, author: req.user._id, body: req.body.body });
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  await auditService.log(AUDIT_EVENTS.COMMENT_CREATED, req, req.user._id, { postId: post._id, commentId: comment._id });

  await comment.populate('author', 'username fullName avatar');
  res.status(201).json(new ApiResponse(201, { comment }, 'Comment posted'));
});

const COMMENT_MODERATION_ACTIONS = {
  flag: 'flagged',
  unpublish: 'unpublished',
  archive: 'archived',
  restore: 'visible',
};

/** Moderator: flag / unpublish / archive / restore a comment. */
export const moderateComment = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const newStatus = COMMENT_MODERATION_ACTIONS[action];
  if (!newStatus) throw ApiError.badRequest('Invalid moderation action');

  const comment = await Comment.findOne({ _id: req.params.commentId, isDeleted: false });
  if (!comment) throw ApiError.notFound('Comment not found');

  comment.status = newStatus;
  comment.moderatedBy = req.user._id;
  comment.moderatedAt = new Date();
  await comment.save();

  await auditService.log(AUDIT_EVENTS.COMMENT_MODERATED, req, req.user._id, { commentId: comment._id, action });
  res.status(200).json(new ApiResponse(200, { comment }, `Comment ${newStatus}`));
});

/** Moderator: hard-delete a comment. */
export const moderateDeleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId, isDeleted: false });
  if (!comment) throw ApiError.notFound('Comment not found');
  comment.isDeleted = true;
  await comment.save();
  res.status(200).json(new ApiResponse(200, null, 'Comment deleted'));
});

/** Moderator queue: all non-visible / flagged comments across all posts. */
export const listCommentsForModeration = asyncHandler(async (req, res) => {
  const query = { isDeleted: false };
  if (req.query.status) query.status = req.query.status;
  const comments = await Comment.find(query).populate('author', 'username fullName').populate('post', 'title').sort({ createdAt: -1 }).limit(200);
  res.status(200).json(new ApiResponse(200, { comments }));
});
