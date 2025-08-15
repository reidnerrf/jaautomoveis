import express from 'express';
import { getMonthlyViews } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/monthly-views', protect, getMonthlyViews);

export default router;
