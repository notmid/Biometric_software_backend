import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.statusCode = 400;
    throw new Error('Email and password are required.');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    res.statusCode = 401;
    throw new Error('Invalid email or password.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    res.statusCode = 401;
    throw new Error('Invalid email or password.');
  }

  const token = generateToken(admin._id);

  res.json({
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// GET /api/auth/me — returns whoever the current token belongs to.
// Used on app load to check "is this token still valid?" without
// forcing the user to log in again if they refresh the page.
export const getMe = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});
