import React from 'react';
import { Award, TrendingUp, Layers, History, ShieldCheck } from 'lucide-react';

export default function PerformanceMetrics({ performance }) {
  if (!performance) return null;

  const { currentAtsScore, highestAtsScore, previousAtsScore, improvementPercentage, resumeVersionCount } = performance;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h4 className="font-heading font-extrabold text-lg text-white">Candidate ATS Performance Scorecard</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Comparison</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current ATS Score</span>
          <span className="font-heading font-black text-2xl text-indigo-400">{currentAtsScore}%</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Highest ATS Score</span>
          <span className="font-heading font-black text-2xl text-emerald-400">{highestAtsScore}%</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Previous ATS Score</span>
          <span className="font-heading font-black text-2xl text-slate-400">{previousAtsScore}%</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Score Improvement</span>
          <span className="font-heading font-black text-2xl text-amber-400">+{improvementPercentage}%</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Resume Versions</span>
          <span className="font-heading font-black text-2xl text-violet-400">{resumeVersionCount} versions</span>
        </div>
      </div>
    </div>
  );
}
