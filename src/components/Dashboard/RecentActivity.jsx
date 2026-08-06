import React from 'react';
import { Clock, FileText, Award, Video, Zap, User } from 'lucide-react';

const iconMap = {
  FileText: FileText,
  Award: Award,
  Video: Video,
  Zap: Zap,
  User: User
};

export default function RecentActivity({ activity }) {
  if (!activity || activity.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h4 className="font-heading font-extrabold text-lg text-white">Recent Activity Feed</h4>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Newest First</span>
      </div>

      <div className="space-y-3">
        {activity.map((item) => {
          const IconComp = iconMap[item.icon] || FileText;
          return (
            <div
              key={item.id}
              className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{item.title}</h5>
                  <p className="text-[11px] text-slate-400 capitalize">{item.type.replace('_', ' ')}</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500">{item.timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
