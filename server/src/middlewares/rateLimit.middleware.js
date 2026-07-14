import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import ApiError from '../utils/ApiError.js';

function buildLimiter({ windowMs, max, prefix, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      prefix: `rl:${prefix}:`,
      sendCommand: (...args) => redisClient.call(...args),
    }),
    handler: (req, res, next) => {
      next(new ApiError(429, message || 'Too many requests, please try again later.'));
    },
  });
}

/** General API-wide throttle */
export const globalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  prefix: 'global',
  message: 'Too many requests from this IP. Please try again later.',
});

/** Tight limiter for login — brute force protection layered on top of account lockout */
export const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: 'login',
  message: 'Too many login attempts. Please try again in a few minutes.',
});

/** Signup abuse protection */
export const signupLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  prefix: 'signup',
  message: 'Too many accounts created from this IP. Please try again later.',
});

/** Forgot password / resend verification — prevents email-bombing a victim */
export const otpLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: 'otp',
  message: 'Too many requests. Please wait before trying again.',
});

/** Token refresh throttle */
export const refreshLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  prefix: 'refresh',
  message: 'Too many token refresh attempts.',
});

/** Public support ticket form — prevents the contact form being used to spam an inbox. */
export const supportTicketLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  prefix: 'support-ticket',
  message: 'Too many messages sent. Please try again later.',
});
