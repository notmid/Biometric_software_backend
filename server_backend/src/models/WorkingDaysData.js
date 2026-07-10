import mongoose from 'mongoose';

// Matches working_days_data from database_structure.docx:
// month, year, dates of holidays other than weekends.
// One document per month. Used by the attendance calendar and the
// monthly report to know which weekdays are actually company holidays.
const workingDaysDataSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    holidays: { type: [Date], default: [] }, // weekday dates that are holidays
  },
  { timestamps: true }
);

workingDaysDataSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.model('WorkingDaysData', workingDaysDataSchema);
