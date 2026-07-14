import crypto from 'crypto';

/**
 * Generates a cryptographically secure random token (for password reset /
 * email verification links). Returns both the raw token (sent to the user,
 * never stored) and its SHA-256 hash (stored in the DB for lookup).
 */
export function generateSecureToken(bytes = 32) {
  const rawToken = crypto.randomBytes(bytes).toString('hex');
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a numeric OTP code (for email verification "code" mode).
 * Uses crypto.randomInt for unbiased, cryptographically secure randomness.
 */
export function generateNumericOTP(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Constant-time string comparison to prevent timing attacks when
 * comparing tokens/codes supplied by the client against stored values.
 */
export function timingSafeEqual(a = '', b = '') {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal-length buffers to avoid leaking length via timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function generateDeviceId() {
  return crypto.randomBytes(16).toString('hex');
}
