import express from 'express';
import { getMonthlyReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/monthly', getMonthlyReport);

export default router;
