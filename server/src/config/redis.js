import Redis from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

/**
 * Single shared ioredis client used for:
 * - OTP / email verification code storage (short TTL)
 * - password reset single-use token markers
 * - rate limiting (via rate-limit-redis)
 * - refresh token blacklist / revocation set
 * - login-attempt / lockout counters
 */
export const redisClient = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));

export default redisClient;
