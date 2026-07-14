import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.js';
import { USER_ROLES } from '../constants/index.js';

/**
 * Billing/financial reports tab. No real payment processor is wired in (out of scope) —
 * this returns placeholder figures so the tab is real and functional to build against,
 * while the important part (who can reach this endpoint at all) is fully enforced.
 * Visible to: Finance, Super Admin. NOT Admin.
 */
export const getBillingOverview = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      note: 'No payment processor is connected yet — wire one in (e.g. Stripe) and replace this with real figures.',
      mrr: 0,
      outstandingInvoices: 0,
      lastPayoutAt: null,
      currency: 'USD',
    })
  );
});

/**
 * Security root control tab — account lockouts, recent suspicious logins, session stats.
 * Visible to: Super Admin ONLY.
 */
export const getSecurityOverview = asyncHandler(async (req, res) => {
  const [lockedAccounts, superAdmins] = await Promise.all([
    User.countDocuments({ lockUntil: { $gt: new Date() } }),
    User.countDocuments({ role: USER_ROLES.SUPER_ADMIN }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      lockedAccounts,
      superAdminCount: superAdmins,
      note: 'Root security control panel. Extend with IP allowlists, global session revocation, etc. as needed.',
    })
  );
});
