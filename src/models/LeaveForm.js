import mongoose from 'mongoose';

// Matches leave_form from database_structure.docx: id, name, reason, status(approved/declined)
// Extended with a few fields the admin dashboard already needs:
// - "pending" added to status (a request has to start somewhere before being decided)
// - startDate/endDate (the dashboard shows a date range, the doc's version didn't specify one)
// - adminNote (the "add a short note" feature on the Leave Requests page)
const leaveFormSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    name: { type: String, required: true }, // denormalized employee name
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    adminNote: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('LeaveForm', leaveFormSchema);
