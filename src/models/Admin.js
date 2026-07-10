import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Not part of the original database_structure doc — added because the doc's
// employee_data has no password/email field, and login needs somewhere to
// authenticate against. This is the admin/HR account, separate from employees.
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

// Runs automatically before saving — hashes the password if it was changed.
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method: compare a plain-text login attempt against the stored hash.
adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Admin', adminSchema);
