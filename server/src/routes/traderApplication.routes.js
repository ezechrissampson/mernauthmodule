import { Router } from 'express';
import * as ctrl from '../controllers/traderApplication.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { traderApplicationValidator, reviewTraderApplicationValidator } from '../validators/feature.validators.js';

const router = Router();

router.use(protect);

// Note: '/mine' must be registered before '/:id'-style routes to avoid route shadowing.
router.get('/mine', ctrl.myTraderApplications);
router.post('/', traderApplicationValidator, validate, ctrl.applyForTrader);

router.get('/', requirePermission(PERMISSIONS.APPROVALS_MANAGE), ctrl.listTraderApplications);
router.post('/:id/review', requirePermission(PERMISSIONS.APPROVALS_MANAGE), reviewTraderApplicationValidator, validate, ctrl.reviewTraderApplication);

export default router;
