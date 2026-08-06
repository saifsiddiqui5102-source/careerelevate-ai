import express from 'express';
import { getDashboardSummary, getAnalytics, getActivity, getCharts, getProgress } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getDashboardSummary);
router.get('/analytics', protect, getAnalytics);
router.get('/activity', protect, getActivity);
router.get('/charts', protect, getCharts);
router.get('/progress', protect, getProgress);

export default router;
