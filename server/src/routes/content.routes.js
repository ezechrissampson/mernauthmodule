import { Router } from 'express';
import * as ctrl from '../controllers/content.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { requirePermission, requireOwnerOrPermission } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createPostValidator,
  updatePostValidator,
  moderatePostValidator,
  moderateCommentValidator,
  createCommentValidator,
} from '../validators/feature.validators.js';
import { loadPostOwnerId } from '../controllers/content.controller.js';

const router = Router();

// ---- Public ----
router.get('/posts', ctrl.listPublishedPosts);
router.get('/posts/:id', optionalAuth, ctrl.getPost);
router.get('/posts/:id/comments', ctrl.listCommentsForPost);

// ---- Authenticated: Author/Editor create; any logged-in user comments ----
router.post('/posts', protect, requirePermission(PERMISSIONS.CONTENT_CREATE), createPostValidator, validate, ctrl.createPost);
router.get('/posts/mine/list', protect, requirePermission(PERMISSIONS.CONTENT_CREATE), ctrl.listMyPosts);
router.get('/posts/all/list', protect, requirePermission(PERMISSIONS.CONTENT_EDIT_ANY), ctrl.listAllPostsForEditing);

router.patch(
  '/posts/:id',
  protect,
  updatePostValidator,
  validate,
  requireOwnerOrPermission(PERMISSIONS.CONTENT_EDIT_ANY, loadPostOwnerId),
  ctrl.updatePost
);
router.delete('/posts/:id', protect, requireOwnerOrPermission(PERMISSIONS.CONTENT_EDIT_ANY, loadPostOwnerId), ctrl.deletePost);

router.post('/posts/:id/comments', protect, createCommentValidator, validate, ctrl.createComment);

// ---- Moderator (+ Admin/Super Admin) ----
router.get('/moderation/posts', protect, requirePermission(PERMISSIONS.CONTENT_MODERATE), ctrl.listAllPostsForModeration);
router.post('/moderation/posts/:id', protect, requirePermission(PERMISSIONS.CONTENT_MODERATE), moderatePostValidator, validate, ctrl.moderatePost);
router.delete('/moderation/posts/:id', protect, requirePermission(PERMISSIONS.CONTENT_MODERATE), ctrl.moderateDeletePost);

router.get('/moderation/comments', protect, requirePermission(PERMISSIONS.CONTENT_MODERATE), ctrl.listCommentsForModeration);
router.post(
  '/moderation/comments/:commentId',
  protect,
  requirePermission(PERMISSIONS.CONTENT_MODERATE),
  moderateCommentValidator,
  validate,
  ctrl.moderateComment
);
router.delete('/moderation/comments/:commentId', protect, requirePermission(PERMISSIONS.CONTENT_MODERATE), ctrl.moderateDeleteComment);

export default router;
