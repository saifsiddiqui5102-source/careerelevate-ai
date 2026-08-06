import express from 'express';
import { uploadResume, analyzeResume, getResumeHistory, getResumeVersions, compareResumeVersions, getResumeById } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeResume);
router.get('/history', protect, getResumeHistory);
router.get('/versions', protect, getResumeVersions);
router.post('/compare', protect, compareResumeVersions);
router.get('/:id', protect, getResumeById);

export default router;
