import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, KeyRound, Briefcase, BookOpen, Lightbulb } from 'lucide-react';

export default function AIInsightsCard({ aiInsights }) {
  if (!aiInsights) return null;

  const { strongSkills, weakSkills, missingKeywords, resumeStrength, suggestedJobRoles, learningRecommendations, overallCareerAdvice } = aiInsights;

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-indigo-500/30 bg-slate-900/90 shadow-2xl mb-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <div>
          <h4 className="font-heading font-extrabold text-xl text-white">Gemini AI Executive Career Insights</h4>
          <p className="text-xs text-slate-400">Real-time candidate intelligence generated from your resume scans and interview practice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Strong Skills */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Strong Skills</h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {strongSkills.map((s, idx) => (
              <span key={idx} className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Skills & Gaps */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Weak Skills & Gaps</h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {weakSkills.map((s, idx) => (
              <span key={idx} className="text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                ! {s}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <KeyRound className="w-4 h-4" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Missing Keywords</h5>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((s, idx) => (
              <span key={idx} className="text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                + {s}
              </span>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Suggested Target Job Roles */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-indigo-400">
            <Briefcase className="w-4 h-4" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Target High-Fit Job Roles</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedJobRoles.map((r, idx) => (
              <span key={idx} className="text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg">
                🎯 {r}
              </span>
            ))}
          </div>
        </div>

        {/* Learning Recommendations */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <h5 className="text-xs font-bold uppercase tracking-wider">Learning Recommendations</h5>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {learningRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Overall Career Advice Banner */}
      <div className="bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-xl flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1">Executive Career Advice</span>
          <p className="text-xs font-medium text-slate-200 leading-relaxed font-sans">
            {overallCareerAdvice}
          </p>
        </div>
      </div>

    </div>
  );
}
