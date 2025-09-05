import express from 'express';
import { getTrends } from '../controllers/trendController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTrends);

export default router;
