import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import contentRoutes from './content.routes.js';
import traderApplicationRoutes from './traderApplication.routes.js';
import supportTicketRoutes from './supportTicket.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes); // self-service profile (unchanged from the auth module)
router.use('/', contentRoutes); // /posts, /moderation/posts, /moderation/comments
router.use('/trader-applications', traderApplicationRoutes);
router.use('/support-tickets', supportTicketRoutes);
router.use('/admin', adminRoutes); // /admin/users, /admin/analytics, /admin/billing, /admin/security

export default router;
