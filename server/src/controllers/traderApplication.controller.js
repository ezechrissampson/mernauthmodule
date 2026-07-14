import TraderApplication from '../models/TraderApplication.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_EVENTS } from '../constants/index.js';

/** Any authenticated user applies to become a verified trader (small tab in the user dashboard). */
export const applyForTrader = asyncHandler(async (req, res) => {
  const existingPending = await TraderApplication.findOne({ applicant: req.user._id, status: 'pending' });
  if (existingPending) throw ApiError.conflict('You already have a pending application.');

  const application = await TraderApplication.create({ applicant: req.user._id, message: req.body.message });
  await auditService.log(AUDIT_EVENTS.TRADER_APPLICATION_SUBMITTED, req, req.user._id, { applicationId: application._id });

  res.status(201).json(new ApiResponse(201, { application }, 'Application submitted'));
});

/** The user's own application history/status. */
export const myTraderApplications = asyncHandler(async (req, res) => {
  const applications = await TraderApplication.find({ applicant: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { applications }));
});

/** Manager (+ Admin/Super Admin): list applications to review. */
export const listTraderApplications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const applications = await TraderApplication.find(query)
    .populate('applicant', 'username fullName email')
    .populate('reviewedBy', 'username fullName')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { applications }));
});

/** Manager (+ Admin/Super Admin): approve or reject an application. */
export const reviewTraderApplication = asyncHandler(async (req, res) => {
  const { decision, note = '' } = req.body; // decision: 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) throw ApiError.badRequest('Decision must be "approved" or "rejected"');

  const application = await TraderApplication.findById(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');
  if (application.status !== 'pending') throw ApiError.conflict('This application has already been reviewed.');

  application.status = decision;
  application.reviewedBy = req.user._id;
  application.reviewedAt = new Date();
  application.reviewNote = note;
  await application.save();

  await auditService.log(AUDIT_EVENTS.TRADER_APPLICATION_REVIEWED, req, req.user._id, { applicationId: application._id, decision });
  res.status(200).json(new ApiResponse(200, { application }, `Application ${decision}`));
});
