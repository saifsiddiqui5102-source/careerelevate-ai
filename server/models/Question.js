import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  question: {
    type: String,
    required: true
  },
  hints: [String],
  starGuide: {
    situation: String,
    task: String,
    action: String,
    result: String
  },
  sampleAnswer: String
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);
