import React from 'react';
import { FileText, BarChart2, Award, Video, HelpCircle, Cpu, Zap, TrendingUp } from 'lucide-react';

const iconMap = {
  FileText: FileText,
  BarChart2: BarChart2,
  Award: Award,
  Video: Video,
  HelpCircle: HelpCircle,
  Cpu: Cpu,
  Zap: Zap,
  TrendingUp: TrendingUp
};

export default function SummaryCards({ cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const IconComponent = iconMap[card.icon] || FileText;
        return (
          <div
            key={card.id}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                {card.title}
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-heading font-black text-3xl text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {card.change}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
