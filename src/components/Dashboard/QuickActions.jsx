import React from 'react';
import { Upload, FileText, Video, HelpCircle, BarChart2, User, Sparkles } from 'lucide-react';

export default function QuickActions({ onNavigate, onOpenAuth }) {
  const actions = [
    { label: 'Upload Resume', icon: Upload, tab: 'analyzer', color: 'hover:border-indigo-500/50 hover:bg-indigo-600/10' },
    { label: 'Analyze Resume', icon: FileText, tab: 'analyzer', color: 'hover:border-emerald-500/50 hover:bg-emerald-600/10' },
    { label: 'Start Mock Interview', icon: Video, tab: 'interview', color: 'hover:border-violet-500/50 hover:bg-violet-600/10' },
    { label: 'Practice Questions', icon: HelpCircle, tab: 'interview', color: 'hover:border-cyan-500/50 hover:bg-cyan-600/10' },
    { label: 'View Flashcards', icon: BarChart2, tab: 'flashcards', color: 'hover:border-amber-500/50 hover:bg-amber-600/10' },
    { label: 'Edit Profile', icon: User, action: 'profile', color: 'hover:border-rose-500/50 hover:bg-rose-600/10' }
  ];

  const handleClick = (item) => {
    if (item.tab && onNavigate) {
      onNavigate(item.tab);
    } else if (item.action === 'profile' && onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h4 className="font-heading font-extrabold text-lg text-white">Quick Action Controls</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleClick(item)}
              className={`bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 group text-center ${item.color}`}
            >
              <IconComp className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
