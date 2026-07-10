import mongoose from 'mongoose';

// Matches employee_data from database_structure.docx:
// id, name, department, designation, contact, date_of_joining, base_salary, face_embedding
const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    contact: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    baseSalary: { type: Number, required: true }, // annual figure

    // Stores the numeric face embedding vector produced by the face-recognition
    // model — used later by the mobile app's check-in flow to match a live
    // photo/video against this employee. Not populated until that's wired up.
    faceEmbedding: { type: [Number], default: undefined },

    // Not in the original doc — needed by the admin dashboard's Employees page.
    photoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
