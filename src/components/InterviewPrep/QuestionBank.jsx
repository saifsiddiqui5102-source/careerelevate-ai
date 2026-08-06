import React, { useState, useEffect } from 'react';
import { HelpCircle, Code, Users, Sparkles, BookOpen, Clock, ChevronRight, CheckCircle2, RefreshCw, Cpu, Layers } from 'lucide-react';
import { api } from '../../services/api';

export default function QuestionBank() {
  const [activeCategory, setActiveCategory] = useState('technical'); // 'hr', 'technical', 'coding', 'behavioral'
  const [jobRole, setJobRole] = useState('Senior Software Engineer');
  const [skills, setSkills] = useState('React, Node.js, System Design, GraphQL, SQL');
  const [experienceYears, setExperienceYears] = useState('5+ Years');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchInitialQuestions();
    fetchHistory();
  }, []);

  const fetchInitialQuestions = async () => {
    setLoading(true);
    const res = await api.generateQuestions({
      jobRole,
      skills,
      experienceYears
    });
    setLoading(false);
    if (res && res.success && res.questions) {
      setQuestions(res.questions);
    }
  };

  const fetchHistory = async () => {
    const res = await api.getInterviewHistory();
    if (res && res.success && res.history) {
      setHistory(res.history);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchInitialQuestions();
  };

  return (
    <div className="space-y-8">
      
      {/* Dynamic AI Generator Form */}
      <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-heading font-extrabold text-xl text-white">Dynamic AI Question Generator</h3>
            </div>
            <p className="text-xs text-slate-400">
              Gemini AI generates customized interview questions based on candidate role, skills, and experience level across 4 core categories.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Job Role</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Senior Full Stack Engineer"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Technical Skills & Stack</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. React, Node.js, GraphQL, Redis, AWS"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center text-xs py-2 font-bold shadow-md shadow-indigo-600/30"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Questions</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4 Category Tabs */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveCategory('technical')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'technical' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Technical Questions</span>
        </button>

        <button
          onClick={() => setActiveCategory('coding')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'coding' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Coding Challenges</span>
        </button>

        <button
          onClick={() => setActiveCategory('behavioral')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'behavioral' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Behavioral (STAR)</span>
        </button>

        <button
          onClick={() => setActiveCategory('hr')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeCategory === 'hr' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>HR & Culture Fit</span>
        </button>
      </div>

      {/* Category Content Views */}
      {questions && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* TAB 1: TECHNICAL QUESTIONS */}
          {activeCategory === 'technical' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(questions.technicalQuestions || []).map((q, idx) => (
                <div key={idx} className="glass-card rounded-xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                      {q.coreConcept || 'Core Concept'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Q{idx + 1}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{q.question}</h4>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Model Answer / Explanation:</span>
                    <p>{q.modelAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: CODING CHALLENGES */}
          {activeCategory === 'coding' && (
            <div className="space-y-4">
              {(questions.codingQuestions || []).map((q, idx) => (
                <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/90">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-indigo-400" />
                      <h4 className="text-base font-bold text-white">{q.problemTitle || 'Coding Problem'}</h4>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      Algorithmic Challenge
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-4">{q.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-4">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-sans mb-1 font-bold">Constraints & Time Complexity</span>
                      <span className="text-slate-200">{q.constraints}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-sans mb-1 font-bold">Example Input/Output</span>
                      <span className="text-emerald-400">{q.exampleInput} → {q.exampleOutput}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Optimal Solution Approach:</span>
                    <p>{q.solutionApproach}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: BEHAVIORAL QUESTIONS */}
          {activeCategory === 'behavioral' && (
            <div className="space-y-4">
              {(questions.behavioralQuestions || []).map((q, idx) => (
                <div key={idx} className="glass-card rounded-xl p-5 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2">{q.question}</h4>
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5 mb-3 text-xs text-indigo-300 font-mono">
                    💡 STAR Guidance: {q.starGuidance}
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Benchmark Candidate Answer:</span>
                    <p>{q.benchmarkAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: HR QUESTIONS */}
          {activeCategory === 'hr' && (
            <div className="space-y-4">
              {(questions.hrQuestions || []).map((q, idx) => (
                <div key={idx} className="glass-card rounded-xl p-5 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-2">{q.question}</h4>
                  <p className="text-xs text-slate-400 mb-2 font-mono">Interviewer Rationale: {q.rationale}</p>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Ideal Candidate Response Strategy:</span>
                    <p>{q.idealAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Stored Interview History Log */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h4 className="font-heading font-bold text-base text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Stored Candidate Interview History ({history.length})</span>
        </h4>
        <div className="space-y-2">
          {history.map((sess) => (
            <div key={sess._id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">{sess.role || 'Mock Session'}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{sess.feedbackSummary}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-400">{sess.overallScore || 85}% Score</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(sess.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
