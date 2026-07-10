import WorkingDaysData from '../models/WorkingDaysData.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/working-days?month=7&year=2026
// Returns the holiday list an admin has set for that month (empty if none yet).
// Used by the "Manage Holidays" form on the dashboard to prefill existing dates.
export const getWorkingDays = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  if (!month || !year) {
    res.statusCode = 400;
    throw new Error('month and year query params are required.');
  }

  const doc = await WorkingDaysData.findOne({ month, year });
  res.json({
    month,
    year,
    holidays: (doc?.holidays || []).map((d) => d.toISOString().split('T')[0]),
  });
});

// PUT /api/working-days
// Admin sets/replaces the full holiday list for a given month + year.
// Body: { month, year, holidays: ["2026-07-15", "2026-07-22", ...] }
// This is what the attendance calendar and monthly report read from
// (see WorkingDaysData usage in attendanceController.js / reportController.js),
// so saving here immediately changes how those days are classified.
export const setWorkingDays = asyncHandler(async (req, res) => {
  const { month, year, holidays } = req.body;

  if (!month || !year || !Array.isArray(holidays)) {
    res.statusCode = 400;
    throw new Error('month, year, and holidays (array of date strings) are required.');
  }

  const parsedDates = holidays.map((d) => {
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) {
      res.statusCode = 400;
      throw new Error(`"${d}" is not a valid date.`);
    }
    return date;
  });

  const doc = await WorkingDaysData.findOneAndUpdate(
    { month, year },
    { month, year, holidays: parsedDates },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({
    month: doc.month,
    year: doc.year,
    holidays: doc.holidays.map((d) => d.toISOString().split('T')[0]),
  });
});
