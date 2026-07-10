import mongoose from 'mongoose';

// Matches "payroll" from database_structure.docx: emp_id, emp_name, total_leave, salary
// Each payroll RUN produces one of these documents per employee. Extended with
// startDate/endDate/processedOn so the dashboard can group and display runs
// the way the "Initiate Payroll" feature expects.
const payrollSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true }, // groups all employee rows from the same "Initiate Payroll" click
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    empName: { type: String, required: true }, // denormalized
    totalLeave: { type: Number, required: true, default: 0 },
    salary: { type: Number, required: true }, // amount actually paid this run
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    processedOn: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Payroll', payrollSchema);
