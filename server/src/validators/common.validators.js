import { body, param } from 'express-validator';
import { PASSWORD_POLICY, USERNAME_POLICY, RESERVED_USERNAMES } from '../constants/index.js';

export const emailField = (field = 'email') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Email is too long');

export const usernameField = (field = 'username') =>
  body(field)
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: USERNAME_POLICY.MIN_LENGTH, max: USERNAME_POLICY.MAX_LENGTH })
    .withMessage(`Username must be between ${USERNAME_POLICY.MIN_LENGTH} and ${USERNAME_POLICY.MAX_LENGTH} characters`)
    .matches(USERNAME_POLICY.REGEX)
    .withMessage('Username may only contain lowercase letters, numbers, underscores and dots')
    .custom((value) => {
      if (RESERVED_USERNAMES.includes(value)) {
        throw new Error('This username is reserved and cannot be used');
      }
      return true;
    });

export const passwordField = (field = 'password') =>
  body(field)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_POLICY.MIN_LENGTH, max: PASSWORD_POLICY.MAX_LENGTH })
    .withMessage(`Password must be between ${PASSWORD_POLICY.MIN_LENGTH} and ${PASSWORD_POLICY.MAX_LENGTH} characters`)
    .matches(PASSWORD_POLICY.REGEX)
    .withMessage('Password must include an uppercase letter, a lowercase letter, a number, and a special character');

export const confirmPasswordField = (field = 'confirmPassword', target = 'password') =>
  body(field).custom((value, { req }) => {
    if (value !== req.body[target]) {
      throw new Error('Passwords do not match');
    }
    return true;
  });

export const fullNameField = (field = 'fullName') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 80 })
    .withMessage('Full name must be between 2 and 80 characters')
    .matches(/^[\p{L}\s'.-]+$/u)
    .withMessage('Full name contains invalid characters');

export const bioField = (field = 'bio') =>
  body(field).optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters');

export const mongoIdParam = (field = 'id') =>
  param(field).isMongoId().withMessage('Invalid identifier');
