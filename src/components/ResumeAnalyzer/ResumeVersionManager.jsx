import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, TrendingUp, CheckCircle2, Award, Zap, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

export default function ResumeVersionManager() {
  const [versions, setVersions] = useState([]);
  const [v1Id, setV1Id] = useState('');
  const [v2Id, setV2Id] = useState('');
  const [comparison, setComparison] = useState(null);
useEffect(() => {
  console.log("CURRENT COMPARISON STATE:", comparison);
}, [comparison]);
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

console.log("COMPARE RESPONSE:", res);
    setLoading(false);
    console.log("SUCCESS:", res.success);
console.log("COMPARISON:", res.comparison);

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
  <div
    style={{
      background: "green",
      color: "white",
      padding: "30px",
      marginTop: "20px",
      fontSize: "24px"
    }}
  >
    <h1>WORKING</h1>

    <p>{comparison.summary}</p>

    <p>Score Difference: {comparison.scoreDiff}</p>

    <p>Improvement: {comparison.improvementPercentage}%</p>
  </div>
)}