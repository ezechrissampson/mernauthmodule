import { Router } from 'express';
import * as ctrl from '../controllers/supportTicket.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { supportTicketLimiter } from '../middlewares/rateLimit.middleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { supportTicketValidator, updateSupportTicketValidator } from '../validators/feature.validators.js';

const router = Router();

// Public: guests AND logged-in users submit through the same form. optionalAuth attaches
// req.user if they happen to be logged in (so the ticket is linked to their account) but
// never requires it.
router.post('/', supportTicketLimiter, optionalAuth, supportTicketValidator, validate, ctrl.submitSupportTicket);

// Support role (+ Admin/Super Admin via their broader grants).
router.get('/', protect, requirePermission(PERMISSIONS.SUPPORT_MANAGE), ctrl.listSupportTickets);
router.patch('/:id', protect, requirePermission(PERMISSIONS.SUPPORT_MANAGE), updateSupportTicketValidator, validate, ctrl.updateSupportTicket);

export default router;
