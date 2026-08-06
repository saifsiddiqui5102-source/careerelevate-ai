import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, Sparkles, ArrowRight } from 'lucide-react';
import { matchJobDescription } from '../../utils/jobMatcher';

export default function JobMatcher({ resumeText }) {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResults, setMatchResults] = useState(null);

  const handleRunMatch = () => {
    if (!resumeText || !jobDescription.trim()) return;
    const res = matchJobDescription(resumeText, jobDescription);
    setMatchResults(res);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-6 h-6 text-indigo-400" />
        <h3 className="font-heading font-extrabold text-2xl text-white">Target Job Description Matcher</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Paste the job description of your dream role to analyze skill gap matrix, missing hard keywords, and job fit percentage.
      </p>

      {/* Job Description Input Area */}
      <div className="space-y-4 mb-6">
        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste Job Description here (e.g. Seeking Senior Full Stack Engineer proficient in React, TypeScript, GraphQL, AWS Lambda...)"
          className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            onClick={handleRunMatch}
            disabled={!jobDescription.trim() || !resumeText}
            className="btn-primary font-bold shadow-lg shadow-indigo-600/40 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calculate Job Match Score</span>
          </button>
        </div>
      </div>

      {/* Match Results Matrix */}
      {matchResults && (
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-6 animate-in fade-in duration-300">
          
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-heading font-black text-2xl border ${
                matchResults.matchScore >= 75 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : matchResults.matchScore >= 55 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {matchResults.matchScore}%
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Target Job Alignment</h4>
                <p className="text-xs text-slate-400 max-w-md mt-0.5">{matchResults.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Keywords */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Matched Core Keywords ({matchResults.matchedKeywords.length})
                </h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResults.matchedKeywords.length > 0 ? (
                  matchResults.matchedKeywords.map((kw, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg">
                      ✓ {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No matching core keywords found.</p>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-rose-400" />
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Missing Critical Keywords ({matchResults.missingKeywords.length})
                </h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchResults.missingKeywords.length > 0 ? (
                  matchResults.missingKeywords.map((kw, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 px-3 py-1 rounded-lg">
                      + Add {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-400 font-semibold">Zero critical technical gaps detected!</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
