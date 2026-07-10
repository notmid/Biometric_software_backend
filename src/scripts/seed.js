import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Employee from '../models/Employee.js';

// Run with: npm run seed
// Creates one admin login (email/password below) and a handful of sample
// employees, so you have something to actually test against right away.
async function seed() {
  await connectDB();

  const existingAdmin = await Admin.findOne({ email: 'admin@projenius.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: 'Admin User',
      email: 'admin@projenius.com',
      password: 'admin123', // hashed automatically by the Admin model's pre-save hook
    });
    console.log('Created admin login -> email: admin@projenius.com / password: admin123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  const employeeCount = await Employee.countDocuments();
  if (employeeCount === 0) {
    await Employee.insertMany([
      { name: 'Aarav Mehta', department: 'Engineering', designation: 'Senior Engineer', contact: '9876543210', dateOfJoining: '2022-03-14', baseSalary: 92000 },
      { name: 'Ananya Rao', department: 'Design', designation: 'Product Designer', contact: '9876543211', dateOfJoining: '2021-07-01', baseSalary: 78000 },
      { name: 'Carlos Nunez', department: 'Sales', designation: 'Account Executive', contact: '9876543212', dateOfJoining: '2023-01-09', baseSalary: 68000 },
      { name: 'Diya Kapoor', department: 'HR', designation: 'HR Manager', contact: '9876543213', dateOfJoining: '2019-11-20', baseSalary: 74000 },
      { name: 'Ethan Blake', department: 'Engineering', designation: 'Engineering Lead', contact: '9876543214', dateOfJoining: '2018-05-05', baseSalary: 118000 },
    ]);
    console.log('Created 5 sample employees.');
  } else {
    console.log('Employees already exist, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
