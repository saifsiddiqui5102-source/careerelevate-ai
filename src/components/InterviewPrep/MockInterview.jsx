import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, Play, CheckCircle2, RotateCcw, Sparkles, 
  MessageSquare, Award, ArrowRight, ArrowLeft, Clock, AlertTriangle, 
  FileText, Check, ChevronDown, ChevronUp, RefreshCw, BarChart2, Star, HelpCircle, XCircle
} from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../../utils/speechHelper';
import { QUESTION_BANK } from '../../data/questionBankData';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { recordQuestionPracticed } from '../../utils/dashboardMetrics';
import confetti from 'canvas-confetti';

const AVAILABLE_ROLES = [
  'Software Engineering',
  'Frontend Developer',
  'Backend Developer',
  'Fresher / Entry-Level',
  'Product Management',
  'Data Science',
  'DevOps & Cloud'
];

const AVAILABLE_CATEGORIES = [
  'Comprehensive Mix',
  'Technical',
  'Coding & Algorithms',
  'Behavioral (STAR)',
  'HR & Culture Fit',
  'System Design',
  'Role-Specific'
];

const AVAILABLE_DIFFICULTIES = [
  'All Difficulties',
  'Entry-Level',
  'Intermediate',
  'Senior'
];

export default function MockInterview({ onNavigateToQuestions }) {
  const { addInterviewSession } = useAuth();

  // Setup / Configuration state
  const [selectedRole, setSelectedRole] = useState('Software Engineering');
  const [selectedCategory, setSelectedCategory] = useState('Comprehensive Mix');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [questionCount, setQuestionCount] = useState(3);

  // Active session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Per-question candidate input and evaluations
  // answers: { [index]: { text: string, evaluation: object | null } }
  const [answersMap, setAnswersMap] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Speech & AI evaluation states
  const [isRecording, setIsRecording] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState('');

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    const rec = createSpeechRecognizer(
      (transcript) => {
        setCurrentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setValidationError('');
      },
      (err) => {
        console.warn('Speech Recognition notice:', err);
        setIsRecording(false);
      }
    );
    setRecognizer(rec);

    return () => {
      stopSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (sessionActive && !sessionCompleted) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionActive, sessionCompleted]);

  // Format Timer mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filter available questions based on setup selections
  const getFilteredQuestions = () => {
    let list = QUESTION_BANK.filter((q) => {
      const roleMatch = selectedRole === 'Software Engineering'
        ? (q.role === 'Software Engineering' || q.role === 'Frontend Developer' || q.role === 'Backend Developer')
        : q.role === selectedRole;

      const categoryMatch = selectedCategory === 'Comprehensive Mix'
        ? true
        : selectedCategory === 'Role-Specific'
        ? (q.role === selectedRole)
        : q.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const difficultyMatch = selectedDifficulty === 'All Difficulties'
        ? true
        : q.difficulty === selectedDifficulty;

      return roleMatch && categoryMatch && difficultyMatch;
    });

    // Fallback if filter is too narrow
    if (list.length === 0) {
      list = QUESTION_BANK.filter((q) => q.role === selectedRole || q.role === 'Software Engineering');
    }

    if (list.length === 0) {
      list = QUESTION_BANK;
    }

    return list.slice(0, questionCount);
  };

  // Start Interview Session
  const handleStartSession = () => {
    const selected = getFilteredQuestions();
    setQuestionsList(selected);
    setCurrentIndex(0);
    setAnswersMap({});
    setCurrentAnswer('');
    setValidationError('');
    setEvalError('');
    setShowHints(false);
    setShowSampleAnswer(false);
    setSecondsElapsed(0);
    setSessionCompleted(false);
    setSessionActive(true);

    if (audioEnabled && selected[0]) {
      speakText(selected[0].question);
    }
  };

  const currentQuestion = questionsList[currentIndex] || null;
  const currentEntry = answersMap[currentIndex] || { text: '', evaluation: null };

  // Audio Toggle
  const handleToggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      if (currentQuestion) {
        speakText(currentQuestion.question);
      }
    }
  };

  // Voice Input Toggle
  const handleToggleRecording = () => {
    if (!recognizer) {
      alert('Speech Recognition is not active in this browser. You can type your answer in the text area!');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      try {
        recognizer.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  };

  // Evaluate Answer via API or local fallback
  const handleEvaluateAnswer = async () => {
    const answerToEval = currentAnswer.trim();
    if (!answerToEval || answerToEval.split(/\s+/).length < 3) {
      setValidationError('Please provide a substantive answer (at least 3-5 words) before submitting.');
      return;
    }

    setValidationError('');
    setEvalError('');
    setIsEvaluating(true);
    stopSpeech();
    if (isRecording && recognizer) {
      recognizer.stop();
      setIsRecording(false);
    }

    try {
      const response = await api.evaluateMockAnswer({
        question: currentQuestion.question,
        candidateAnswer: answerToEval,
        role: selectedRole,
        difficulty: currentQuestion.difficulty || selectedDifficulty,
        category: currentQuestion.category || selectedCategory
      });

      if (response && response.success && response.evaluation) {
        setAnswersMap((prev) => ({
          ...prev,
          [currentIndex]: {
            text: answerToEval,
            evaluation: response.evaluation
          }
        }));

        recordQuestionPracticed(currentQuestion.id);

        if (response.evaluation.score >= 85) {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
        }
      } else {
        throw new Error('Evaluation service response invalid');
      }
    } catch (err) {
      console.warn('Evaluation fallback triggered:', err.message);
      const words = answerToEval.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const lower = answerToEval.toLowerCase();
      const hasMetrics = /\b(\d+(\.\d+)?%|\$\d+|₹\d+|\d+\s*(ms|seconds|minutes|users|req|k|m|million|lpa))\b/gi.test(answerToEval);
      const techHits = ['architecture', 'api', 'database', 'system', 'scale', 'latency', 'cache', 'security', 'state', 'component'].filter(k => lower.includes(k)).length;
      const starHits = ['situation', 'task', 'action', 'result', 'because', 'implemented', 'achieved', 'led'].filter(k => lower.includes(k)).length;

      const clarityScore = Math.min(95, Math.max(50, wordCount >= 35 ? 84 : 65));
      const techDepthScore = Math.min(95, Math.max(50, 65 + techHits * 6 + (hasMetrics ? 8 : 0)));
      const starScore = Math.min(95, Math.max(50, 60 + starHits * 7 + (hasMetrics ? 10 : 0)));
      const relevanceScore = wordCount >= 25 ? 85 : 65;
      const score = Math.round((clarityScore * 0.25) + (techDepthScore * 0.3) + (starScore * 0.25) + (relevanceScore * 0.2));

      const fallbackEvaluation = {
        score,
        clarityScore,
        techDepthScore,
        starScore,
        relevanceScore,
        feedback: score >= 80
          ? 'Strong response with good technical context. Expand on measurable impact to reach 95%+.'
          : 'Good foundation. Structure with the STAR framework and elaborate on specific technical trade-offs.',
        keyStrengths: [
          'Directly responded to the question prompt',
          wordCount >= 30 ? 'Provided adequate context and explanation' : 'Clear communication tone'
        ],
        weaknesses: [
          !hasMetrics ? 'Include concrete metrics or quantifiable benchmarks' : 'Elaborate on technical alternatives considered'
        ],
        improvementTip: 'Mention specific business outcomes or engineering KPIs (e.g. latency, error rate, throughput).',
        sampleAnswer: currentQuestion.sampleAnswer || 'Explain context, describe your action, and quantify the result.',
        evaluatedBy: 'Local Semantic Heuristics Engine (Offline Fallback)'
      };

      setAnswersMap((prev) => ({
        ...prev,
        [currentIndex]: {
          text: answerToEval,
          evaluation: fallbackEvaluation
        }
      }));

      recordQuestionPracticed(currentQuestion.id);
      setEvalError('Cloud AI service busy; evaluated using local semantic heuristic benchmarks.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Navigate to Next Question
  const handleNextQuestion = () => {
    stopSpeech();
    if (currentIndex + 1 < questionsList.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextStored = answersMap[nextIdx];
      setCurrentAnswer(nextStored ? nextStored.text : '');
      setValidationError('');
      setEvalError('');
      setShowHints(false);
      setShowSampleAnswer(false);

      if (audioEnabled && questionsList[nextIdx]) {
        speakText(questionsList[nextIdx].question);
      }
    } else {
      // Completed all questions
      handleFinishSession();
    }
  };

  // Navigate to Previous Question
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      stopSpeech();
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevStored = answersMap[prevIdx];
      setCurrentAnswer(prevStored ? prevStored.text : '');
      setValidationError('');
      setEvalError('');
      setShowHints(false);
      setShowSampleAnswer(false);

      if (audioEnabled && questionsList[prevIdx]) {
        speakText(questionsList[prevIdx].question);
      }
    }
  };

  // Finish Interview Session and compile Final Report
  const handleFinishSession = async () => {
    stopSpeech();
    setSessionCompleted(true);

    // Calculate aggregated metrics from actually evaluated questions
    const evaluatedEntries = Object.values(answersMap).filter((e) => e && e.evaluation);
    const answeredCount = evaluatedEntries.length;
    const unansweredCount = questionsList.length - answeredCount;
    const avgScore = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((sum, e) => sum + e.evaluation.score, 0) / answeredCount)
      : 0;

    const transcript = questionsList.map((q, idx) => {
      const entry = answersMap[idx];
      return {
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        userAnswer: entry ? entry.text : 'Unanswered / Skipped',
        score: entry?.evaluation?.score || 0,
        clarityScore: entry?.evaluation?.clarityScore || 0,
        techDepthScore: entry?.evaluation?.techDepthScore || 0,
        starScore: entry?.evaluation?.starScore || 0,
        relevanceScore: entry?.evaluation?.relevanceScore || 0,
        aiFeedback: entry?.evaluation?.feedback || 'Question was skipped or left unanswered.',
        keyStrengths: entry?.evaluation?.keyStrengths || [],
        weaknesses: entry?.evaluation?.weaknesses || [],
        improvementTip: entry?.evaluation?.improvementTip || ''
      };
    });

    const sessionPayload = {
      id: `sess-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      role: selectedRole,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      score: avgScore,
      overallScore: avgScore,
      questionsCount: questionsList.length,
      answeredCount,
      unansweredCount,
      durationSeconds: secondsElapsed,
      feedbackSummary: avgScore >= 80
        ? `High-performing mock interview for ${selectedRole}. Candidate demonstrated structured domain reasoning and actionable technical depth.`
        : avgScore >= 60
        ? `Completed mock interview for ${selectedRole}. Incorporate more quantifiable metrics and STAR method formatting for maximum impact.`
        : `Completed mock interview for ${selectedRole}. Recommended to practice fundamental concepts and review benchmark answers.`,
      transcript
    };

    // Save to context & localStorage
    addInterviewSession(sessionPayload);

    // Sync with mock session history for toolkit & dashboard
    try {
      const local = JSON.parse(localStorage.getItem('careerelevate_mock_sessions') || '[]');
      localStorage.setItem('careerelevate_mock_sessions', JSON.stringify([sessionPayload, ...local].slice(0, 30)));
    } catch (e) {}

    // Persist to backend database
    try {
      await api.saveInterviewSession(sessionPayload);
    } catch (err) {
      console.warn('Backend interview save note:', err.message);
    }

    if (avgScore >= 80) {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Restart Session Handler
  const handleRestart = () => {
    stopSpeech();
    setSessionActive(false);
    setSessionCompleted(false);
    setCurrentIndex(0);
    setAnswersMap({});
    setCurrentAnswer('');
    setSecondsElapsed(0);
  };

  // Metric calculation for final report
  const calculateFinalMetrics = () => {
    const evaluatedEntries = Object.values(answersMap).filter((e) => e && e.evaluation);
    const answeredCount = evaluatedEntries.length;
    const unansweredCount = questionsList.length - answeredCount;
    const count = answeredCount || 1;

    const avgScore = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((s, e) => s + e.evaluation.score, 0) / count)
      : 0;
    const avgClarity = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((s, e) => s + e.evaluation.clarityScore, 0) / count)
      : 0;
    const avgTech = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((s, e) => s + e.evaluation.techDepthScore, 0) / count)
      : 0;
    const avgStar = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((s, e) => s + e.evaluation.starScore, 0) / count)
      : 0;
    const avgRelevance = answeredCount > 0
      ? Math.round(evaluatedEntries.reduce((s, e) => s + e.evaluation.relevanceScore, 0) / count)
      : 0;

    return { avgScore, avgClarity, avgTech, avgStar, avgRelevance, answeredCount, unansweredCount };
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-2xl mb-8">
      
      {/* ======================================================== */}
      {/* 1. HEADER SECTION                                        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-white">AI Mock Interview Simulator</h2>
              <p className="text-xs text-slate-400">
                Interactive real-time interview simulator with voice synthesis, speech-to-text, and multidimensional AI scoring.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Voice Toggle */}
        <div className="flex items-center gap-3">
          {sessionActive && !sessionCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>
          )}

          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition-all ${
              audioEnabled 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={audioEnabled ? 'Voice Prompts Enabled' : 'Voice Prompts Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {sessionActive && (
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Restart Interview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. SETUP & CONFIGURATION SCREEN (When inactive)          */}
      {/* ======================================================== */}
      {!sessionActive && !sessionCompleted && (
        <div className="max-w-3xl mx-auto space-y-6 py-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-white mb-2">Configure Your Practice Session</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customize your mock interview parameters. Our AI will evaluate your answers against industry standards and provide actionable feedback.
              </p>
            </div>

            {/* Form Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Role Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Job Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Interview Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {AVAILABLE_DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              {/* Question Count Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Question Count
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        questionCount === num
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {num} {num === 3 ? 'Quick' : num === 5 ? 'Standard' : 'Full'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Highlights Banner */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-center text-xs">
              <div>
                <span className="font-bold text-indigo-400 block mb-0.5">Voice Enabled</span>
                <span className="text-[11px] text-slate-400">Microphone speech input & audio playback</span>
              </div>
              <div className="border-x border-slate-800 px-2">
                <span className="font-bold text-emerald-400 block mb-0.5">4-Pillar AI Scoring</span>
                <span className="text-[11px] text-slate-400">Clarity, Tech Depth, STAR, Relevance</span>
              </div>
              <div>
                <span className="font-bold text-cyan-400 block mb-0.5">Detailed Report</span>
                <span className="text-[11px] text-slate-400">Full session review saved to dashboard</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2 text-center">
              <button
                onClick={handleStartSession}
                className="btn-primary font-bold text-sm px-8 py-3.5 shadow-xl shadow-indigo-600/40 w-full sm:w-auto"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Mock Interview ({questionCount} Questions)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTIVE INTERVIEW SESSION                              */}
      {/* ======================================================== */}
      {sessionActive && !sessionCompleted && currentQuestion && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">
                Question <span className="text-indigo-400 font-black">{currentIndex + 1}</span> of {questionsList.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                  {currentQuestion.category}
                </span>
                <span className="text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questionsList.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative overflow-hidden space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  {currentQuestion.role} • {currentQuestion.topic || 'Interview Prompt'}
                </span>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-white leading-relaxed">
                  "{currentQuestion.question}"
                </h3>
              </div>

              {/* Re-read question aloud */}
              <button
                onClick={() => speakText(currentQuestion.question)}
                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors shrink-0 border border-indigo-500/30"
                title="Listen to question"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Hints & STAR Guide Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHints ? 'Hide Hints & Guidance' : 'View Hints & STAR Guidance'}</span>
                {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Expandable Hints Container */}
            {showHints && (
              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20 text-xs space-y-2 animate-in fade-in duration-200">
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <div>
                    <span className="font-bold text-indigo-300 block mb-1">Key Talking Points:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {currentQuestion.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {currentQuestion.starGuide && (
                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    <span className="font-bold text-emerald-400">💡 STAR Tip: </span>
                    {currentQuestion.starGuide.situation || currentQuestion.starGuide.action}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Response Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <span>Your Answer</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0} words)
                </span>
              </label>

              {/* Mic Speech Button */}
              <button
                onClick={handleToggleRecording}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{isRecording ? 'Listening (Click to Stop)...' : 'Voice Input'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Speak aloud using the microphone or type your response here... Structure your answer with clear context, specific actions you took, and measurable results."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-white focus:outline-none transition-colors leading-relaxed resize-y"
            />

            {/* Validation Message */}
            {validationError && (
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Eval Error / Notice */}
            {evalError && (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                {evalError}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  className="btn-secondary text-xs py-2 px-3.5 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentAnswer && (
                  <button
                    onClick={() => setCurrentAnswer('')}
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                  >
                    Clear Text
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!currentEntry.evaluation && (
                  <button
                    onClick={handleNextQuestion}
                    className="btn-secondary text-xs py-2.5 px-4 font-bold text-slate-400 hover:text-white"
                    title={currentAnswer.trim() ? 'Skip evaluating and proceed' : 'Skip this question'}
                  >
                    <span>{currentIndex + 1 === questionsList.length ? 'Skip & Finish' : 'Skip Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={handleEvaluateAnswer}
                  disabled={isEvaluating || !currentAnswer.trim()}
                  className="btn-primary text-xs py-2.5 px-5 font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentEntry.evaluation ? 'Re-evaluate Answer' : 'Submit & Get AI Score'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Score & Feedback Card */}
          {currentEntry.evaluation && (
            <div className="bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl font-heading font-black text-2xl flex items-center justify-center border shadow-lg ${
                    currentEntry.evaluation.score >= 80 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : currentEntry.evaluation.score >= 65
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {currentEntry.evaluation.score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">AI Candidate Score</h4>
                      <span className="text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                        {currentEntry.evaluation.evaluatedBy || 'AI Engine'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{currentEntry.evaluation.feedback}</p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="btn-primary text-xs py-2 px-4 font-bold shrink-0"
                >
                  <span>{currentIndex + 1 === questionsList.length ? 'Finish & View Report' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Score Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Clarity</span>
                  <span className="text-sm font-black text-indigo-400">{currentEntry.evaluation.clarityScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Tech Depth</span>
                  <span className="text-sm font-black text-violet-400">{currentEntry.evaluation.techDepthScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">STAR Method</span>
                  <span className="text-sm font-black text-emerald-400">{currentEntry.evaluation.starScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Relevance</span>
                  <span className="text-sm font-black text-cyan-400">{currentEntry.evaluation.relevanceScore}%</span>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {currentEntry.evaluation.keyStrengths && currentEntry.evaluation.keyStrengths.length > 0 && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Key Strengths:</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {currentEntry.evaluation.keyStrengths.map((str, i) => (
                        <li key={i}>• {str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEntry.evaluation.weaknesses && currentEntry.evaluation.weaknesses.length > 0 && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Areas for Improvement:</span>
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {currentEntry.evaluation.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Improvement Tip */}
              {currentEntry.evaluation.improvementTip && (
                <div className="bg-indigo-600/10 border border-indigo-500/30 p-3 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">High-Impact Suggestion:</span>
                    <span>{currentEntry.evaluation.improvementTip}</span>
                  </div>
                </div>
              )}

              {/* Benchmark Answer Reveal */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                  className="text-xs font-bold text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showSampleAnswer ? 'Hide 10/10 Benchmark Answer' : 'Reveal 10/10 Benchmark Answer'}</span>
                  {showSampleAnswer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showSampleAnswer && (
                  <div className="mt-2 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line animate-in fade-in duration-200">
                    {currentQuestion.sampleAnswer || currentEntry.evaluation.sampleAnswer}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Finish Early option */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleFinishSession}
              className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
            >
              Finish Interview Early & View Summary
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FINAL INTERVIEW REPORT SCREEN                         */}
      {/* ======================================================== */}
      {sessionCompleted && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Banner */}
          {(() => {
            const metrics = calculateFinalMetrics();
            return (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6 text-center md:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className={`w-24 h-24 rounded-3xl font-heading font-black text-4xl flex items-center justify-center border shadow-xl ${
                      metrics.avgScore >= 80 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                        : metrics.avgScore >= 65
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400'
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                    }`}>
                      {metrics.avgScore}%
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                        Mock Interview Assessment Report
                      </span>
                      <h3 className="font-heading font-extrabold text-2xl text-white">
                        {metrics.avgScore >= 80 ? '🎉 Exceptional Performance!' : metrics.avgScore >= 65 ? '👍 Solid Foundation!' : '📈 Practice Recommended'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        {selectedRole} • {questionsList.length} Questions • {formatTime(secondsElapsed)} Session Duration
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRestart}
                      className="btn-primary text-xs py-2.5 px-4 font-bold shadow-md shadow-indigo-600/30"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Practice Again</span>
                    </button>
                    {onNavigateToQuestions && (
                      <button
                        onClick={onNavigateToQuestions}
                        className="btn-secondary text-xs py-2.5 px-4 font-bold"
                      >
                        <span>Question Bank</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Avg Clarity</span>
                    <span className="text-lg font-black text-indigo-400">{metrics.avgClarity}%</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Tech Depth</span>
                    <span className="text-lg font-black text-violet-400">{metrics.avgTech}%</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">STAR Method</span>
                    <span className="text-lg font-black text-emerald-400">{metrics.avgStar}%</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Completion</span>
                    <span className="text-sm font-black text-cyan-400">
                      {metrics.answeredCount} Answered {metrics.unansweredCount > 0 ? `(${metrics.unansweredCount} Skipped)` : '• 100% Complete'}
                    </span>
                  </div>
                </div>

                {/* Improvement Recommendations Banner */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-indigo-500/30 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Interview Performance Diagnosis & Recommendations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <div className="space-y-1">
                      <strong className="text-emerald-400 block">• Primary Readiness Status:</strong>
                      <p className="text-slate-400 leading-relaxed">
                        {metrics.avgScore >= 80
                          ? `Excellent demonstration of technical and behavioral competency for ${selectedRole}. Ready for recruiter screenings.`
                          : metrics.avgScore >= 60
                          ? `Demonstrates good potential for ${selectedRole}. Focus on quantifying technical outcomes with concrete percentages and timelines.`
                          : `Needs targeted preparation. Practice answering using the STAR method (Situation, Task, Action, Result) and study the model answers.`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-amber-400 block">• Recommended Next Steps:</strong>
                      <p className="text-slate-400 leading-relaxed">
                        {metrics.unansweredCount > 0
                          ? `You left ${metrics.unansweredCount} question(s) unattempted. Review the benchmark answers below to prepare complete responses.`
                          : metrics.avgStar < 75
                          ? 'Strengthen your behavioral examples with measurable results (e.g. latency reduced by 30%, revenue boosted by 15%).'
                          : 'Practice speaking your answers aloud without pauses to build natural interview pacing and vocal confidence.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Detailed Review */}
                <div className="space-y-4 pt-2">
                  <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" />
                    <span>Detailed Question-by-Question Breakdown</span>
                  </h4>

                  <div className="space-y-3">
                    {questionsList.map((q, idx) => {
                      const ans = answersMap[idx];
                      const evalData = ans?.evaluation;
                      return (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">
                                Question {idx + 1} • {q.category}
                              </span>
                              <h5 className="text-sm font-bold text-white">{q.question}</h5>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                              evalData?.score >= 80
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : evalData?.score >= 60
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {evalData ? `${evalData.score}% Score` : 'Skipped'}
                            </span>
                          </div>

                          {/* Candidate Answer */}
                          <div className="bg-slate-900/80 p-3 rounded-lg text-xs text-slate-300">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Your Submitted Answer:</span>
                            <p className="italic">{ans?.text || 'No answer submitted for this question.'}</p>
                          </div>

                          {/* AI Feedback */}
                          {evalData && (
                            <div className="text-xs text-slate-400">
                              <span className="font-bold text-slate-300">Feedback: </span>
                              <span>{evalData.feedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Return controls */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Session history automatically synced with your Career Dashboard.</span>
                  </span>

                  <button
                    onClick={handleRestart}
                    className="btn-primary text-xs py-2 px-4 font-bold"
                  >
                    <span>Done & Exit Session</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
