import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import logger from './utils/logger.js';
import {
  helmetMiddleware,
  corsMiddleware,
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssSanitizeMiddleware,
} from './middlewares/security.middleware.js';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Trust first proxy (needed for correct req.ip / rate limiting behind Nginx/Heroku/etc.)
app.set('trust proxy', 1);

// ---- Security ----
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(mongoSanitizeMiddleware);
app.use(hppMiddleware);

// ---- Body parsing (with request size limits to prevent abuse) ----
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(xssSanitizeMiddleware);

// ---- Performance ----
app.use(compression());

// ---- Logging ----
if (!env.isProd) {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ---- Global rate limit ----
app.use('/api', globalLimiter);

// ---- Routes ----
app.use(`/api/${env.apiVersion}`, apiRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({ success: true, message: `${env.appName} API is running.` });
});

// ---- 404 + centralized error handling ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
