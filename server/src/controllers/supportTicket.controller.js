import SupportTicket from '../models/SupportTicket.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { auditService } from '../services/audit.service.js';
import { AUDIT_EVENTS } from '../constants/index.js';

/** Public: both guests and logged-in users submit through the same simple contact form. */
export const submitSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    submittedBy: req.user?._id || null,
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });

  await auditService.log(AUDIT_EVENTS.SUPPORT_TICKET_SUBMITTED, req, req.user?._id || null, { ticketId: ticket._id });
  res.status(201).json(new ApiResponse(201, { ticketId: ticket._id }, "Message sent. We'll get back to you soon."));
});

/** Support role (+ Admin/Super Admin): list all tickets. */
export const listSupportTickets = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const tickets = await SupportTicket.find(query).populate('handledBy', 'username fullName').sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { tickets }));
});

/** Support role (+ Admin/Super Admin): update ticket status / resolution note. */
export const updateSupportTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw ApiError.notFound('Ticket not found');

  if (req.body.status) ticket.status = req.body.status;
  if (req.body.resolutionNote !== undefined) ticket.resolutionNote = req.body.resolutionNote;
  ticket.handledBy = req.user._id;
  if (ticket.status === 'resolved') ticket.resolvedAt = new Date();
  await ticket.save();

  await auditService.log(AUDIT_EVENTS.SUPPORT_TICKET_UPDATED, req, req.user._id, { ticketId: ticket._id, status: ticket.status });
  res.status(200).json(new ApiResponse(200, { ticket }, 'Ticket updated'));
});
