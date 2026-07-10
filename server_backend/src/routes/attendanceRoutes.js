import express from 'express';
import { getTodaySummary, getMonthCalendar } from '../controllers/attendanceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/today-summary', getTodaySummary);
router.get('/calendar', getMonthCalendar);

export default router;
