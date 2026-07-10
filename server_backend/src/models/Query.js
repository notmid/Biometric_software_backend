import mongoose from 'mongoose';

// Matches "query" from database_structure.docx: id, name, query, status(answered/unanswered)
// Extended with "subject" (short title, shown on the dashboard cards) and
// "answer" (the admin's reply text, shown once status flips to answered).
// Renamed the doc's "query" field to "message" here since "query" collides
// with the collection/model's own name in code — same meaning, just clearer.
const querySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    name: { type: String, required: true }, // denormalized employee name
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['answered', 'unanswered'], default: 'unanswered' },
    answer: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Query', querySchema);
