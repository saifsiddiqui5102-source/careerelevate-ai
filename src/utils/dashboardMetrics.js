/**
 * dashboardMetrics.js
 * Central utility for computing all dashboard metrics from real application data.
 * All calculations are rule-based (not AI). Sources are documented per function.
 */

// ─── READINESS SCORE ──────────────────────────────────────────────────────────
/**
 * Computes a transparent Career Readiness Score (0–100).
 *
 * Weights (total = 100):
 *   • Latest ATS Resume Score     → 35 pts  (source: atsAnalyzer.js overallScore)
 *   • Average Interview Score      → 30 pts  (source: AuthContext interviewHistory)
 *   • Questions Practiced (capped) → 15 pts  (source: localStorage careerelevate_practice_*)
 *   • Flashcards Mastered (capped) → 10 pts  (source: localStorage careerelevate_flashcards_status)
 *   • Preparation Streak (capped)  → 10 pts  (source: localStorage careerelevate_practice_streak)
 *
 * Returns { score, breakdown, grade, label }
 */
export function computeReadinessScore({ atsScore, interviewHistory, questionsPracticed, flashcardsMastered, streak }) {
  const atsComponent    = atsScore != null    ? (atsScore / 100) * 35           : 0;
  const avgInterview    = interviewHistory && interviewHistory.length > 0
    ? interviewHistory.reduce((s, i) => s + (Number(i.score) || Number(i.overallScore) || 0), 0) / interviewHistory.length
    : null;
  const interviewComp   = avgInterview != null ? (avgInterview / 100) * 30      : 0;
  const qPct            = Math.min(1, (questionsPracticed || 0) / 30);          // 30 = "full" target
  const questionsComp   = qPct * 15;
  const fcPct           = Math.min(1, (flashcardsMastered || 0) / 20);          // 20 flashcards total
  const flashcardsComp  = fcPct * 10;
  const streakPct       = Math.min(1, (streak || 0) / 7);                       // 7-day streak = full
  const streakComp      = streakPct * 10;

  const score = Math.round(atsComponent + interviewComp + questionsComp + flashcardsComp + streakComp);

  const breakdown = [
    { label: 'Resume ATS Score',         weight: 35, earned: Math.round(atsComponent),   hasData: atsScore != null,    tip: 'Run a resume analysis to contribute up to 35 points.' },
    { label: 'Interview Performance',    weight: 30, earned: Math.round(interviewComp),  hasData: avgInterview != null, tip: 'Complete mock interviews to contribute up to 30 points.' },
    { label: 'Questions Practiced',      weight: 15, earned: Math.round(questionsComp),  hasData: questionsPracticed > 0, tip: 'Practice 30 questions to earn full 15 points.' },
    { label: 'Flashcards Mastered',      weight: 10, earned: Math.round(flashcardsComp), hasData: flashcardsMastered > 0, tip: 'Master 20 flashcards to earn full 10 points.' },
    { label: 'Preparation Streak',       weight: 10, earned: Math.round(streakComp),     hasData: streak > 0,           tip: 'Maintain a 7-day streak to earn full 10 points.' },
  ];

  let grade = 'F';
  let label = 'Getting Started';
  if (score >= 85) { grade = 'A'; label = 'Interview Ready'; }
  else if (score >= 70) { grade = 'B'; label = 'Competitive Candidate'; }
  else if (score >= 55) { grade = 'C'; label = 'Foundation Building'; }
  else if (score >= 35) { grade = 'D'; label = 'Early Stage'; }

  return { score, breakdown, grade, label };
}

