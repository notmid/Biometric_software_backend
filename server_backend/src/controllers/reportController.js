import Employee from '../models/Employee.js';
import AttendanceLog from '../models/AttendanceLog.js';
import LeaveForm from '../models/LeaveForm.js';
import WorkingDaysData from '../models/WorkingDaysData.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const LATE_THRESHOLD_MINUTES = 9 * 60 + 30; // 9:30 AM cutoff for "late"

// Parses a stored time string like "09:42 AM" into minutes since midnight.
function timeStringToMinutes(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;
  let [, hours, minutes, period] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function countWorkingDays(month, year, holidaySet) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    const key = date.toISOString().split('T')[0];
    if (dow !== 0 && dow !== 6 && !holidaySet.has(key)) count++;
  }
  return count;
}

// GET /api/reports/monthly?month=7&year=2026
// Returns { employeeReport, departmentReport } computed from real
// AttendanceLog + LeaveForm data — this is what the frontend's Reports
// page downloads as an Excel file.
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const month = parseInt(req.query.month, 10);
  const year = parseInt(req.query.year, 10);

  if (!month || !year) {
    res.statusCode = 400;
    throw new Error('month and year query params are required.');
  }

  const workingDaysDoc = await WorkingDaysData.findOne({ month, year });
  const holidaySet = new Set((workingDaysDoc?.holidays || []).map((d) => d.toISOString().split('T')[0]));
  const workingDays = countWorkingDays(month, year, holidaySet);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const employees = await Employee.find();

  const checkIns = await AttendanceLog.find({
    date: { $gte: monthStart, $lte: monthEnd },
    attendanceType: 'checkin',
    status: 'success',
  });

  const approvedLeaves = await LeaveForm.find({
    status: 'approved',
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  });

  const employeeReport = employees.map((emp) => {
    const empCheckIns = checkIns.filter((log) => String(log.employee) === String(emp._id));
    const daysPresent = new Set(empCheckIns.map((log) => log.date.toISOString().split('T')[0])).size;
    const lateArrivals = empCheckIns.filter((log) => {
      const minutes = timeStringToMinutes(log.time);
      return minutes !== null && minutes > LATE_THRESHOLD_MINUTES;
    }).length;
    const leavesTaken = approvedLeaves.filter((l) => String(l.employee) === String(emp._id)).length;
    const daysAbsent = Math.max(0, workingDays - daysPresent - leavesTaken);
    const attendancePct = workingDays > 0 ? Math.round((daysPresent / workingDays) * 100) : 0;

    return {
      name: emp.name,
      department: emp.department,
      designation: emp.designation,
      workingDays,
      daysPresent,
      daysAbsent,
      leavesTaken,
      lateArrivals,
      attendancePct,
    };
  });

  const byDept = {};
  for (const row of employeeReport) {
    if (!byDept[row.department]) {
      byDept[row.department] = {
        department: row.department,
        headcount: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLeaves: 0,
        totalLateArrivals: 0,
        workingDays,
      };
    }
    const d = byDept[row.department];
    d.headcount += 1;
    d.totalPresent += row.daysPresent;
    d.totalAbsent += row.daysAbsent;
    d.totalLeaves += row.leavesTaken;
    d.totalLateArrivals += row.lateArrivals;
  }

  const departmentReport = Object.values(byDept).map((d) => ({
    ...d,
    avgAttendancePct: workingDays > 0 ? Math.round((d.totalPresent / (d.headcount * workingDays)) * 100) : 0,
  }));

  res.json({ employeeReport, departmentReport });
});
