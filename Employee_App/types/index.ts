// Central place for all shared type definitions.
// Keeping these separate makes it easy to swap dummy data for a real API later —
// as long as the API returns data matching these shapes, nothing else changes.

export type DayStatus = 'present' | 'leave' | 'holiday' | 'upcoming' | 'absent';

export type CalendarDay = {
  date: string; // e.g. "2026-07-04"
  status: DayStatus;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: string;
  note?: string;
};

export type TodayState = 'not-checked-in' | 'checked-in' | 'checked-out';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'Sick Leave' | 'Casual Leave' | 'Earned Leave' | 'Work From Home';

export type LeaveApplication = {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
};

export type QueryStatus = 'answered' | 'unanswered';

export type QueryItem = {
  id: string;
  subject: string;
  description: string;
  status: QueryStatus;
  answer?: string;
  submittedOn: string;
};

export type User = {
  name: string;
  email: string;
  employeeId: string;
};

export type PayrollData = {
  month: string;
  workingDays: number;
  daysPresent: number;
  leavesTaken: number;
  overtimeHours: number;
  baseSalary: number;
  overtimePay: number;
  expectedSalary: number;
  paymentStatus: 'Paid' | 'Pending' | 'Processing';
};
