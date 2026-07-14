import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { COOKIE_NAMES } from '../constants/index.js';

/**
 * Signs a short-lived access token. Kept intentionally minimal —
 * only the user id and a token version (for global invalidation) are embedded.
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

/**
 * Signs a refresh token. `jti` (JWT ID) uniquely identifies this token so it
 * can be looked up / revoked individually in the RefreshToken collection.
 */
export function signRefreshToken(payload, rememberMe = false) {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: rememberMe ? env.jwt.refreshExpiresInRemember : env.jwt.refreshExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Shared cookie options builder. `maxAge` is passed per-cookie since
 * access/refresh cookies live for different durations.
 */
function baseCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.secure ? 'none' : 'lax',
    domain: env.cookie.domain,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(res, { accessToken, refreshToken, rememberMe }) {
  const accessMaxAge = 15 * 60 * 1000; // 15 min, mirrors JWT_ACCESS_EXPIRES_IN default
  const refreshMaxAge = (rememberMe ? 90 : 30) * 24 * 60 * 60 * 1000;

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, baseCookieOptions(accessMaxAge));
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, baseCookieOptions(refreshMaxAge));
}

export function clearAuthCookies(res) {
  const opts = baseCookieOptions(0);
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, opts);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, opts);
}
