import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';
import cors from 'cors';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const helmetMiddleware = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.isProd
    ? {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
        },
      }
    : false,
});

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (curl, server-to-server) with no origin header
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new ApiError(403, 'Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: () => {}, // silent; avoid logging user input
});

export const hppMiddleware = hpp();

/**
 * Recursively strips XSS payloads from string fields in req.body/query/params.
 * express's `xss-clean` is unmaintained, so we apply the actively-maintained
 * `xss` library manually across all request input.
 */
function deepSanitize(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(deepSanitize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) {
      out[key] = deepSanitize(value[key]);
    }
    return out;
  }
  return value;
}

export function xssSanitizeMiddleware(req, _res, next) {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
}
