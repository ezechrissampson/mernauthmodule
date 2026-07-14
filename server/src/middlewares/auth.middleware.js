import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { COOKIE_NAMES, ACCOUNT_STATUS } from '../constants/index.js';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

/**
 * Verifies the access token (cookie first, then Authorization header for
 * non-browser clients), loads the user, and rejects tokens whose embedded
 * tokenVersion no longer matches the user's current tokenVersion (this is
 * how "logout all devices" / password-change instantly invalidates old
 * access tokens even though JWTs are otherwise stateless).
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required. Please log in.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired', [{ code: 'TOKEN_EXPIRED' }]);
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  // Blacklist check (e.g. token manually revoked before natural expiry)
  const isBlacklisted = await redisClient.get(`bl:${decoded.jti}`);
  if (isBlacklisted) {
    throw ApiError.unauthorized('Session has been revoked. Please log in again.');
  }

  const user = await User.findById(decoded.sub);

  if (!user || user.status === ACCOUNT_STATUS.DELETED) {
    throw ApiError.unauthorized('Account no longer exists.');
  }

  if (user.tokenVersion !== decoded.tokenVersion) {
    throw ApiError.unauthorized('Session expired. Please log in again.');
  }

  req.user = user;
  req.accessTokenPayload = decoded;
  next();
});

/** Restricts an already-`protect`-ed route to specific roles. */
export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden('You do not have permission to perform this action.');
  }
  next();
};

/**
 * Like `protect`, but never throws when no token is present — it just leaves req.user
 * undefined so the route can serve guests. Used for endpoints both guests and logged-in
 * users can hit (e.g. viewing a public post, submitting the public support form), where the
 * response or behavior differs slightly if a user happens to be logged in (e.g. attributing
 * a support ticket to their account). An invalid/expired token IS still rejected outright
 * rather than silently downgraded to guest — a bad token should never look like "no token".
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Access token expired', [{ code: 'TOKEN_EXPIRED' }]);
    throw ApiError.unauthorized('Invalid access token');
  }

  const isBlacklisted = await redisClient.get(`bl:${decoded.jti}`);
  if (isBlacklisted) throw ApiError.unauthorized('Session has been revoked. Please log in again.');

  const user = await User.findById(decoded.sub);
  if (!user || user.status === ACCOUNT_STATUS.DELETED) throw ApiError.unauthorized('Account no longer exists.');
  if (user.tokenVersion !== decoded.tokenVersion) throw ApiError.unauthorized('Session expired. Please log in again.');

  req.user = user;
  req.accessTokenPayload = decoded;
  next();
});
