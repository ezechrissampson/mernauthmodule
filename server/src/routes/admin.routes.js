import { Router } from 'express';
import * as analyticsCtrl from '../controllers/analytics.controller.js';
import * as adminUserCtrl from '../controllers/adminUser.controller.js';
import * as rootCtrl from '../controllers/rootPanels.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/authorize.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { assignRoleValidator } from '../validators/feature.validators.js';

const router = Router();
router.use(protect);

// ---- Analyst (+ Admin/Super Admin) ----
router.get('/analytics', requirePermission(PERMISSIONS.ANALYTICS_VIEW), analyticsCtrl.getAnalyticsSummary);

// ---- Admin (+ Super Admin) — simple users table + role assignment, nothing more ----
router.get('/users', requirePermission(PERMISSIONS.USERS_MANAGE), adminUserCtrl.listUsers);
router.patch('/users/:id/role', requirePermission(PERMISSIONS.USERS_MANAGE), assignRoleValidator, validate, adminUserCtrl.assignRole);

// ---- Finance (+ Super Admin). Admin is deliberately excluded. ----
router.get('/billing', requirePermission(PERMISSIONS.BILLING_MANAGE), rootCtrl.getBillingOverview);

// ---- Super Admin ONLY ----
router.get('/security', requirePermission(PERMISSIONS.SECURITY_MANAGE), rootCtrl.getSecurityOverview);

export default router;
