import React from 'react';
import { Target, CheckCircle2, Award, Video, Cpu, TrendingUp } from 'lucide-react';

function CircularGauge({ value, label, color = 'stroke-indigo-500', textColor = 'text-indigo-400' }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center p-3 bg-slate-950/80 rounded-xl border border-slate-800">
      <div className="relative w-24 h-24 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            className="text-slate-800"
            strokeWidth="6"
            stroke="currentColor"
            fill="none"
            r={radius}
            cx="40"
            cy="40"
          />
          <circle
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            r={radius}
            cx="40"
            cy="40"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-heading font-extrabold text-lg ${textColor}`}>{value}%</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-300">{label}</span>
    </div>
  );
}

export default function CareerProgressWidget({ progress }) {
  if (!progress) return null;

  const { profileCompletion, resumeQuality, interviewReadiness, skillDevelopment, overallReadiness } = progress;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          <h4 className="font-heading font-extrabold text-lg text-white">Career Progress & Readiness Metrics</h4>
        </div>
        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase">
          Animated Circular Gauges
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <CircularGauge value={profileCompletion || 90} label="Profile Completion" color="stroke-cyan-500" textColor="text-cyan-400" />
        <CircularGauge value={resumeQuality || 88} label="Resume Quality" color="stroke-indigo-500" textColor="text-indigo-400" />
        <CircularGauge value={interviewReadiness || 85} label="Interview Readiness" color="stroke-violet-500" textColor="text-violet-400" />
        <CircularGauge value={skillDevelopment || 88} label="Skill Development" color="stroke-amber-500" textColor="text-amber-400" />
        <CircularGauge value={overallReadiness || 92} label="Overall Readiness" color="stroke-emerald-500" textColor="text-emerald-400" />
      </div>
    </div>
  );
}
