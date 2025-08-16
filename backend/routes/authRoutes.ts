
import express from 'express';
import { loginUser, openSession, closeSession } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/passwordController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/session/open', openSession);
router.post('/session/close', closeSession);

export default router;
