import mongoose from 'mongoose';
import { InterviewSession } from '../models/InterviewSession.js';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { generateDynamicInterviewQuestions, generateMockInterviewEvaluation } from '../services/geminiService.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const getQuestions = async (req, res, next) => {
  try {
    const { category, role, difficulty } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (role) filter.role = role;
    if (difficulty) filter.difficulty = difficulty;

    let questions = isDbConnected() ? await Question.find(filter) : [];

    if (questions.length === 0) {
      questions = [
        {
          _id: 'q-101',
          question: 'How do you optimize React application re-renders?',
          category: 'Frontend',
          difficulty: 'Intermediate',
          role: 'Full Stack Engineer',
          starModelAnswer: 'Use React.memo, useMemo, useCallback, and keep local component state close to usage site.'
        },
        {
          _id: 'q-102',
          question: 'Explain event loop and asynchronous I/O in Node.js.',
          category: 'Backend',
          difficulty: 'Hard',
          role: 'Backend Developer',
          starModelAnswer: 'Node uses libuv event loop with phases: timers, pending callbacks, idle/prepare, poll, check, close.'
        }
      ];
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuestions = async (req, res, next) => {
  try {
    const { resumeText, skills, jobRole, experienceYears } = req.body;

    const dynamicQuestions = await generateDynamicInterviewQuestions({
      resumeText,
      skills,
      jobRole: jobRole || 'Senior Software Engineer',
      experienceYears: experienceYears || '5 Years'
    });

    let savedSession = null;
    if (isDbConnected() && req.user && req.user._id) {
      savedSession = await InterviewSession.create({
        userId: req.user._id,
        role: jobRole || 'Senior Software Engineer',
        overallScore: 85,
        clarityScore: 85,
        techDepthScore: 88,
        starScore: 82,
        relevanceScore: 86,
        questionsCount: 6,
        feedbackSummary: 'Dynamic AI question suite generated based on candidate experience and technical skills matrix.',
        questions: dynamicQuestions
      });
    }

    res.status(200).json({
      success: true,
      sessionId: savedSession ? savedSession._id : `sess-${Date.now()}`,
      questions: dynamicQuestions
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateAnswer = async (req, res, next) => {
  try {
    const { question, candidateAnswer, role, difficulty, category } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ success: false, message: 'Question and candidate answer are required' });
    }

    const evaluation = await generateMockInterviewEvaluation(question, candidateAnswer, {
      role,
      difficulty,
      category
    });

    res.status(200).json({
      success: true,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

export const saveInterviewSession = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { role, score, questionsCount, feedbackSummary, transcript, category, difficulty } = req.body;

    let savedSession = null;
    if (isDbConnected() && userId) {
      savedSession = await InterviewSession.create({
        userId,
        role: role || 'Software Engineering',
        score: Number(score) || 80,
        questionsCount: Number(questionsCount) || (transcript ? transcript.length : 1),
        feedbackSummary: feedbackSummary || 'Completed AI Mock Interview session with constructive scoring.',
        category: category || 'Comprehensive Mix',
        difficulty: difficulty || 'Intermediate',
        transcript: transcript || []
      });

      // Update User profile readiness metrics
      try {
        const user = await User.findById(userId);
        if (user) {
          user.completedInterviewsCount = (user.completedInterviewsCount || 0) + 1;
          user.readinessScore = Math.min(98, Math.round(((user.readinessScore || 75) * 0.9) + (Number(score) * 0.1)));
          await user.save();
        }
      } catch (userErr) {
        console.warn('Failed to update user readiness metric:', userErr.message);
      }
    } else {
      savedSession = {
        _id: `sess-${Date.now()}`,
        role: role || 'Software Engineering',
        score: Number(score) || 80,
        questionsCount: Number(questionsCount) || (transcript ? transcript.length : 1),
        feedbackSummary: feedbackSummary || 'Completed AI Mock Interview session with constructive scoring.',
        category: category || 'Comprehensive Mix',
        difficulty: difficulty || 'Intermediate',
        transcript: transcript || [],
        createdAt: new Date()
      };
    }

    res.status(201).json({
      success: true,
      message: 'Interview session saved successfully',
      session: savedSession
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    let history = (isDbConnected() && userId) ? await InterviewSession.find({ userId }).sort({ createdAt: -1 }) : [];

    if (history.length === 0) {
      history = [
        {
          _id: 'sess-102',
          role: 'Senior Full Stack Engineer',
          overallScore: 88,
          questionsCount: 5,
          feedbackSummary: 'Excellent technical depth on System Design & Microservices; STAR structure well utilized.',
          createdAt: new Date()
        },
        {
          _id: 'sess-101',
          role: 'Backend Architect',
          overallScore: 78,
          questionsCount: 4,
          feedbackSummary: 'Good technical understanding; incorporate more metrics and trade-off analysis in coding solutions.',
          createdAt: new Date(Date.now() - 86400000 * 2)
        }
      ];
    }

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};
