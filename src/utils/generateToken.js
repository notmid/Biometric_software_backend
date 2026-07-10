import jwt from 'jsonwebtoken';

// Creates a signed JWT containing the admin's id. The frontend stores this
// token and sends it back on every request via the Authorization header.
export function generateToken(adminId) {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
