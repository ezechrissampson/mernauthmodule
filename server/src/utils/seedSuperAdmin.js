/**
 * Creates the ONE designated Super Admin account for this deployment. Idempotent — if a user
 * with this email already exists, it only ensures their role is super_admin and exits; it
 * never overwrites an existing password. Run with: npm run seed:super-admin
 *
 * This is intentionally separate from seedRolesAndPermissions.js: no other "default" admin
 * account is ever created by this codebase — only the one specified below.
 */
import { validateEnv } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import logger from './logger.js';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/index.js';

const SUPER_ADMIN = {
  fullName: 'Ezechris Sampson',
  username: 'ezechris',
  email: 'ezechrissampson@gmail.com',
  password: 'Password1@',
};

async function run() {
  validateEnv();
  await connectDB();

  const existing = await User.findOne({ email: SUPER_ADMIN.email });
  if (existing) {
    if (existing.role !== USER_ROLES.SUPER_ADMIN) {
      existing.role = USER_ROLES.SUPER_ADMIN;
      await existing.save();
      logger.info(`Existing account ${SUPER_ADMIN.email} promoted to super_admin.`);
    } else {
      logger.info(`Super Admin account ${SUPER_ADMIN.email} already exists. Nothing to do.`);
    }
  } else {
    await User.create({
      fullName: SUPER_ADMIN.fullName,
      username: SUPER_ADMIN.username,
      email: SUPER_ADMIN.email,
      password: SUPER_ADMIN.password, // hashed by the User pre-save hook
      role: USER_ROLES.SUPER_ADMIN,
      isEmailVerified: true, // skip the normal verification flow for the seeded root account
      termsAcceptedAt: new Date(),
    });
    logger.info(`Super Admin account created: ${SUPER_ADMIN.email}`);
    logger.warn('Change this password after first login — it was set from a seed script.');
  }

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  logger.error(`Super Admin seed failed: ${err.message}`);
  process.exit(1);
});
