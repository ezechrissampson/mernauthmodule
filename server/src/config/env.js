/**
 * env.js
 * Validates required environment variables at startup.
 * The process exits immediately if any required variable is missing,
 * preventing the app from booting into an insecure/broken state.
 */
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

export function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === '');

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`[ENV VALIDATION FAILED] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    // eslint-disable-next-line no-console
    console.error('[ENV VALIDATION FAILED] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'true') {
    // eslint-disable-next-line no-console
    console.warn('[ENV WARNING] COOKIE_SECURE is not "true" in production. Cookies will not be marked Secure.');
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  appName: process.env.APP_NAME || 'MERN Auth Module',
  clientUrl: process.env.CLIENT_URL,
  apiVersion: process.env.API_VERSION || 'v1',

  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    refreshExpiresInRemember: process.env.JWT_REFRESH_EXPIRES_IN_REMEMBER || '90d',
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.COOKIE_SECURE === 'true',
  },

  emailVerification: {
    method: (process.env.EMAIL_VERIFICATION_METHOD || 'code').toLowerCase(), // 'code' | 'link'
    expiresMin: parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_MIN, 10) || 15,
    resendCooldownSec: parseInt(process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SEC, 10) || 60,
  },

  passwordReset: {
    expiresMin: parseInt(process.env.PASSWORD_RESET_EXPIRES_MIN, 10) || 30,
  },

  lockout: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    durationMin: parseInt(process.env.LOCKOUT_DURATION_MIN, 10) || 15,
  },

  accountDeletion: {
    graceDays: parseInt(process.env.ACCOUNT_DELETION_GRACE_DAYS, 10) || 30,
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.EMAIL_FROM_NAME || 'MERN Auth Module',
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()),
};
