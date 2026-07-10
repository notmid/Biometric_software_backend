import Employee from '../models/Employee.js';
import AttendanceLog from '../models/AttendanceLog.js';
import WorkingDaysData from '../models/WorkingDaysData.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/attendance/today-summary
// Powers the big "Today's Attendance" card on the dashboard.
export const getTodaySummary = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const totalEmployees = await Employee.countDocuments();

  // Anyone with at least one successful check-in today counts as present.
  const presentEmployeeIds = await AttendanceLog.distinct('employee', {
    date: { $gte: startOfDay, $lte: endOfDay },
    attendanceType: 'checkin',
    status: 'success',
  });

  res.json({ present: presentEmployeeIds.length, total: totalEmployees });
});

// GET /api/attendance/calendar?month=7&year=2026
// Powers the admin dashboard's attendance calendar. For each day of the
// month, reports whether it's a weekend/holiday, or how many employees
// were present, with a list of who was absent.
export const getMonthCalendar = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month, 10); // 1-12
  const year = parseInt(req.query.year, 10);

  if (!month || !year) {
    res.statusCode = 400;
    throw new Error('month and year query params are required.');
  }

  const totalEmployees = await Employee.countDocuments();
  const workingDaysDoc = await WorkingDaysData.findOne({ month, year });
  const holidaySet = new Set((workingDaysDoc?.holidays || []).map((d) => d.toISOString().split('T')[0]));

  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  // Pull the whole month's logs in one query, then group them in memory by day —
  // much cheaper than querying per-day in a loop.
  const logs = await AttendanceLog.find({
    date: { $gte: monthStart, $lte: monthEnd },
    attendanceType: 'checkin',
    status: 'success',
  }).select('employee name date');

  const presentByDate = {};
  for (const log of logs) {
    const key = log.date.toISOString().split('T')[0];
    if (!presentByDate[key]) presentByDate[key] = new Set();
    presentByDate[key].add(String(log.employee));
  }

  const allEmployees = await Employee.find().select('_id name');

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    // Build the key from the numbers directly — date.toISOString() converts
    // through UTC, which shifts the date by a day in timezones ahead of UTC
    // (e.g. picking a holiday on the 15th was showing up on the 16th).
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = date.getDay();

    let status;
    if (dayOfWeek === 0 || dayOfWeek === 6 || holidaySet.has(dateKey)) {
      status = 'holiday';
    } else if (date > today) {
      status = 'upcoming';
    } else {
      status = 'present'; // "present" here means "a working day that happened" — see presentCount for actual attendance
    }

    let presentCount = 0;
    let absentEmployees = [];
    if (status === 'present') {
      const presentIds = presentByDate[dateKey] || new Set();
      presentCount = presentIds.size;
      absentEmployees = allEmployees
        .filter((e) => !presentIds.has(String(e._id)))
        .map((e) => e.name);
    }

    days.push({ date: dateKey, day, status, presentCount, totalEmployees, absentEmployees });
  }

  res.json({ month, year, days });
});
