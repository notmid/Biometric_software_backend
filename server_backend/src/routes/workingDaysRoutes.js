import express from 'express';
import { getWorkingDays, setWorkingDays } from '../controllers/workingDaysController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getWorkingDays);
router.put('/', setWorkingDays);

export default router;
