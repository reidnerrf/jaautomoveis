import express from 'express';
import { getMonthlyViews, getDashboardStats, getRealtimeStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/monthly-views', protect, getMonthlyViews);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/realtime-stats', protect, getRealtimeStats);

export default router;