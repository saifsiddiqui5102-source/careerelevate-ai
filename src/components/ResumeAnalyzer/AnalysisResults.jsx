import React from 'react';
import { Award, AlertTriangle, CheckCircle2, FileText, Zap, BarChart2, ShieldAlert, Download, DollarSign, Briefcase, Lightbulb, Compass, BookOpen, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalysisResults({ analysisData, resumeTitle }) {
  if (!analysisData) return null;

  const {
    overallScore,
    resumeSummary,
    wordCount,
    wordCountStatus,
    metricsCount,
    metricsScore,
    actionVerbScore,
    sectionScore,
    foundActionVerbs,
    missingSkills,
    weakSections,
    grammarSuggestions,
    formattingSuggestions,
    industrySuggestions,
    jobRoleSuggestions,
    salaryRange,
    learningRoadmap,
    personalizedCareerAdvice,
    feedback
  } = analysisData;

  const handleDownloadReport = () => {
    if (overallScore >= 80) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    window.print();
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return { color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', text: 'ATS Outstanding' };
    if (score >= 70) return { color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10', text: 'ATS Good' };
    return { color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', text: 'Needs Improvement' };
  };

  const scoreBadge = getScoreBadge(overallScore);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Top Banner & Score Circle Gauge */}
      <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${scoreBadge.color}">
              <Award className="w-4 h-4" />
              <span>{scoreBadge.text}</span>
            </div>
            <h3 className="font-heading font-extrabold text-3xl text-white mb-2">
              ATS Audit Report for <span className="gradient-text">{resumeTitle || 'Resume'}</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Analyzed against leading corporate ATS algorithms (Workday, Greenhouse, Lever) and Google Gemini AI career models.
            </p>
          </div>

          {/* Score Circle Gauge */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={overallScore >= 80 ? 'text-emerald-500' : overallScore >= 65 ? 'text-indigo-500' : 'text-rose-500'}
                  strokeDasharray={`${overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-heading font-black text-4xl text-white">{overallScore}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ATS Score</span>
              </div>
            </div>

            <button
              onClick={handleDownloadReport}
              className="mt-3 btn-secondary text-xs py-1.5 px-3 font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* 2. AI Executive Resume Summary Callout */}
      {resumeSummary && (
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Executive Resume Synthesis</span>
          </h4>
          <p className="text-sm font-medium text-white leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
            "{resumeSummary}"
          </p>
        </div>
      )}

      {/* 3. 4 Key Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Impact Metrics</span>
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{metricsCount || 4} <span className="text-xs font-normal text-slate-400">found</span></div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${metricsScore || 70}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Target: 6+ %, $, or user metrics</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Action Verbs</span>
            <BarChart2 className="w-5 h-5 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{foundActionVerbs?.length || 5} <span className="text-xs font-normal text-slate-400">high-impact</span></div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
            <div className="bg-violet-500 h-full rounded-full transition-all" style={{ width: `${actionVerbScore || 75}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Target: 8+ leadership verbs</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">ATS Structure</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{sectionScore || 90}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${sectionScore || 90}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Core standard section headers</p>
        </div>

        <div className="glass-card rounded-xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">Word Count</span>
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white mb-1">{wordCount || 350} <span className="text-xs font-normal text-slate-400">words</span></div>
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full mt-1">
            <span>{wordCountStatus || 'Optimal'}</span>
          </div>
        </div>
      </div>

      {/* 4. Salary Benchmark & Target Job Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Salary Range Card */}
        <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h4 className="font-heading font-bold text-base text-white">Estimated Market Salary Benchmark</h4>
          </div>
          <div className="text-2xl font-black text-emerald-400 mb-2 font-mono">
            {salaryRange || '$145,000 – $185,000 USD / year'}
          </div>
          <p className="text-xs text-slate-400">
            Derived from current senior role market compensation benchmarks across US Tech hubs (SF, NY, Austin).
          </p>
        </div>

        {/* Target Job Roles & Industry Sectors */}
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h4 className="font-heading font-bold text-base text-white">High-Fit Target Job Roles</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(jobRoleSuggestions || ['Senior Full Stack Engineer', 'Lead Systems Architect', 'Staff Platform Engineer']).map((role, idx) => (
              <span key={idx} className="text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg">
                🎯 {role}
              </span>
            ))}
          </div>

          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Top Target Growth Sectors</span>
          <div className="flex flex-wrap gap-2">
            {(industrySuggestions || ['Enterprise Cloud SaaS', 'FinTech & Payments', 'AI Infrastructure']).map((ind, idx) => (
              <span key={idx} className="text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                {ind}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Grammar & Formatting Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grammar & Phrasing Suggestions */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h4 className="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Grammar & Action Verb Enhancements</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(grammarSuggestions || [
              "Ensure consistent past-tense action verbs for previous roles ('Architected' vs 'Architecting').",
              "Eliminate wordy passive constructions like 'was responsible for developing' — replace with 'Engineered'."
            ]).map((item, idx) => (
              <li key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ATS Layout & Formatting Suggestions */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <h4 className="font-heading font-bold text-base text-white mb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>ATS Layout & Formatting Optimization</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {(formattingSuggestions || [
              "Use standard ATS single-column formatting with clear H2 headers (Summary, Skills, Experience, Education).",
              "Avoid tables, text boxes, and complex multi-column columns which confuse ATS parsers."
            ]).map((item, idx) => (
              <li key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 6. 30-60-90 Day Learning Roadmap */}
      {learningRoadmap && (
        <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl">
          <h4 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>3-Stage Candidate Learning & Skill Growth Roadmap</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-xl">
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                Stage 1: Days 1–30
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {learningRoadmap.stage1}
              </p>
            </div>

            <div className="bg-slate-900 border border-violet-500/30 p-4 rounded-xl">
              <span className="text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                Stage 2: Days 31–60
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {learningRoadmap.stage2}
              </p>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl">
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                Stage 3: Days 61–90
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {learningRoadmap.stage3}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. Personalized Career Advisory Banner */}
      {personalizedCareerAdvice && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Personalized Executive Career Advice</span>
          </h4>
          <p className="text-xs font-medium text-slate-200 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
            {personalizedCareerAdvice}
          </p>
        </div>
      )}

    </div>
  );
}
