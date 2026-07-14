import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => `[${ts}] ${level}: ${stack || message}`)
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Centralized application logger.
 * In production this should be shipped to a log aggregator (Datadog, CloudWatch, ELK, etc.)
 * by attaching an additional winston transport — no code using `logger` needs to change.
 */
const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

export default logger;
