import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { loginLimiter, signupLimiter, otpLimiter, refreshLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  signupValidator,
  loginValidator,
  verifyEmailCodeValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resendVerificationValidator,
} from '../validators/auth.validators.js';

const router = Router();

router.post('/signup', signupLimiter, signupValidator, validate, authController.signup);
router.post('/login', loginLimiter, loginValidator, validate, authController.login);
router.post('/refresh-token', refreshLimiter, authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

router.post('/verify-email/code', verifyEmailCodeValidator, validate, authController.verifyEmailCode);
router.get('/verify-email/link', authController.verifyEmailLink);
router.post('/resend-verification', otpLimiter, resendVerificationValidator, validate, authController.resendVerification);

router.post('/forgot-password', otpLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);

router.get('/me', protect, authController.getMe);

export default router;
