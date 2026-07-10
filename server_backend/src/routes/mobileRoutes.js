import express from 'express';
import multer from 'multer';
import { checkIn } from '../controllers/mobileController.js';

const router = express.Router();

// Video kept in memory only long enough to forward it to the model
// service — nothing here writes it to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 75 * 1024 * 1024 }, // 75MB — a few seconds of phone video
});

// Deliberately NOT behind requireAuth: the mobile app has no employee login
// (identity is determined by face match), so there's no admin JWT to send.
// If you need to lock this down further, consider a shared kiosk API key.
router.post('/checkin', upload.single('video'), checkIn);

export default router;
