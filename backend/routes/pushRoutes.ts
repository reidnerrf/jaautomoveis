import express from 'express';
import {
  subscribeToPush,
  unsubscribeFromPush,
  sendPushNotification,
  getPushStats,
  getVapidPublicKey
} from '../controllers/pushController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Rotas públicas
router.post('/subscribe', subscribeToPush);
router.post('/unsubscribe', unsubscribeFromPush);
router.get('/vapid-public-key', getVapidPublicKey);

// Rotas protegidas (admin)
router.post('/send', protect, sendPushNotification);
router.get('/stats', protect, getPushStats);

export default router;