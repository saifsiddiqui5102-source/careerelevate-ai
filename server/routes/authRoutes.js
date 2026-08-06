import express from 'express';
import { register, verifyOTP, resendOTP, forgotPassword, resetPassword, login, logout } from '../controllers/authController.js';
import { getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin, validateVerifyOTP, validateForgotPassword, validateResetPassword } from '../middleware/validationMiddleware.js';
import { authRateLimiter } from '../middleware/securityMiddleware.js';

const router = express.Router();

// Apply auth rate limiting to all auth endpoints
router.use(authRateLimiter);

router.post('/register', validateRegister, register);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/profile', protect, getUserProfile);

export default router;
