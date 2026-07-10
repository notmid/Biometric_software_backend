import express from 'express';
import { getPayrollRuns, initiatePayroll } from '../controllers/payrollController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getPayrollRuns);
router.post('/initiate', initiatePayroll);

export default router;
