import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  questionsCount: {
    type: Number,
    default: 1
  },
  feedbackSummary: String,
  transcript: [{
    question: String,
    userAnswer: String,
    clarityScore: Number,
    techDepthScore: Number,
    starScore: Number,
    relevanceScore: Number,
    aiFeedback: String
  }]
}, { timestamps: true });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
