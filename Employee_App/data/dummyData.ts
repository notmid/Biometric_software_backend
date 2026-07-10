import { CalendarDay, LeaveApplication, PayrollData, QueryItem } from '../types';

// Generates a full month of dummy attendance data for the current month.
// Weekends are marked as holidays, a few random days are "leave",
// days after today are "upcoming", and the rest are "present".
export function generateCalendarData(): CalendarDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const leaveDays = [3, 14]; // fixed sample days marked as leave, for consistency

  const days: CalendarDay[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const dateStr = date.toISOString().split('T')[0];

    let status: CalendarDay['status'];
    let checkIn: string | undefined;
    let checkOut: string | undefined;
    let hoursWorked: string | undefined;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'holiday';
    } else if (leaveDays.includes(day)) {
      status = 'leave';
    } else if (day > today) {
      status = 'upcoming';
    } else {
      status = 'present';
      checkIn = '09:12 AM';
      checkOut = '06:04 PM';
      hoursWorked = '8h 52m';
    }

    days.push({ date: dateStr, status, checkIn, checkOut, hoursWorked });
  }

  return days;
}

export const dummyLeaveApplications: LeaveApplication[] = [
  {
    id: 'lv-1',
    type: 'Casual Leave',
    startDate: '2026-07-10',
    endDate: '2026-07-11',
    reason: 'Family function out of town',
    status: 'pending',
    appliedOn: '2026-07-02',
  },
  {
    id: 'lv-2',
    type: 'Sick Leave',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    reason: 'Fever and cold',
    status: 'approved',
    appliedOn: '2026-06-17',
  },
  {
    id: 'lv-3',
    type: 'Work From Home',
    startDate: '2026-06-25',
    endDate: '2026-06-25',
    reason: 'Internet technician visit at home',
    status: 'rejected',
    appliedOn: '2026-06-23',
  },
];

export const dummyQueries: QueryItem[] = [
  {
    id: 'qr-1',
    subject: 'Incorrect overtime calculation',
    description: 'My overtime hours for last week seem lower than expected.',
    status: 'unanswered',
    submittedOn: '2026-07-01',
  },
  {
    id: 'qr-2',
    subject: 'Payslip not downloading',
    description: 'The download payslip button does not respond on my device.',
    status: 'answered',
    answer: 'This has been fixed. Please try downloading again from Payroll.',
    submittedOn: '2026-06-20',
  },
];

export const dummyPayroll: PayrollData = {
  month: 'July 2026',
  workingDays: 22,
  daysPresent: 18,
  leavesTaken: 2,
  overtimeHours: 6,
  baseSalary: 65000,
  overtimePay: 2400,
  expectedSalary: 67400,
  paymentStatus: 'Processing',
};
