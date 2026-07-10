import express from 'express';
import { getQueries, createQuery, answerQuery } from '../controllers/queryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getQueries);
router.post('/', createQuery); // mobile app will call this later
router.patch('/:id', answerQuery);

export default router;
