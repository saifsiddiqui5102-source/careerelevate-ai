import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend, Cell, CartesianGrid
} from 'recharts';
import {
  LayoutDashboard, RefreshCw, TrendingUp, FileText, Video,
  HelpCircle, Layers, Target, Award, Flame, Calendar,
  CheckCircle2, AlertTriangle, ArrowRight, Download, Settings,
  Clock, Sparkles, BarChart2, Zap, BookOpen, Info, ChevronDown,
  ChevronUp, Play, Star, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  computeReadinessScore, getQuestionsPracticed, getTodayQuestionsPracticed,
  getFlashcardsMastered, getPracticeStreak, getAtsHistory,
  buildActivityLog, generateRecommendations, computeWeeklyProgress,
  getWeeklyGoals, saveWeeklyGoals, exportDashboardCSV,
  formatRelativeTime, getScoreColor, getScoreBg, DEFAULT_WEEKLY_GOALS
} from '../../utils/dashboardMetrics';

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs text-slate-200 min-w-[120px]">
      <p className="font-bold text-white mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.stroke || '#6366f1' }} className="font-mono flex justify-between gap-3">
          <span>{entry.name}</span>
          <span className="font-bold">{typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, title, value, subtitle, color = 'text-indigo-400', isEmpty, emptyText, onAction, actionLabel, actionTab }) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/5 group relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors leading-tight">{title}</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-400', '-500/10')} border ${color.replace('text-', 'border-').replace('-400', '-500/20')} transition-all`}>
            <Icon className={`w-4.5 h-4.5 ${color}`} />
          </div>
        </div>
        {isEmpty ? (
          <div className="mt-2">
            <span className="text-sm font-medium text-slate-500 italic">{emptyText || 'No data yet'}</span>
          </div>
        ) : (
          <>
            <span className="font-heading font-black text-3xl text-white tracking-tight block mb-1">{value}</span>
            {subtitle && <p className="text-[11px] text-slate-500 font-medium leading-tight">{subtitle}</p>}
          </>
        )}
      </div>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className={`relative mt-4 text-[11px] font-bold flex items-center gap-1 ${color} opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          {actionLabel} <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── READINESS SCORE CARD ─────────────────────────────────────────────────────
function ReadinessScoreCard({ score, breakdown, grade, label }) {
  const [expanded, setExpanded] = useState(false);
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const gradeColor = score >= 85 ? '#10b981' : score >= 70 ? '#6366f1' : score >= 55 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-heading font-bold text-lg text-white">Career Readiness Score</h3>
            <p className="text-[11px] text-slate-500">Rule-based composite across 5 weighted metrics</p>
          </div>
        </div>
        <button onClick={() => setExpanded(p => !p)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke={gradeColor} strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-heading font-black text-3xl" style={{ color: gradeColor }}>{score}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{grade}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-bold text-white mb-2">{label}</p>
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full shrink-0 ${b.hasData ? 'bg-indigo-400' : 'bg-slate-700'}`} />
              <span className={`flex-1 truncate ${b.hasData ? 'text-slate-300' : 'text-slate-600'}`}>{b.label}</span>
              <span className="font-mono font-bold text-slate-400">{b.earned}<span className="text-slate-600">/{b.weight}pts</span></span>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">How to Improve Your Score</p>
          {breakdown.filter(b => !b.hasData || b.earned < b.weight).map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/60 rounded-lg p-2.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>{b.tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WEEKLY GOALS CARD ────────────────────────────────────────────────────────
function WeeklyGoalsCard({ goals, progress, onSaveGoals }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...goals });

  const items = [
    { key: 'interviews', label: 'Mock Interviews', icon: Video, color: 'bg-violet-500', current: progress.interviewsThisWeek },
    { key: 'questions',  label: 'Questions Practiced', icon: HelpCircle, color: 'bg-cyan-500', current: progress.questionsThisWeek },
    { key: 'flashcards', label: 'Flashcards Studied', icon: Layers, color: 'bg-emerald-500', current: progress.flashcardsMastered },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-lg text-white">Weekly Goals</h3>
        </div>
        <button
          onClick={() => { setEditing(p => !p); if (editing) { onSaveGoals(draft); } }}
          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" />
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        {items.map(({ key, label, icon: Icon, color, current }) => {
          const target = draft[key] || goals[key] || 1;
          const pct = Math.min(100, Math.round((current / target) * 100));
          const done = current >= target;
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  {label}
                </div>
                <div className="flex items-center gap-2">
                  {done && <span className="text-[10px] font-bold text-emerald-400">✓ Done</span>}
                  {editing ? (
                    <input
                      type="number" min="1" max="50"
                      value={draft[key]}
                      onChange={e => setDraft(p => ({ ...p, [key]: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-12 text-center text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg text-white py-0.5 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">{current}/{target}</span>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-emerald-500' : color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── RECOMMENDATIONS CARD ─────────────────────────────────────────────────────
function RecommendationsCard({ recommendations, onNavigate }) {
  const iconMap = { FileText, AlertTriangle, Video, TrendingUp, HelpCircle, Layers, Target };
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="font-heading font-bold text-lg text-white">Improvement Plan</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-4">Rule-based recommendations generated from your recorded activity</p>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const Icon = iconMap[rec.icon] || Sparkles;
          return (
            <div key={i} className={`p-4 rounded-xl border ${rec.bg} transition-all`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900/60 shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${rec.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white mb-1">{rec.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{rec.reason}</p>
                  <button
                    onClick={() => onNavigate(rec.action)}
                    className={`text-[11px] font-bold flex items-center gap-1 ${rec.color} hover:opacity-80 transition-opacity`}
                  >
                    {rec.actionLabel} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] font-bold bg-slate-900/60 text-slate-500 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                  #{i + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
function ActivityLog({ events }) {
  const iconMap = { Video, Award, FileText };

  if (!events || events.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-lg text-white">Recent Activity</h3>
        </div>
        <div className="text-center py-8 space-y-2">
          <Clock className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-sm text-slate-500">No activity recorded yet</p>
          <p className="text-xs text-slate-600">Complete a mock interview or run a resume analysis to see your activity here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-lg text-white">Recent Activity</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Newest first</span>
      </div>
      <div className="space-y-2.5">
        {events.map(ev => {
          const Icon = iconMap[ev.icon] || FileText;
          return (
            <div key={ev.id} className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${ev.badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{ev.title}</p>
                  {ev.subtitle && <p className="text-[11px] text-slate-500">{ev.subtitle}</p>}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 shrink-0 ml-3">{formatRelativeTime(ev.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PERFORMANCE REPORT SECTION ───────────────────────────────────────────────
function PerformanceReport({ interviewHistory, atsHistory }) {
  const [filter, setFilter] = useState('all'); // 'all' | '30d' | '7d'

  const filterDate = { '7d': 7, '30d': 30, all: Infinity };
  const cutoff = new Date(Date.now() - filterDate[filter] * 86400000);

  const filteredInterviews = (interviewHistory || []).filter(s => {
    if (filter === 'all') return true;
    return new Date(s.date || s.createdAt) >= cutoff;
  });

  const filteredAts = (atsHistory || []).filter(a => {
    if (filter === 'all') return true;
    return new Date(a.date) >= cutoff;
  });

  const avgInterviewScore = filteredInterviews.length > 0
    ? Math.round(filteredInterviews.reduce((s, i) => s + (Number(i.score) || Number(i.overallScore) || 0), 0) / filteredInterviews.length)
    : null;

  const interviewTrend = filteredInterviews.slice().reverse().map((s, i) => ({
    label: `#${i + 1} ${s.role ? s.role.split(' ').slice(-1)[0] : 'Int.'}`,
    score: Number(s.score) || Number(s.overallScore) || 0,
    date: new Date(s.date || s.createdAt).toLocaleDateString(),
  }));

  const atsTrend = filteredAts.slice().reverse().map((a, i) => ({
    label: `Scan ${i + 1}`,
    score: a.score,
    date: new Date(a.date).toLocaleDateString(),
  }));

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-lg text-white">Performance Report</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {['7d', '30d', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {f === 'all' ? 'All Time' : `Last ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Interviews', value: filteredInterviews.length || '—', sub: `in period` },
          { label: 'Avg. Score', value: avgInterviewScore != null ? `${avgInterviewScore}%` : '—', sub: 'interview avg' },
          { label: 'ATS Scans', value: filteredAts.length || '—', sub: 'in period' },
          { label: 'Best ATS', value: filteredAts.length > 0 ? `${Math.max(...filteredAts.map(a => a.score))}%` : '—', sub: 'highest score' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
            <span className="font-heading font-black text-2xl text-white block">{s.value}</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{s.label}</span>
            <span className="text-[10px] text-slate-600">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Score Trend */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> Interview Score Trend
          </p>
          {interviewTrend.length < 2 ? (
            <div className="h-40 flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800">
              <div className="text-center">
                <Play className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Complete {Math.max(0, 2 - interviewTrend.length)} more interview{interviewTrend.length === 0 ? 's' : ''} to see a trend</p>
              </div>
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="score" name="Score %" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4, stroke: '#fff', strokeWidth: 1.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ATS Score History */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> ATS Score History
          </p>
          {atsTrend.length < 1 ? (
            <div className="h-40 flex items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800">
              <div className="text-center">
                <FileText className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No ATS scans in this period</p>
              </div>
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={atsTrend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="atsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="score" name="ATS Score %" stroke="#6366f1" strokeWidth={2} fill="url(#atsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Interview table */}
      {filteredInterviews.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Interview Session Log</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Date', 'Role', 'Score', 'Questions', 'Feedback'].map(h => (
                    <th key={h} className="pb-2 text-left font-bold text-slate-500 uppercase tracking-wider pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInterviews.slice(0, 8).map((s, i) => {
                  const score = Number(s.score) || Number(s.overallScore) || 0;
                  return (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 pr-4 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(s.date || s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-300 font-medium max-w-[150px] truncate">{s.role || 'General'}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getScoreBg(score)}`}>{score}%</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-400">{s.questionsCount || '—'}</td>
                      <td className="py-2.5 text-slate-500 max-w-[200px] truncate">{s.feedbackSummary || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS CHARTS ─────────────────────────────────────────────────────────
function AnalyticsSection({ interviewHistory, atsHistory }) {
  // Category performance from interview sessions
  const categoryData = {};
  (interviewHistory || []).forEach(s => {
    const cat = s.category || s.role || 'General';
    const score = Number(s.score) || Number(s.overallScore) || 0;
    if (!categoryData[cat]) categoryData[cat] = { total: 0, count: 0 };
    categoryData[cat].total += score;
    categoryData[cat].count += 1;
  });

  const categoryChart = Object.entries(categoryData).map(([cat, d]) => ({
    category: cat.length > 20 ? cat.slice(0, 18) + '…' : cat,
    avgScore: Math.round(d.total / d.count),
  }));

  const questionsPracticed = getQuestionsPracticed();
  const flashcardsMastered = getFlashcardsMastered();

  return (
    <div className="space-y-6">
      <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-indigo-400" />
        Analytics
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview performance by category */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> Performance by Interview Category
          </p>
          {categoryChart.length < 1 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Complete mock interviews to see category breakdown</p>
              </div>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} margin={{ top: 5, right: 10, left: -25, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="category" stroke="#475569" fontSize={9} tickLine={false} angle={-20} textAnchor="end" />
                  <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="avgScore" name="Avg Score %" radius={[4, 4, 0, 0]} fill="#8b5cf6">
                    {categoryChart.map((entry, i) => (
                      <Cell key={i} fill={entry.avgScore >= 80 ? '#10b981' : entry.avgScore >= 65 ? '#6366f1' : entry.avgScore >= 50 ? '#f59e0b' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Preparation progress overview */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Preparation Progress Overview
          </p>
          <div className="space-y-4">
            {[
              { label: 'Questions Practiced', current: questionsPracticed, target: 30, color: 'bg-cyan-500', icon: HelpCircle },
              { label: 'Flashcards Mastered', current: flashcardsMastered, target: 20, color: 'bg-emerald-500', icon: Layers },
              { label: 'Mock Interviews', current: (interviewHistory || []).length, target: 10, color: 'bg-violet-500', icon: Video },
              { label: 'ATS Scans', current: (atsHistory || []).length, target: 5, color: 'bg-indigo-500', icon: FileText },
            ].map(({ label, current, target, color, icon: Icon }) => {
              const pct = Math.min(100, Math.round((current / target) * 100));
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500" /> {label}
                    </span>
                    <span className="font-mono text-slate-400">{current}<span className="text-slate-600">/{target}</span></span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function ReadinessDashboard({ onNavigate, onOpenAuth }) {
  const { user, interviewHistory } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [weeklyGoals, setWeeklyGoals] = useState(getWeeklyGoals());
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'report' | 'analytics'

  const computeAll = useCallback(() => {
    const atsHistory     = getAtsHistory();
    const latestAts      = atsHistory.length > 0 ? atsHistory[0].score : null;
    const questionsPracticed = getQuestionsPracticed();
    const flashcardsMastered = getFlashcardsMastered();
    const streak             = getPracticeStreak();
    const weeklyProgress     = computeWeeklyProgress(interviewHistory);
    const goals              = getWeeklyGoals();

    const readiness = computeReadinessScore({
      atsScore: latestAts,
      interviewHistory,
      questionsPracticed,
      flashcardsMastered,
      streak,
    });

    const activityLog = buildActivityLog(interviewHistory, atsHistory);
    const recommendations = generateRecommendations({
      atsScore: latestAts,
      atsHistory,
      interviewHistory,
      questionsPracticed,
      flashcardsMastered,
      weeklyGoals: goals,
      weeklyProgress,
    });

    const avgInterviewScore = interviewHistory && interviewHistory.length > 0
      ? Math.round(interviewHistory.reduce((s, i) => s + (Number(i.score) || Number(i.overallScore) || 0), 0) / interviewHistory.length)
      : null;

    setWeeklyGoals(goals);
    setMetrics({
      readiness,
      latestAts,
      atsHistory,
      avgInterviewScore,
      interviewCount: (interviewHistory || []).length,
      questionsPracticed,
      flashcardsMastered,
      streak,
      weeklyProgress,
      activityLog,
      recommendations,
    });
  }, [interviewHistory]);

  useEffect(() => {
    computeAll();
  }, [computeAll]);

  const handleSaveGoals = (goals) => {
    saveWeeklyGoals(goals);
    setWeeklyGoals(goals);
  };

  const handleExportCSV = () => {
    if (!metrics) return;
    exportDashboardCSV({
      atsHistory: metrics.atsHistory,
      interviewHistory: interviewHistory || [],
      questionsPracticed: metrics.questionsPracticed,
      flashcardsMastered: metrics.flashcardsMastered,
      readinessScore: metrics.readiness.score,
    });
  };

  if (!metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 bg-slate-900/80 border border-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-900/80 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  const { readiness, latestAts, avgInterviewScore, interviewCount, questionsPracticed, flashcardsMastered, streak, weeklyProgress, activityLog, recommendations, atsHistory } = metrics;

  const NAV_TABS = [
    { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
    { id: 'analytics',  label: 'Analytics',  icon: BarChart2 },
    { id: 'report',     label: 'Performance Report', icon: FileText },
  ];

  return (
    <div className="space-y-8">

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <h2 className="font-heading font-black text-3xl text-white">Career Dashboard</h2>
          </div>
          <p className="text-xs text-slate-400">
            Metrics computed from your actual resume analyses, interview sessions, and practice activity.{' '}
            <span className="text-slate-600">Not AI-generated scores.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={computeAll}
            className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-fit">
        {NAV_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════ OVERVIEW ═══════════════════════════════ */}
      {activeSection === 'overview' && (
        <div className="space-y-8">

          {/* ── METRIC CARDS GRID ── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Shield}
              title="Career Readiness"
              value={`${readiness.score}%`}
              subtitle={readiness.label}
              color="text-indigo-400"
            />
            <MetricCard
              icon={FileText}
              title="Latest ATS Score"
              value={latestAts != null ? `${latestAts}%` : null}
              subtitle={atsHistory.length > 0 ? `${atsHistory.length} scan${atsHistory.length > 1 ? 's' : ''} total` : null}
              color="text-emerald-400"
              isEmpty={latestAts == null}
              emptyText="Analyze your resume"
              onAction={() => onNavigate('analyzer')}
              actionLabel="Run Analysis"
            />
            <MetricCard
              icon={Video}
              title="Mock Interviews"
              value={interviewCount > 0 ? interviewCount : null}
              subtitle={interviewCount > 0 ? `${avgInterviewScore}% avg. score` : null}
              color="text-violet-400"
              isEmpty={interviewCount === 0}
              emptyText="Start your first interview"
              onAction={() => onNavigate('interview')}
              actionLabel="Start Interview"
            />
            <MetricCard
              icon={TrendingUp}
              title="Avg. Interview Score"
              value={avgInterviewScore != null ? `${avgInterviewScore}%` : null}
              subtitle={avgInterviewScore != null ? (avgInterviewScore >= 80 ? 'Excellent' : avgInterviewScore >= 65 ? 'Good' : 'Needs improvement') : null}
              color={avgInterviewScore != null ? getScoreColor(avgInterviewScore) : 'text-slate-500'}
              isEmpty={avgInterviewScore == null}
              emptyText="No interview data yet"
            />
            <MetricCard
              icon={HelpCircle}
              title="Questions Practiced"
              value={questionsPracticed > 0 ? questionsPracticed : null}
              subtitle={questionsPracticed > 0 ? `of 30 recommended` : null}
              color="text-cyan-400"
              isEmpty={questionsPracticed === 0}
              emptyText="Practice questions"
              onAction={() => onNavigate('interview')}
              actionLabel="Open Question Bank"
            />
            <MetricCard
              icon={Layers}
              title="Flashcards Mastered"
              value={flashcardsMastered > 0 ? flashcardsMastered : null}
              subtitle={flashcardsMastered > 0 ? `of 20 cards` : null}
              color="text-emerald-400"
              isEmpty={flashcardsMastered === 0}
              emptyText="Study flashcards"
              onAction={() => onNavigate('flashcards')}
              actionLabel="Study Now"
            />
            <MetricCard
              icon={Flame}
              title="Practice Streak"
              value={streak > 0 ? `${streak} days` : null}
              subtitle={streak > 0 ? (streak >= 7 ? '🔥 On fire!' : 'Keep going!') : null}
              color="text-amber-400"
              isEmpty={streak === 0}
              emptyText="Log daily practice"
            />
            <MetricCard
              icon={Award}
              title="Total ATS Scans"
              value={atsHistory.length > 0 ? atsHistory.length : null}
              subtitle={atsHistory.length > 0 && latestAts != null ? `Latest: ${latestAts}%` : null}
              color="text-rose-400"
              isEmpty={atsHistory.length === 0}
              emptyText="No scans yet"
              onAction={() => onNavigate('analyzer')}
              actionLabel="Analyze Resume"
            />
          </div>

          {/* ── 3-COLUMN ROW: READINESS + GOALS + QUICK ACTIONS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ReadinessScoreCard {...readiness} />
            </div>
            <div className="lg:col-span-1">
              <WeeklyGoalsCard
                goals={weeklyGoals}
                progress={weeklyProgress}
                onSaveGoals={handleSaveGoals}
              />
            </div>
            <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-heading font-bold text-lg text-white">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: 'Analyze Resume', icon: FileText, tab: 'analyzer', color: 'hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-300' },
                  { label: 'Start Interview', icon: Video, tab: 'interview', color: 'hover:border-violet-500/50 hover:bg-violet-600/10 hover:text-violet-300' },
                  { label: 'Question Bank', icon: HelpCircle, tab: 'interview', color: 'hover:border-cyan-500/50 hover:bg-cyan-600/10 hover:text-cyan-300' },
                  { label: 'Flashcards', icon: Layers, tab: 'flashcards', color: 'hover:border-emerald-500/50 hover:bg-emerald-600/10 hover:text-emerald-300' },
                  { label: 'Edit Profile', icon: Award, tab: 'profile', color: 'hover:border-amber-500/50 hover:bg-amber-600/10 hover:text-amber-300' },
                  { label: 'View Progress', icon: TrendingUp, section: 'report', color: 'hover:border-rose-500/50 hover:bg-rose-600/10 hover:text-rose-300' },
                ].map(({ label, icon: Icon, tab, section, color }) => (
                  <button
                    key={label}
                    onClick={() => {
                      if (tab) onNavigate(tab);
                      if (section) setActiveSection(section);
                    }}
                    className={`bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center group transition-all duration-200 ${color}`}
                  >
                    <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-current transition-colors" />
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-current transition-colors leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RECOMMENDATIONS + ACTIVITY ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecommendationsCard recommendations={recommendations} onNavigate={onNavigate} />
            <ActivityLog events={activityLog} />
          </div>

        </div>
      )}

      {/* ═══════════════════════════════ ANALYTICS ══════════════════════════════ */}
      {activeSection === 'analytics' && (
        <AnalyticsSection interviewHistory={interviewHistory || []} atsHistory={atsHistory} />
      )}

      {/* ═══════════════════════════════ REPORT ═════════════════════════════════ */}
      {activeSection === 'report' && (
        <PerformanceReport interviewHistory={interviewHistory || []} atsHistory={atsHistory} />
      )}

    </div>
  );
}
