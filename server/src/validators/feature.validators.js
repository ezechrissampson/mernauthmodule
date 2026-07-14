import { body, param } from 'express-validator';
import { emailField } from './common.validators.js';
import { USER_ROLES } from '../constants/index.js';

export const createPostValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('body').trim().notEmpty().withMessage('Post content is required').isLength({ max: 20000 }),
];

export const updatePostValidator = [
  param('id').isMongoId(),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('body').optional().trim().isLength({ min: 1, max: 20000 }),
];

export const moderatePostValidator = [
  param('id').isMongoId(),
  body('action').isIn(['unpublish', 'archive', 'reject', 'flag', 'restore']).withMessage('Invalid moderation action'),
  body('note').optional().trim().isLength({ max: 500 }),
];

export const moderateCommentValidator = [
  param('commentId').isMongoId(),
  body('action').isIn(['flag', 'unpublish', 'archive', 'restore']).withMessage('Invalid moderation action'),
];

export const createCommentValidator = [param('id').isMongoId(), body('body').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 2000 })];

export const traderApplicationValidator = [body('message').trim().notEmpty().withMessage('Please describe your trading experience').isLength({ max: 1000 })];

export const reviewTraderApplicationValidator = [
  param('id').isMongoId(),
  body('decision').isIn(['approved', 'rejected']).withMessage('Decision must be approved or rejected'),
  body('note').optional().trim().isLength({ max: 500 }),
];

export const supportTicketValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  emailField('email'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 150 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 3000 }),
];

export const updateSupportTicketValidator = [
  param('id').isMongoId(),
  body('status').optional().isIn(['open', 'in_progress', 'resolved']),
  body('resolutionNote').optional().trim().isLength({ max: 1000 }),
];

export const assignRoleValidator = [
  param('id').isMongoId(),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role'),
];
