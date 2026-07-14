import redisClient from '../config/redis.js';

const ns = {
  loginAttempts: (userId) => `login:attempts:${userId}`,
  resendCooldown: (userId, purpose) => `resend:cooldown:${purpose}:${userId}`,
  blacklist: (jti) => `bl:${jti}`,
};

export const redisTokenService = {
  /** Increments failed login attempts, returns new count. Expires after lockout window. */
  async incrementLoginAttempts(userId, windowSec) {
    const key = ns.loginAttempts(userId);
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, windowSec);
    return count;
  },

  async resetLoginAttempts(userId) {
    await redisClient.del(ns.loginAttempts(userId));
  },

  /** Cooldown guard for resend-verification / resend-otp endpoints. */
  async isOnCooldown(userId, purpose) {
    const ttl = await redisClient.ttl(ns.resendCooldown(userId, purpose));
    return ttl > 0 ? ttl : 0;
  },

  async setCooldown(userId, purpose, seconds) {
    await redisClient.set(ns.resendCooldown(userId, purpose), '1', 'EX', seconds);
  },

  /** Blacklists an access token's jti until its natural expiry. */
  async blacklistToken(jti, ttlSeconds) {
    if (ttlSeconds > 0) {
      await redisClient.set(ns.blacklist(jti), '1', 'EX', ttlSeconds);
    }
  },
};
