import mongoose from 'mongoose';

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  resumeTitle: {
    type: String,
    default: 'Uploaded Resume'
  },
  overallScore: {
    type: Number,
    required: true
  },
  resumeSummary: String,
  metricsCount: Number,
  metricsScore: Number,
  actionVerbScore: Number,
  sectionScore: Number,
  wordCount: Number,
  wordCountStatus: String,
  foundActionVerbs: [String],
  foundWeakWords: [String],
  missingSections: [String],
  missingSkills: [String],
  weakSections: [String],
  grammarSuggestions: [String],
  formattingSuggestions: [String],
  industrySuggestions: [String],
  jobRoleSuggestions: [String],
  salaryRange: String,
  learningRoadmap: {
    stage1: String,
    stage2: String,
    stage3: String
  },
  personalizedCareerAdvice: String,
  recommendations: [mongoose.Schema.Types.Mixed],
  generatedQuestions: {
    hrQuestions: [String],
    technicalQuestions: [String]
  },
  jobMatchScore: Number
}, { timestamps: true });

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
