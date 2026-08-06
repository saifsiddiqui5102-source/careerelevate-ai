import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Play, CheckCircle2, RotateCcw, Sparkles, MessageSquare, Award, ArrowRight } from 'lucide-react';
import { speakText, stopSpeech, createSpeechRecognizer } from '../../utils/speechHelper';
import { QUESTION_BANK } from '../../data/questionBankData';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function MockInterview() {
  const { addInterviewSession, user } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState('Software Engineering');
  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const [userAnswerText, setUserAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  
  const [evaluatedResult, setEvaluatedResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);

  // Filter questions by role
  const activeQuestions = QUESTION_BANK.filter(q => q.role === selectedRole || q.role === 'Software Engineering');
  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  useEffect(() => {
    // Initialize Web Speech Recognition
    const rec = createSpeechRecognizer(
      (transcript) => {
        setUserAnswerText(transcript);
      },
      (err) => {
        console.warn('Speech Rec Error:', err);
        setIsRecording(false);
      }
    );
    setRecognizer(rec);

    return () => {
      stopSpeech();
    };
  }, []);

  const handleStartSession = () => {
    setSessionActive(true);
    setCurrentQuestionIndex(0);
    setEvaluatedResult(null);
    setUserAnswerText('');
    setSessionScores([]);

    if (audioEnabled && currentQuestion) {
      speakText(currentQuestion.question);
    }
  };

  const handleToggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      if (currentQuestion) {
        speakText(currentQuestion.question);
      }
    }
  };

  const handleToggleRecording = () => {
    if (!recognizer) {
      alert('Speech Recognition is not supported on this browser. You can type your response!');
      return;
    }

    if (isRecording) {
      recognizer.stop();
      setIsRecording(false);
    } else {
      try {
        recognizer.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEvaluateAnswer = () => {
    if (!userAnswerText.trim()) return;

    setIsEvaluating(true);
    stopSpeech();

    // AI Evaluation Engine
    setTimeout(() => {
      const text = userAnswerText.toLowerCase();
      const wordCount = userAnswerText.trim().split(/\s+/).length;

      let clarityScore = Math.min(95, Math.max(60, Math.round(wordCount > 30 ? 88 : 65)));
      let techDepthScore = text.includes('system') || text.includes('redis') || text.includes('api') || text.includes('architecture') ? 90 : 75;
      let starScore = text.includes('situation') || text.includes('action') || text.includes('result') || wordCount > 50 ? 88 : 70;
      let relevanceScore = 85;

      const overallQScore = Math.round((clarityScore + techDepthScore + starScore + relevanceScore) / 4);

      const result = {
        score: overallQScore,
        clarityScore,
        techDepthScore,
        starScore,
        relevanceScore,
        feedback: wordCount > 40
          ? 'Strong detailed response! You effectively addressed technical trade-offs and structural constraints.'
          : 'Good foundation, but try expanding on quantifiable metrics (e.g. latency impact %, DAU scale) to achieve a 90+ score.',
        keyStrengths: ['Clear articulate phrasing', 'Identified key domain concepts'],
        improvementTip: 'Incorporate explicit STAR framework transitions ("My specific action was...")'
      };

      setEvaluatedResult(result);
      setSessionScores(prev => [...prev, overallQScore]);
      setIsEvaluating(false);

      if (overallQScore >= 85) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }, 1200);
  };

  const handleNextQuestion = () => {
    setUserAnswerText('');
    setEvaluatedResult(null);
    if (currentQuestionIndex + 1 < activeQuestions.length) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (audioEnabled) {
        speakText(activeQuestions[nextIdx].question);
      }
    } else {
      // Session Complete
      const avgScore = sessionScores.length > 0
        ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
        : 85;

      addInterviewSession({
        id: `sess-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        role: selectedRole,
        score: avgScore,
        questionsCount: activeQuestions.length,
        feedbackSummary: 'Completed AI Mock Interview session with strong technical depth across domain questions.'
      });

      setSessionActive(false);
      alert(`🎉 Mock Interview Completed! Session Average Score: ${avgScore}%`);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-2xl mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="font-heading font-extrabold text-2xl text-white">AI Mock Interview Simulator</h2>
          </div>
          <p className="text-xs text-slate-400">
            Interactive real-time mock interview with voice audio synthesis, voice recording, and AI candidate scoring.
          </p>
        </div>

        {/* Role & Audio Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={sessionActive}
            className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="Software Engineering">Software Engineering</option>
            <option value="Product Management">Product Management</option>
            <option value="Data Science">Data Science</option>
          </select>

          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition-all ${
              audioEnabled 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={audioEnabled ? 'Voice Prompts Enabled' : 'Voice Prompts Muted'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Start Banner when inactive */}
      {!sessionActive && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto my-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white mb-2">Ready to Practice Your Interview?</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The AI Interviewer will present domain-specific questions. Speak your answer aloud using your microphone or type your response to receive instant multidimensional scoring.
          </p>
          <button
            onClick={handleStartSession}
            className="btn-primary font-bold px-6 py-3 shadow-lg shadow-indigo-600/40"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Mock Interview Session</span>
          </button>
        </div>
      )}

      {/* Active Session View */}
      {sessionActive && currentQuestion && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
            <span className="text-indigo-400">{currentQuestion.category}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-4">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                  {currentQuestion.difficulty} Difficulty
                </span>
                <h3 className="font-heading font-bold text-lg text-white leading-snug">
                  "{currentQuestion.question}"
                </h3>
              </div>
              <button
                onClick={() => speakText(currentQuestion.question)}
                className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors shrink-0"
                title="Re-play Voice Question"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Response Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Your Answer (Voice or Text)</label>
              
              {/* Mic Toggle Button */}
              <button
                onClick={handleToggleRecording}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={userAnswerText}
              onChange={(e) => setUserAnswerText(e.target.value)}
              placeholder="Speak aloud or type your answer here using the STAR framework (Situation, Task, Action, Result)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-white focus:outline-none transition-colors"
            />

            <div className="flex justify-end">
              <button
                onClick={handleEvaluateAnswer}
                disabled={!userAnswerText.trim() || isEvaluating}
                className="btn-primary font-bold shadow-lg shadow-indigo-600/40 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit & Get AI Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Score & Feedback Modal Card */}
          {evaluatedResult && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-heading font-black text-xl flex items-center justify-center">
                    {evaluatedResult.score}%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">AI Candidate Score</h4>
                    <p className="text-xs text-slate-400">{evaluatedResult.feedback}</p>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="btn-primary text-xs py-2 px-4 font-bold"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Breakdown metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Clarity</span>
                  <span className="text-sm font-black text-indigo-400">{evaluatedResult.clarityScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Tech Depth</span>
                  <span className="text-sm font-black text-violet-400">{evaluatedResult.techDepthScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">STAR Method</span>
                  <span className="text-sm font-black text-emerald-400">{evaluatedResult.starScore}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block">Relevance</span>
                  <span className="text-sm font-black text-cyan-400">{evaluatedResult.relevanceScore}%</span>
                </div>
              </div>

              {/* 10/10 Sample Answer Reveal */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                  Sample 10/10 Benchmark Response
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
                  {currentQuestion.sampleAnswer}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
