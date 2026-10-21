import React, { useState, useEffect } from 'react';
import { 
  Layers, RotateCw, ArrowLeft, ArrowRight, CheckCircle2, 
  HelpCircle, Shuffle, RotateCcw, AlertTriangle, Filter, Check, 
  Sparkles, Award, Star
} from 'lucide-react';
import { FLASHCARDS_DATA } from '../../data/flashcardsData';

const TOPICS = [
  'All Topics',
  'System Design',
  'Frontend & Web',
  'Backend & Databases',
  'Core CS & Fresher',
  'Behavioral Strategy'
];

const DIFFICULTIES = [
  'All Difficulties',
  'Beginner',
  'Intermediate',
  'Advanced'
];

export default function Flashcards() {
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'known', 'need_practice', 'unreviewed'

  // Card deck array and active index
  const [deck, setDeck] = useState(FLASHCARDS_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Persistent user card tracking: { [cardId]: 'known' | 'need_practice' }
  const [cardStatusMap, setCardStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem('careerelevate_flashcards_status');
      return saved ? JSON.parse(saved) : { 'fc-1': 'known', 'fc-6': 'known', 'fc-17': 'need_practice' };
    } catch {
      return { 'fc-1': 'known', 'fc-6': 'known', 'fc-17': 'need_practice' };
    }
  });

  useEffect(() => {
    localStorage.setItem('careerelevate_flashcards_status', JSON.stringify(cardStatusMap));
  }, [cardStatusMap]);

  // When topic, difficulty, or filterStatus changes, reset to card 0
  useEffect(() => {
    const filtered = FLASHCARDS_DATA.filter((card) => {
      if (selectedTopic !== 'All Topics' && card.category !== selectedTopic) return false;
      if (selectedDifficulty !== 'All Difficulties' && card.difficulty !== selectedDifficulty) return false;
      
      const status = cardStatusMap[card.id] || 'unreviewed';
      if (filterStatus === 'known' && status !== 'known') return false;
      if (filterStatus === 'need_practice' && status !== 'need_practice') return false;
      if (filterStatus === 'unreviewed' && status !== 'unreviewed') return false;

      return true;
    });

    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedTopic, selectedDifficulty, filterStatus]);

  // When cardStatusMap changes, only update deck if filterStatus is active; do NOT reset index to 0
  useEffect(() => {
    if (filterStatus === 'all') return;

    const filtered = FLASHCARDS_DATA.filter((card) => {
      if (selectedTopic !== 'All Topics' && card.category !== selectedTopic) return false;
      if (selectedDifficulty !== 'All Difficulties' && card.difficulty !== selectedDifficulty) return false;
      
      const status = cardStatusMap[card.id] || 'unreviewed';
      if (filterStatus === 'known' && status !== 'known') return false;
      if (filterStatus === 'need_practice' && status !== 'need_practice') return false;
      if (filterStatus === 'unreviewed' && status !== 'unreviewed') return false;

      return true;
    });

    setDeck(filtered);
    setCurrentIndex((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [cardStatusMap]);

  const currentCard = deck[currentIndex] || null;

  // Next Card
  const handleNext = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  // Previous Card
  const handlePrev = () => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  };

  // Shuffle Deck
  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  // Restart Deck
  const handleRestart = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
  };

  // Mark as Known
  const handleMarkKnown = (e) => {
    e.stopPropagation();
    if (!currentCard) return;
    setCardStatusMap((prev) => ({
      ...prev,
      [currentCard.id]: prev[currentCard.id] === 'known' ? 'unreviewed' : 'known'
    }));
  };

  // Mark as Need Practice
  const handleMarkNeedPractice = (e) => {
    e.stopPropagation();
    if (!currentCard) return;
    setCardStatusMap((prev) => ({
      ...prev,
      [currentCard.id]: prev[currentCard.id] === 'need_practice' ? 'unreviewed' : 'need_practice'
    }));
  };

  // Global counts
  const totalMastered = Object.values(cardStatusMap).filter((s) => s === 'known').length;
  const totalNeedPractice = Object.values(cardStatusMap).filter((s) => s === 'need_practice').length;
  const masteryPercentage = Math.round((totalMastered / FLASHCARDS_DATA.length) * 100);

  const currentStatus = currentCard ? (cardStatusMap[currentCard.id] || 'unreviewed') : 'unreviewed';

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl mb-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-2">
            <Layers className="w-4 h-4" />
            <span>Active Recall Study Deck</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-white">Interactive Tech & Interview Flashcards</h2>
          <p className="text-xs text-slate-400 mt-1">
            Master architecture, algorithms, and behavioral frameworks with 3D flip card active recall.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-4 text-xs font-bold">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mastered</span>
            <span className="text-sm font-black text-emerald-400">{totalMastered}</span>
          </div>
          <div className="border-l border-slate-800 pl-4 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Practice</span>
            <span className="text-sm font-black text-amber-400">{totalNeedPractice}</span>
          </div>
          <div className="border-l border-slate-800 pl-4 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Deck %</span>
            <span className="text-sm font-black text-indigo-400">{masteryPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${masteryPercentage}%` }}
        />
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Topic Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Topic Category
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Mastery Filter
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Flashcards</option>
            <option value="known">Mastered / Known</option>
            <option value="need_practice">Needs Practice</option>
            <option value="unreviewed">Unreviewed Only</option>
          </select>
        </div>
      </div>

      {/* Card Carousel Controls & Counter */}
      {deck.length > 0 && currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Card <strong className="text-white">{currentIndex + 1}</strong> of {deck.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-indigo-400">{currentCard.category}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {currentCard.difficulty}
              </span>
              {currentStatus === 'known' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ✓ Mastered
                </span>
              )}
              {currentStatus === 'need_practice' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ⚠ Needs Practice
                </span>
              )}
            </div>
          </div>

          {/* 3D Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-84 sm:h-80 perspective-1000 cursor-pointer group select-none"
          >
            <div className={`relative w-full h-full duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              
              {/* Front Side */}
              <div className="absolute inset-0 w-full h-full glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between backface-hidden group-hover:border-indigo-500/50 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    {currentCard.category} • {currentCard.difficulty}
                  </span>
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                </div>

                <div className="text-center my-auto px-4">
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white leading-relaxed">
                    "{currentCard.question}"
                  </h3>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click Card to Flip & Reveal Concept</span>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 w-full h-full bg-slate-900/95 rounded-2xl p-6 sm:p-8 border border-indigo-500/40 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Answer & Architecture Takeaways</span>
                  </span>
                  <Award className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="my-auto space-y-3 py-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed font-mono whitespace-pre-line">
                    {currentCard.answer}
                  </p>

                  {currentCard.keyTakeaways && currentCard.keyTakeaways.length > 0 && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 text-xs">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                        Core Interview Takeaways:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {currentCard.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click Card to Flip Back</span>
                </div>
              </div>

            </div>
          </div>

          {/* Action & Mastery Rating Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            {/* Mark Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkKnown}
                className={`flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl border transition-all ${
                  currentStatus === 'known'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{currentStatus === 'known' ? 'Mastered ✓' : 'Mark as Known'}</span>
              </button>

              <button
                type="button"
                onClick={handleMarkNeedPractice}
                className={`flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-xl border transition-all ${
                  currentStatus === 'need_practice'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{currentStatus === 'need_practice' ? 'Needs Practice ⚠' : 'Need Practice'}</span>
              </button>
            </div>

            {/* Navigation & Shuffle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="btn-secondary text-xs font-bold py-2 px-3"
                title="Shuffle Flashcard Deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              <button
                onClick={handleRestart}
                className="btn-secondary text-xs font-bold py-2 px-3"
                title="Restart Deck"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handlePrev}
                className="btn-secondary text-xs font-bold py-2 px-3.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={handleNext}
                className="btn-primary text-xs font-bold py-2 px-4 shadow-md shadow-indigo-600/30"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-heading font-bold text-lg text-white">No Flashcards in this Filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No cards found matching your topic, difficulty, or mastery filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedTopic('All Topics');
              setSelectedDifficulty('All Difficulties');
              setFilterStatus('all');
            }}
            className="btn-secondary text-xs py-2 px-4 font-bold"
          >
            Reset Filters & View All Cards
          </button>
        </div>
      )}

    </div>
  );
}
