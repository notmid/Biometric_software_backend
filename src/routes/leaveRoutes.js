import express from 'express';
import {
  getLeaveRequests,
  createLeaveRequest,
  decideLeaveRequest,
} from '../controllers/leaveController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest); // mobile app will call this later
router.patch('/:id', decideLeaveRequest);

export default router;
