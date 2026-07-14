import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { handleAvatarUpload } from '../middlewares/upload.middleware.js';
import { otpLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  changePasswordValidator,
  changeEmailValidator,
  changeUsernameValidator,
  deleteAccountValidator,
  verifyEmailCodeValidator,
} from '../validators/auth.validators.js';
import { bioField, fullNameField } from '../validators/common.validators.js';
import { param } from 'express-validator';
import { USERNAME_POLICY } from '../constants/index.js';

const router = Router();

router.use(protect); // every route below requires authentication

router.patch('/profile', [fullNameField('fullName').optional(), bioField('bio')], validate, userController.updateProfile);
router.post('/profile/avatar', handleAvatarUpload, userController.uploadAvatar);
router.delete('/profile/avatar', userController.removeAvatar);

router.post('/change-password', changePasswordValidator, validate, userController.changePassword);

router.post('/change-email', otpLimiter, changeEmailValidator, validate, userController.requestEmailChange);
router.post('/change-email/confirm/code', verifyEmailCodeValidator, validate, userController.confirmEmailChangeCode);
router.get('/change-email/confirm/link', userController.confirmEmailChangeLink);

router.post('/change-username', changeUsernameValidator, validate, userController.changeUsername);
router.get(
  '/username-available/:username',
  param('username')
    .trim()
    .toLowerCase()
    .isLength({ min: USERNAME_POLICY.MIN_LENGTH, max: USERNAME_POLICY.MAX_LENGTH })
    .withMessage(`Username must be between ${USERNAME_POLICY.MIN_LENGTH} and ${USERNAME_POLICY.MAX_LENGTH} characters`)
    .matches(USERNAME_POLICY.REGEX)
    .withMessage('Username may only contain lowercase letters, numbers, underscores and dots'),
  validate,
  userController.checkUsernameAvailability
);

router.delete('/account', deleteAccountValidator, validate, userController.deleteAccount);

router.get('/security', userController.getSecurityOverview);
router.delete('/sessions/:sessionId', userController.revokeSession);
router.post('/sessions/revoke-all', userController.revokeAllSessions);

export default router;
