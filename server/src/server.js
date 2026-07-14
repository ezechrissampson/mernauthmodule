import { validateEnv, env } from './config/env.js';

validateEnv(); // fail fast if misconfigured — must run before anything else imports env-dependent modules

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';
import redisClient from './config/redis.js';

async function bootstrap() {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`${env.appName} API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      redisClient.disconnect();
      logger.info('Shutdown complete.');
      process.exit(0);
    });
    // Force-exit if shutdown hangs
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
    process.exit(1);
  });
}

bootstrap();
