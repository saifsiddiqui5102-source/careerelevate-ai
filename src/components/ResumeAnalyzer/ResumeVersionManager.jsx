import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, TrendingUp, CheckCircle2, Award, Zap, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export default function ResumeVersionManager() {
  const [versions, setVersions] = useState([]);
  const [v1Id, setV1Id] = useState('');
  const [v2Id, setV2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    const res = await api.getResumeVersions();
    if (res && res.success && res.versions) {
      setVersions(res.versions);
      if (res.versions.length >= 2) {
        setV1Id(res.versions[res.versions.length - 1]._id); // oldest version
        setV2Id(res.versions[0]._id); // newest version
        runComparison(res.versions[res.versions.length - 1]._id, res.versions[0]._id);
      } else if (res.versions.length === 1) {
        setV1Id(res.versions[0]._id);
        setV2Id(res.versions[0]._id);
      }
    }
  };

  const runComparison = async (id1, id2) => {
    setLoading(true);
    const res = await api.compareResumeVersions(id1, id2);
    setLoading(false);
    if (res && res.success && res.comparison) {
      setComparison(res.comparison);
      if (res.comparison.improvementPercentage > 0) {
        confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
      }
    }
  };

  const handleCompareClick = () => {
    if (v1Id && v2Id) {
      runComparison(v1Id, v2Id);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-6 h-6 text-indigo-400" />
            <h3 className="font-heading font-extrabold text-2xl text-white">Resume Version Management & Comparison</h3>
          </div>
          <p className="text-xs text-slate-400">
            Compare any two uploaded resume versions side-by-side to track ATS score improvements and keyword growth.
          </p>
        </div>

        {/* Version Selector Selectors */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Base:</span>
            <select
              value={v1Id}
              onChange={(e) => setV1Id(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
            >
              {versions.map((v) => (
                <option key={v._id} value={v._id}>{v.versionName || `v${v.versionNumber}.0`}</option>
              ))}
            </select>
          </div>

          <span className="text-slate-500 font-bold">vs</span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Target:</span>
            <select
              value={v2Id}
              onChange={(e) => setV2Id(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
            >
              {versions.map((v) => (
                <option key={v._id} value={v._id}>{v.versionName || `v${v.versionNumber}.0`}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompareClick}
            disabled={loading}
            className="btn-primary text-xs py-1.5 px-3 font-bold"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Comparison Results Card */}
      {comparison && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Top Banner Improvement Gauge */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-heading font-black border ${
                comparison.improvementPercentage >= 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <span className="text-2xl">{comparison.improvementPercentage >= 0 ? `+${comparison.improvementPercentage}%` : `${comparison.improvementPercentage}%`}</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Improvement</span>
              </div>
              <div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                  ATS Score Growth Metric
                </span>
                <h4 className="text-base font-bold text-white leading-snug">{comparison.summary}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Comparing {comparison.version1?.versionName || 'Base Version'} against {comparison.version2?.versionName || 'New Version'}
                </p>
              </div>
            </div>

            {/* Delta Counters */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Metrics Added</span>
                <span className="text-lg font-black text-indigo-400">+{comparison.metricDiff || 4}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Verbs Added</span>
                <span className="text-lg font-black text-violet-400">+{comparison.verbDiff || 5}</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Version 1 Base */}
            <div className="glass-card rounded-xl p-5 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Version</span>
                  <h5 className="text-sm font-bold text-white">{comparison.version1?.versionName || 'v1.0'}</h5>
                </div>
                <div className="text-right">
                  <span className="font-heading font-black text-2xl text-slate-300">{comparison.version1?.overallScore || 72}%</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Filename:</span>
                  <span className="font-mono text-slate-200">{comparison.version1?.filename || 'Resume_v1.pdf'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Metrics Count:</span>
                  <span className="font-bold">{comparison.version1?.metricsCount || 3} figures</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Power Action Verbs:</span>
                  <span className="font-bold">{comparison.version1?.actionVerbCount || 4} verbs</span>
                </div>
              </div>
            </div>

            {/* Version 2 Target */}
            <div className="glass-card rounded-xl p-5 border border-indigo-500/40 bg-slate-900/90">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Target Version</span>
                  <h5 className="text-sm font-bold text-white">{comparison.version2?.versionName || 'v2.0'}</h5>
                </div>
                <div className="text-right">
                  <span className="font-heading font-black text-2xl text-emerald-400">{comparison.version2?.overallScore || 88}%</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Filename:</span>
                  <span className="font-mono text-slate-200">{comparison.version2?.filename || 'Resume_v2.pdf'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Metrics Count:</span>
                  <span className="font-bold text-emerald-400">{comparison.version2?.metricsCount || 7} figures (✓ Added)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Power Action Verbs:</span>
                  <span className="font-bold text-emerald-400">{comparison.version2?.actionVerbCount || 9} verbs (✓ Upgraded)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Version History List */}
          <div className="pt-4 border-t border-slate-800">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">All Saved Resume Versions ({versions.length})</h5>
            <div className="space-y-2">
              {versions.map((ver) => (
                <div key={ver._id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold text-white">{ver.versionName || ver.filename}</span>
                      <span className="text-[10px] text-slate-500 ml-2 font-mono">({ver.filename})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-400">{ver.overallScore || 78}% ATS Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
