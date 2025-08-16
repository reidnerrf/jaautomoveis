import express from 'express';
import { getMonthlyViews, getDashboardStats, getRealtimeStats } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/monthly-views', authenticateToken, getMonthlyViews);
router.get('/dashboard-stats', authenticateToken, getDashboardStats);
router.get('/realtime-stats', authenticateToken, getRealtimeStats);

export default router;