// ─── QUESTIONS PRACTICED ──────────────────────────────────────────────────────
/** Reads completed question IDs from localStorage. Returns count. */
export function getQuestionsPracticed() {
  try {
    const raw = localStorage.getItem('careerelevate_completed_questions');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

/** Reads today's practice count from localStorage. */
export function getTodayQuestionsPracticed() {
  try {
    const key = `careerelevate_practice_${new Date().toISOString().slice(0, 10)}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  } catch { return 0; }
}

/**
 * Records a practiced question by ID.
 * - Adds to careerelevate_completed_questions and careerelevate_qb_completed (no duplicates)
 * - Increments careerelevate_practice_YYYY-MM-DD for today
 * - Updates careerelevate_practice_streak
 */
export function recordQuestionPracticed(questionId) {
  try {
    // 1. Add question ID to completed sets
    if (questionId) {
      const raw = localStorage.getItem('careerelevate_completed_questions');
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(questionId)) {
        list.push(questionId);
        localStorage.setItem('careerelevate_completed_questions', JSON.stringify(list));
      }

      const rawQb = localStorage.getItem('careerelevate_qb_completed');
      const qbList = rawQb ? JSON.parse(rawQb) : [];
      if (!qbList.includes(questionId)) {
        qbList.push(questionId);
        localStorage.setItem('careerelevate_qb_completed', JSON.stringify(qbList));
      }
    }

    // 2. Increment today's count
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayKey = `careerelevate_practice_${todayStr}`;
    const currentTodayCount = parseInt(localStorage.getItem(todayKey) || '0', 10);
    localStorage.setItem(todayKey, String(currentTodayCount + 1));

    // 3. Update streak
    const lastDate = localStorage.getItem('careerelevate_last_practice_date');
    const currentStreak = parseInt(localStorage.getItem('careerelevate_practice_streak') || '0', 10);

    if (!lastDate) {
      localStorage.setItem('careerelevate_practice_streak', '1');
      localStorage.setItem('careerelevate_last_practice_date', todayStr);
    } else if (lastDate !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastDate === yesterdayStr) {
        localStorage.setItem('careerelevate_practice_streak', String(currentStreak + 1));
      } else {
        localStorage.setItem('careerelevate_practice_streak', '1');
      }
      localStorage.setItem('careerelevate_last_practice_date', todayStr);
    }
  } catch (err) {
    console.warn('Failed to record question practice in localStorage:', err);
  }
}

// ─── FLASHCARDS MASTERED ──────────────────────────────────────────────────────
/** Returns count of cards marked "known" from localStorage. */
export function getFlashcardsMastered() {
  try {
    const raw = localStorage.getItem('careerelevate_flashcards_status');
    const map = raw ? JSON.parse(raw) : {};
    return Object.values(map).filter(v => v === 'known').length;
  } catch { return 0; }
}

// ─── STREAK ───────────────────────────────────────────────────────────────────
export function getPracticeStreak() {
  return parseInt(localStorage.getItem('careerelevate_practice_streak') || '0', 10);
}

// ─── ATS HISTORY ─────────────────────────────────────────────────────────────
/**
 * Returns array of { date, score, title } from localStorage.
 * Written by App.jsx when user runs an analysis (see saveAnalysisHistory).
 */
export function getAtsHistory() {
  try {
    const raw = localStorage.getItem('careerelevate_ats_history');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Append a new ATS analysis result to history. Called from App.jsx on analysis completion. */
export function saveAnalysisToHistory(score, title) {
  try {
    const history = getAtsHistory();
    const entry = {
      date: new Date().toISOString(),
      score: Math.round(score),
      title: title || 'Resume Analysis',
    };
    const updated = [entry, ...history].slice(0, 20); // keep last 20
    localStorage.setItem('careerelevate_ats_history', JSON.stringify(updated));
    return updated;
  } catch { return []; }
}

// ─── WEEKLY GOALS ─────────────────────────────────────────────────────────────
export const DEFAULT_WEEKLY_GOALS = {
  interviews: 3,
  questions: 15,
  flashcards: 10,
};

export function getWeeklyGoals() {
  try {
    const raw = localStorage.getItem('careerelevate_weekly_goals');
    return raw ? { ...DEFAULT_WEEKLY_GOALS, ...JSON.parse(raw) } : { ...DEFAULT_WEEKLY_GOALS };
  } catch { return { ...DEFAULT_WEEKLY_GOALS }; }
}

export function saveWeeklyGoals(goals) {
  try { localStorage.setItem('careerelevate_weekly_goals', JSON.stringify(goals)); } catch { /* noop */ }
}

/**
 * Computes this week's progress (Mon–Sun).
 * interviewHistory comes from AuthContext.
 */
export function computeWeeklyProgress(interviewHistory) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  // Interviews this week
  const interviewsThisWeek = (interviewHistory || []).filter(s => {
    const d = new Date(s.date || s.createdAt);
    return d >= monday;
  }).length;

  // Questions this week (sum of daily keys)
  let questionsThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d > now) break;
    const key = `careerelevate_practice_${d.toISOString().slice(0, 10)}`;
    questionsThisWeek += parseInt(localStorage.getItem(key) || '0', 10);
  }

  // Flashcards reviewed this week (approximate from mastered count — no per-day tracking yet)
  const flashcardsMastered = getFlashcardsMastered();

  return { interviewsThisWeek, questionsThisWeek, flashcardsMastered };
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
/**
 * Builds a chronological activity log from real data sources:
 * - ATS history
 * - Interview history
 * No hardcoded fake entries.
 */
export function buildActivityLog(interviewHistory, atsHistory) {
  const events = [];

  (interviewHistory || []).forEach(s => {
    const d = s.date || s.createdAt;
    if (!d) return;
    events.push({
      id: `interview-${s.id || s._id || Math.random()}`,
      type: 'interview_completed',
      title: `Completed Mock Interview: ${s.role || 'Software Engineer'}`,
      subtitle: `Score: ${s.score || s.overallScore || '?'}% · ${s.questionsCount || '?'} questions`,
      timestamp: d,
      icon: 'Video',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    });
  });

  (atsHistory || []).forEach(a => {
    events.push({
      id: `ats-${a.date}`,
      type: 'ats_analysis',
      title: `Ran ATS Analysis: ${a.title || 'Resume'}`,
      subtitle: `ATS Score: ${a.score}%`,
      timestamp: a.date,
      icon: 'Award',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    });
  });

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
}

// ─── RULE-BASED RECOMMENDATIONS ───────────────────────────────────────────────
/**
 * Generates prioritized, rule-based improvement recommendations.
 * NOT AI-generated. Clearly labeled as rule-based.
 */
export function generateRecommendations({ atsScore, atsHistory, interviewHistory, questionsPracticed, flashcardsMastered, weeklyGoals, weeklyProgress }) {
  const recs = [];

  // 1. Resume needs analysis
  if (!atsScore && atsHistory.length === 0) {
    recs.push({
      priority: 1,
      icon: 'FileText',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      title: 'Analyze Your Resume First',
      reason: 'No resume analysis detected. Your ATS score is the highest-weight metric (35%) in the readiness calculation.',
      action: 'analyzer',
      actionLabel: 'Analyze Resume',
    });
  } else if (atsScore && atsScore < 60) {
    recs.push({
      priority: 1,
      icon: 'AlertTriangle',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      title: 'Improve Your Resume ATS Score',
      reason: `Your current ATS score is ${atsScore}%. Scores below 60% significantly reduce callback rates. Add quantified achievements and missing keywords.`,
      action: 'analyzer',
      actionLabel: 'Optimize Resume',
    });
  }

  // 2. No interview sessions
  if (!interviewHistory || interviewHistory.length === 0) {
    recs.push({
      priority: 2,
      icon: 'Video',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
      title: 'Start Your First Mock Interview',
      reason: 'Interview performance contributes 30% to your readiness score. No sessions found yet.',
      action: 'interview',
      actionLabel: 'Start Interview',
    });
  } else {
    const avgScore = interviewHistory.reduce((s, i) => s + (Number(i.score) || Number(i.overallScore) || 0), 0) / interviewHistory.length;
    if (avgScore < 70) {
      recs.push({
        priority: 2,
        icon: 'TrendingUp',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
        title: 'Improve Interview Performance',
        reason: `Average interview score is ${Math.round(avgScore)}%. Practice more sessions and focus on STAR method for behavioral questions.`,
        action: 'interview',
        actionLabel: 'Practice Now',
      });
    }
  }

  // 3. Questions practiced
  if (questionsPracticed < 10) {
    recs.push({
      priority: 3,
      icon: 'HelpCircle',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      title: 'Practice More Questions',
      reason: `Only ${questionsPracticed} questions practiced. Practicing 30+ questions builds pattern recognition and improves response fluency.`,
      action: 'interview',
      actionLabel: 'Open Question Bank',
    });
  }

  // 4. Flashcards
  if (flashcardsMastered < 5) {
    recs.push({
      priority: 4,
      icon: 'Layers',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      title: 'Study Interview Flashcards',
      reason: `Only ${flashcardsMastered} flashcards mastered. Flashcard review builds quick recall for technical definitions and behavioral frameworks.`,
      action: 'flashcards',
      actionLabel: 'Study Flashcards',
    });
  }

  // 5. Weekly goal behind
  if (weeklyProgress && weeklyGoals) {
    if (weeklyProgress.interviewsThisWeek < Math.ceil(weeklyGoals.interviews / 2)) {
      recs.push({
        priority: 3,
        icon: 'Target',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
        title: 'Weekly Interview Goal Behind',
        reason: `${weeklyProgress.interviewsThisWeek} of ${weeklyGoals.interviews} interviews completed this week. Consistent practice is the strongest predictor of improvement.`,
        action: 'interview',
        actionLabel: 'Start Interview',
      });
    }
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
export function exportDashboardCSV({ atsHistory, interviewHistory, questionsPracticed, flashcardsMastered, readinessScore }) {
  const rows = [
    ['CareerElevate AI – Performance Report'],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Career Readiness Score', `${readinessScore}%`],
    ['Questions Practiced', questionsPracticed],
    ['Flashcards Mastered', flashcardsMastered],
    [],
    ['Resume ATS History'],
    ['Date', 'Score', 'Title'],
    ...(atsHistory || []).map(a => [new Date(a.date).toLocaleDateString(), `${a.score}%`, a.title]),
    [],
    ['Interview Sessions'],
    ['Date', 'Role', 'Score', 'Questions'],
    ...(interviewHistory || []).map(s => [
      new Date(s.date || s.createdAt).toLocaleDateString(),
      s.role || 'General',
      `${s.score || s.overallScore || '?'}%`,
      s.questionsCount || '?',
    ]),
  ];

  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `careerelevate-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export function formatRelativeTime(isoString) {
  if (!isoString) return 'Unknown';
  const d = new Date(isoString);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-indigo-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-rose-400';
}

export function getScoreBg(score) {
  if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
  if (score >= 65) return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
  if (score >= 50) return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
  return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
}
