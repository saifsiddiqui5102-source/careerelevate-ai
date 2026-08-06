import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versionNumber: {
    type: Number,
    default: 1
  },
  versionName: {
    type: String,
    default: 'v1.0 - Initial Upload'
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  rawText: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 75
  },
  metricsCount: {
    type: Number,
    default: 0
  },
  actionVerbCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Resume = mongoose.model('Resume', resumeSchema);
