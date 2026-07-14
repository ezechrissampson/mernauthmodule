import { body } from 'express-validator';
import {
  emailField,
  usernameField,
  passwordField,
  confirmPasswordField,
  fullNameField,
} from './common.validators.js';

export const signupValidator = [
  fullNameField('fullName'),
  usernameField('username'),
  emailField('email'),
  passwordField('password'),
  confirmPasswordField('confirmPassword', 'password'),
  body('acceptTerms')
    .isBoolean()
    .withMessage('acceptTerms must be a boolean')
    .custom((value) => value === true)
    .withMessage('You must accept the Terms and Conditions to sign up'),
];

export const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean'),
];

export const verifyEmailCodeValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must be numeric'),
];

export const forgotPasswordValidator = [emailField('email')];

export const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  passwordField('password'),
  confirmPasswordField('confirmPassword', 'password'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordField('newPassword'),
  confirmPasswordField('confirmPassword', 'newPassword'),
  body('newPassword').custom((value, { req }) => {
    if (value === req.body.currentPassword) {
      throw new Error('New password must be different from current password');
    }
    return true;
  }),
];

export const changeEmailValidator = [
  emailField('newEmail'),
  body('password').notEmpty().withMessage('Password confirmation is required'),
];

export const changeUsernameValidator = [usernameField('newUsername')];

export const deleteAccountValidator = [
  body('password').notEmpty().withMessage('Password confirmation is required'),
];

export const resendVerificationValidator = [emailField('email')];
