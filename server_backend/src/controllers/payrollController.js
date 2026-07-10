import crypto from 'crypto';
import Employee from '../models/Employee.js';
import LeaveForm from '../models/LeaveForm.js';
import Payroll from '../models/Payroll.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/payroll
// Returns one row per payroll RUN (grouped by runId), matching the shape
// the dashboard's Payroll page already expects.
export const getPayrollRuns = asyncHandler(async (req, res) => {
  const runs = await Payroll.aggregate([
    {
      $group: {
        _id: '$runId',
        startDate: { $first: '$startDate' },
        endDate: { $first: '$endDate' },
        processedOn: { $first: '$processedOn' },
        total: { $sum: '$salary' },
      },
    },
    { $sort: { processedOn: -1 } },
  ]);

  const formatted = runs.map((r) => ({
    id: r._id,
    startDate: r.startDate,
    endDate: r.endDate,
    processedOn: r.processedOn,
    total: r.total,
  }));

  res.json(formatted);
});

// POST /api/payroll/initiate
// Body: { startDate, endDate }
// Creates one Payroll row per employee for this run, using each employee's
// baseSalary (their maximum monthly salary) and their approved leave count
// during the period.
export const initiatePayroll = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    res.statusCode = 400;
    throw new Error('startDate and endDate are required.');
  }

  const employees = await Employee.find();
  const runId = crypto.randomUUID();
  const processedOn = new Date();

  const rows = await Promise.all(
    employees.map(async (emp) => {
      const totalLeave = await LeaveForm.countDocuments({
        employee: emp._id,
        status: 'approved',
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      });

      return Payroll.create({
        runId,
        employee: emp._id,
        empName: emp.name,
        totalLeave,
        salary: Math.round(emp.baseSalary / 12),
        startDate,
        endDate,
        processedOn,
      });
    })
  );

  const total = rows.reduce((sum, r) => sum + r.salary, 0);

  res.status(201).json({ id: runId, startDate, endDate, processedOn, total });
});
