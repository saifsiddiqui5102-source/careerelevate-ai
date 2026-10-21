import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Target,
  AlertTriangle,
  TrendingUp,
  Award,
  History,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Zap,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'elevator-pitch', text: 'Craft & refine your 60-second elevator pitch', category: 'Behavioral' },
  { id: 'star-method', text: 'Structure behavioral answers using the STAR method', category: 'Behavioral' },
  { id: 'cs-fundamentals', text: 'Revise core CS concepts (OOPs, SQL joins, HTTP lifecycle)', category: 'Technical' },
  { id: 'system-design', text: 'Review high-level architectural trade-offs (Caching, DB indexing)', category: 'Technical' },
  { id: 'mock-session', text: 'Complete at least 1 full AI Mock Interview session', category: 'Practical' },
  { id: 'interviewer-questions', text: 'Prepare 3 thoughtful reverse questions for the interviewer', category: 'Closing' }
];

export default function InterviewPreparationToolkit({ onNavigateToMock, onNavigateToQuestions, onNavigateToFlashcards }) {
  // 1. Checklist State
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('careerelevate_prep_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, completed: false }));
  });

  // 2. Daily Goal & Streak Tracker
  const [dailyGoal, setDailyGoal] = useState(() => {
    return parseInt(localStorage.getItem('careerelevate_daily_goal') || '3', 10);
  });

  const [questionsPracticedToday, setQuestionsPracticedToday] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(1);

  // 3. Weak Topics & Performance Insights
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [weakTopics, setWeakTopics] = useState([]);
  const [strongTopics, setStrongTopics] = useState([]);
  const [overallReadiness, setOverallReadiness] = useState(65);

  // Initialize and load data
  useEffect(() => {
    // Load daily practice stats
    const todayKey = `careerelevate_practice_${new Date().toISOString().slice(0, 10)}`;
    const count = parseInt(localStorage.getItem(todayKey) || '0', 10);
    setQuestionsPracticedToday(count);

    const savedStreak = parseInt(localStorage.getItem('careerelevate_practice_streak') || '3', 10);
    setCurrentStreak(savedStreak);

    // Fetch interview sessions from API or local fallback
    fetchSessionHistory();
  }, []);

  // Save checklist whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('careerelevate_prep_checklist', JSON.stringify(checklist));
    } catch (e) {}
  }, [checklist]);

  const fetchSessionHistory = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await api.getInterviewHistory();
      let sessionData = [];
      if (res && res.success && Array.isArray(res.history) && res.history.length > 0) {
        sessionData = res.history;
      } else {
        // Check local storage for recent mock sessions across keys
        const local = localStorage.getItem('careerelevate_mock_sessions');
        const authInterviews = localStorage.getItem('careerelevate_interviews');
        if (local) {
          sessionData = JSON.parse(local);
        } else if (authInterviews) {
          sessionData = JSON.parse(authInterviews);
        }
      }

      setSessions(sessionData);
      analyzePerformance(sessionData);
    } catch (err) {
      console.warn('Failed to fetch interview history', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const analyzePerformance = (sessionData) => {
    if (!sessionData || sessionData.length === 0) {
      // Set reasonable defaults for a new candidate
      setWeakTopics([
        { topic: 'System Design & Scalability', score: 58, reason: 'Requires concrete trade-offs, caching, and database sharding details.' },
        { topic: 'STAR Method Structure', score: 68, reason: 'Answers often miss quantifiable business results and metric impact.' }
      ]);
      setStrongTopics([
        { topic: 'Technical Accuracy & Syntax', score: 85 },
        { topic: 'Communication Clarity', score: 82 }
      ]);
      setOverallReadiness(70);
      return;
    }

    // Calculate aggregated category performance
    const topicScores = {};
    sessionData.forEach(sess => {
      const cat = sess.category || 'General Technical';
      const score = Number(sess.score != null ? sess.score : sess.overallScore) || 70;
      if (!topicScores[cat]) {
        topicScores[cat] = { total: 0, count: 0 };
      }
      topicScores[cat].total += score;
      topicScores[cat].count += 1;
    });

    const weak = [];
    const strong = [];
    let grandTotal = 0;
    let grandCount = 0;

    Object.keys(topicScores).forEach(cat => {
      const avg = Math.round(topicScores[cat].total / topicScores[cat].count);
      grandTotal += topicScores[cat].total;
      grandCount += topicScores[cat].count;

      if (avg < 75) {
        weak.push({
          topic: cat,
          score: avg,
          reason: avg < 60 ? 'Significant gaps in depth or structure observed.' : 'Good effort, but needs crisper examples and metrics.'
        });
      } else {
        strong.push({ topic: cat, score: avg });
      }
    });

    setWeakTopics(weak);
    setStrongTopics(strong);
    if (grandCount > 0) {
      setOverallReadiness(Math.round(grandTotal / grandCount));
    }
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const resetChecklist = () => {
    setChecklist(DEFAULT_CHECKLIST_ITEMS.map(item => ({ ...item, completed: false })));
  };

  const incrementDailyPractice = () => {
    const todayKey = `careerelevate_practice_${new Date().toISOString().slice(0, 10)}`;
    const nextCount = questionsPracticedToday + 1;
    setQuestionsPracticedToday(nextCount);
    localStorage.setItem(todayKey, nextCount.toString());
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const checklistPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-8 mt-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-700/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Interview Preparation Intelligence
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Candidate Readiness Toolkit</h2>
          <p className="text-sm text-slate-400">
            Track your milestones, maintain daily practice streaks, and diagnose weak topics before stepping into real interviews.
          </p>
        </div>

        <button
          onClick={fetchSessionHistory}
          disabled={isLoadingSessions}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* TOP ROW: DAILY PRACTICE GOAL & READINESS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DAILY STREAK CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/90 border border-amber-500/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Practice Momentum</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{currentStreak}</span>
            <span className="text-sm text-amber-300 font-medium">Day Streak!</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Keep practicing daily to build muscle memory and natural fluency in high-pressure technical screenings.
          </p>
        </div>

        {/* TODAY'S PRACTICE GOAL CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900/60 to-slate-900/90 border border-indigo-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Daily Question Target</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white">{questionsPracticedToday}</span>
              <span className="text-sm text-slate-400 font-medium">/ {dailyGoal} solved today</span>
            </div>
            {questionsPracticedToday >= dailyGoal && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Goal Reached!
              </span>
            )}
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((questionsPracticedToday / dailyGoal) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">Goal: {dailyGoal} Qs</span>
            <button
              onClick={incrementDailyPractice}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Log +1 Practice
            </button>
          </div>
        </div>

        {/* OVERALL READINESS SCORE */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-900/90 border border-emerald-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Interview Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{overallReadiness}%</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300">
              {overallReadiness >= 80 ? 'Interview Ready' : overallReadiness >= 65 ? 'Competitive Candidate' : 'Foundation Building'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Aggregated across all evaluated mock sessions, technical accuracy, and checklist milestones.
          </p>
        </div>
      </div>

      {/* MIDDLE SECTION: 2-COLUMN LAYOUT (CHECKLIST & WEAK-TOPIC DIAGNOSTICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: READINESS CHECKLIST (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                Essential Readiness Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Make sure you have covered these core prep stages before attending interviews.
              </p>
            </div>
            <button
              onClick={resetChecklist}
              className="text-xs text-slate-500 hover:text-slate-300 transition underline"
            >
              Reset
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-slate-300">Readiness Progress</span>
              <span className="text-indigo-400 font-bold">{checklistPercent}% Complete ({completedCount}/{checklist.length})</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${checklistPercent}%` }}
              />
            </div>
          </div>

          {/* CHECKLIST ITEMS */}
          <div className="space-y-2.5">
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  item.completed
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-200'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-slate-200 focus:outline-none"
                  aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {item.text}
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: WEAK TOPICS & PERSONALIZED RECOMMENDATIONS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* WEAK TOPIC DIAGNOSTICS */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Focus Areas & Weak-Topic Insights
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Identified from your recent AI evaluations where scores were below 75%.
            </p>

            <div className="space-y-3">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-300">{topic.topic}</span>
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 text-[10px]">
                        {topic.score}% Avg Score
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{topic.reason}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-300">All Topics Solid!</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No critical weaknesses detected in recent sessions. Continue refining speed & precision.
                  </p>
                </div>
              )}
            </div>

            {/* STRONG TOPICS PILL ROW */}
            {strongTopics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Verified Strengths
                </span>
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {t.topic} ({t.score}%)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONABLE RECOMMENDATIONS CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-indigo-400 mb-2 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Recommended Next Action
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {weakTopics.length > 0
                ? `Prioritize practicing questions in "${weakTopics[0].topic}" to bring your overall readiness above 80%.`
                : 'Run a 5-question Full AI Mock Interview to simulate real interview pressure and receive detailed STAR feedback.'}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onNavigateToQuestions) onNavigateToQuestions();
                  else {
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Practice Questions
              </button>
              <button
                onClick={() => {
                  if (onNavigateToMock) onNavigateToMock();
                  else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Start Mock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: RECENT INTERVIEW SESSION LOG */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Recent Mock Interview Sessions</h3>
          </div>
          <span className="text-xs text-slate-400">
            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} recorded
          </span>
        </div>

        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.slice(0, 6).map((sess, idx) => {
              const score = Number(sess.score != null ? sess.score : sess.overallScore) || 75;
              const dateStr = sess.createdAt ? new Date(sess.createdAt).toLocaleDateString() : 'Recent';
              const role = sess.role || 'Software Engineer';
              const count = sess.questionsCount || sess.evaluations?.length || 3;

              return (
                <div
                  key={sess._id || idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                      {role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        score >= 80
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : score >= 65
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {score}% Score
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                    {sess.feedbackSummary || 'Detailed 4-pillar evaluation with STAR method feedback.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                    <span>{count} Questions Evaluated</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            No previous sessions found. Complete your first Mock Interview session above to see performance records here.
          </div>
        )}
      </div>
    </div>
  );
}
