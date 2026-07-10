import Employee from '../models/Employee.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getFaceEmbedding } from '../utils/modelService.js';

// GET /api/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 });
  res.json(employees);
});

// GET /api/employees/:id
export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.statusCode = 404;
    throw new Error('Employee not found.');
  }
  res.json(employee);
});

// POST /api/employees
// When a photo is provided, it's run through the model service to produce a
// face embedding, which is what the mobile check-in app matches against
// (see model-service/identify.py). Creation fails loudly if that step fails
// — an employee with no embedding could never check in, so we don't want to
// silently create one.
export const createEmployee = asyncHandler(async (req, res) => {
  const { name, department, designation, contact, dateOfJoining, baseSalary, photoUrl } = req.body;

  if (!name || !department || !designation || !contact || !dateOfJoining || !baseSalary) {
    res.statusCode = 400;
    throw new Error('name, department, designation, contact, dateOfJoining, and baseSalary are required.');
  }

  let faceEmbedding = [];
  if (photoUrl) {
    try {
      faceEmbedding = await getFaceEmbedding(photoUrl);
    } catch (err) {
      res.statusCode = 422;
      throw new Error(`Could not enroll this employee's face: ${err.message}`);
    }
  }

  const employee = await Employee.create({
    name,
    department,
    designation,
    contact,
    dateOfJoining,
    baseSalary,
    photoUrl: photoUrl || null,
    faceEmbedding,
  });

  res.status(201).json(employee);
});

// PATCH /api/employees/:id
// If the update includes a new photoUrl, re-run enrollment so the stored
// embedding stays in sync with the photo on file.
export const updateEmployee = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (updates.photoUrl) {
    try {
      updates.faceEmbedding = await getFaceEmbedding(updates.photoUrl);
    } catch (err) {
      res.statusCode = 422;
      throw new Error(`Could not re-enroll this employee's face: ${err.message}`);
    }
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    res.statusCode = 404;
    throw new Error('Employee not found.');
  }

  res.json(employee);
});

// DELETE /api/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    res.statusCode = 404;
    throw new Error('Employee not found.');
  }
  res.json({ message: 'Employee deleted.' });
});
