import express from 'express';
import authRoutes from '../authRoutes.js';
import userRoutes from '../userRoutes.js';
import resumeRoutes from '../resumeRoutes.js';
import interviewRoutes from '../interviewRoutes.js';
import dashboardRoutes from '../dashboardRoutes.js';

const router = express.Router();

// Mount API v1 Modular Routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
