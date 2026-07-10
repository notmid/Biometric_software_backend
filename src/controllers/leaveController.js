import LeaveForm from '../models/LeaveForm.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/leave-requests
export const getLeaveRequests = asyncHandler(async (req, res) => {
  const leaveRequests = await LeaveForm.find().sort({ createdAt: -1 });
  res.json(leaveRequests);
});

// POST /api/leave-requests
// Creates a new request with status "pending". This is the endpoint the
// mobile app will call later when an employee submits a leave application.
export const createLeaveRequest = asyncHandler(async (req, res) => {
  const { employee, name, reason, startDate, endDate } = req.body;

  if (!employee || !name || !reason || !startDate || !endDate) {
    res.statusCode = 400;
    throw new Error('employee, name, reason, startDate, and endDate are required.');
  }

  const leaveRequest = await LeaveForm.create({ employee, name, reason, startDate, endDate });
  res.status(201).json(leaveRequest);
});

// PATCH /api/leave-requests/:id
// Body: { status: 'approved' | 'declined', adminNote?: string }
export const decideLeaveRequest = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  if (!['approved', 'declined'].includes(status)) {
    res.statusCode = 400;
    throw new Error("status must be 'approved' or 'declined'.");
  }

  const leaveRequest = await LeaveForm.findByIdAndUpdate(
    req.params.id,
    { status, adminNote: adminNote || null },
    { new: true }
  );

  if (!leaveRequest) {
    res.statusCode = 404;
    throw new Error('Leave request not found.');
  }

  res.json(leaveRequest);
});
