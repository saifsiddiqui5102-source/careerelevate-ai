import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import AnalyticsCharts from './AnalyticsCharts';
import RecentActivity from './RecentActivity';
import AIInsightsCard from './AIInsightsCard';
import CareerProgressWidget from './CareerProgressWidget';
import PerformanceMetrics from './PerformanceMetrics';
import QuickActions from './QuickActions';
import { api } from '../../services/api';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

export default function ReadinessDashboard({ onNavigate, onOpenAuth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await api.getDashboard();
    setLoading(false);
    if (res && res.success) {
      setData(res);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 bg-slate-800/60 rounded-xl w-1/3 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 bg-slate-900/80 border border-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-900/80 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <h2 className="font-heading font-black text-3xl text-white">SaaS Executive Career Analytics</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time candidate metrics aggregated dynamically from MongoDB database records and Gemini AI models.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="btn-secondary text-xs py-2 px-3 font-bold shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 1. TOP SUMMARY CARDS (8 CARDS) */}
      {data?.summaryCards && <SummaryCards cards={data.summaryCards} />}

      {/* 2. QUICK ACTIONS */}
      <QuickActions onNavigate={onNavigate} onOpenAuth={onOpenAuth} />

      {/* 3. PERFORMANCE METRICS SCORECARD */}
      {data?.performance && <PerformanceMetrics performance={data.performance} />}

      {/* 4. CAREER PROGRESS WIDGET (CIRCULAR GAUGES) */}
      {data?.progress && <CareerProgressWidget progress={data.progress} />}

      {/* 5. AI INSIGHTS CARD */}
      {data?.aiInsights && <AIInsightsCard aiInsights={data.aiInsights} />}

      {/* 6. CHARTS (5 RECHARTS CHARTS) */}
      {data?.charts && <AnalyticsCharts charts={data.charts} />}

      {/* 7. RECENT ACTIVITY LOG */}
      {data?.activity && <RecentActivity activity={data.activity} />}

    </div>
  );
}
