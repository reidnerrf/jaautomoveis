
import express from 'express';
import { loginUser } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/passwordController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
