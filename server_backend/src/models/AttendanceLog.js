import mongoose from 'mongoose';

// Matches Attendance_log from database_structure.docx:
// id, name, time, date, status, attendance_type(checkin/checkout),
// attendance_class(break/day), video
//
// Each row is one check-in or check-out event. This is what the mobile app's
// verification flow will eventually write to — for now the admin dashboard
// only reads from it.
const attendanceLogSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    name: { type: String, required: true }, // denormalized for fast reads/reports
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "09:12 AM"
    status: { type: String, enum: ['success', 'failed', 'malicious'], required: true },
    attendanceType: { type: String, enum: ['checkin', 'checkout'], required: true },
    attendanceClass: { type: String, enum: ['day', 'break'], required: true },
    videoUrl: { type: String, default: null }, // path/URL to the recorded verification clip
  },
  { timestamps: true }
);

attendanceLogSchema.index({ employee: 1, date: 1 });

export default mongoose.model('AttendanceLog', attendanceLogSchema);
