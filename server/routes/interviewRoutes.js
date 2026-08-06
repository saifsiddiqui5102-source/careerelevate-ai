import express from 'express';
import { getQuestions, generateQuestions, evaluateAnswer, getInterviewHistory } from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/questions', protect, getQuestions);
router.post('/generate-questions', protect, generateQuestions);
router.post('/mock', protect, evaluateAnswer);
router.get('/history', protect, getInterviewHistory);

export default router;
