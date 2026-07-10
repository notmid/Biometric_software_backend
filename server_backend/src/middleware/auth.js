import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Protects a route: requires a valid "Authorization: Bearer <token>" header.
// On success, attaches the logged-in admin to req.admin so route handlers
// can use it (e.g. to log who approved a leave request).
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}
