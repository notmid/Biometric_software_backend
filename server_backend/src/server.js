import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import workingDaysRoutes from './routes/workingDaysRoutes.js';
import mobileRoutes from './routes/mobileRoutes.js';

const app = express();

// Only requests from these origins are allowed to call the API.
// Add your deployed frontend URL here once you deploy it.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '10mb' })); // 10mb headroom for base64 employee photos
app.use(morgan('dev')); // logs each request to the terminal — helpful while developing

// Route groups. Every path here is a plain REST resource with no
// platform-specific naming, so the mobile app can call the exact same
// endpoints later (just with a different client, same API).
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/working-days', workingDaysRoutes);
app.use('/api/mobile', mobileRoutes);

// Simple health check — useful for confirming the server is up,
// and required by some hosting platforms (Render, Railway) for uptime checks.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler); // must be registered last

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
