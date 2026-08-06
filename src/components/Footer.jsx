import React from 'react';
import { Sparkles, ShieldCheck, Heart, Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-16 py-12 text-slate-400">
      <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-lg text-white">CareerElevate AI</span>
            <p className="text-xs text-slate-500">Enterprise ATS Resume Analyzer & AI Mock Interview Coaching</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>ATS WORKDAY Compatible</span>
          <span>•</span>
          <span>STAR Behavioral Coaching</span>
          <span>•</span>
          <span>Web Speech Voice Audio</span>
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Career Excellence © 2026
        </p>

      </div>
    </footer>
  );
}
