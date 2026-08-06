import React, { useState } from 'react';
import { Layers, RotateCw, ArrowLeft, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import { FLASHCARDS_DATA } from '../../data/flashcardsData';

export default function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = FLASHCARDS_DATA[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % FLASHCARDS_DATA.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + FLASHCARDS_DATA.length) % FLASHCARDS_DATA.length);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-xl mb-8 max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-2">
          <Layers className="w-4 h-4" />
          <span>Interactive Study Mode</span>
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-white">System Design & Tech Flashcards</h2>
        <p className="text-xs text-slate-400 mt-1">
          Click on the card to flip and reveal the key architectural answer.
        </p>
      </div>

      {/* Card Carousel Counter */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-4 px-2">
        <span>Card {currentIndex + 1} of {FLASHCARDS_DATA.length}</span>
        <span className="text-indigo-400">{currentCard.category}</span>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 perspective-1000 cursor-pointer group my-6"
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          
          {/* Front of Card */}
          <div className="absolute inset-0 w-full h-full glass-card rounded-2xl p-8 border border-slate-800 flex flex-col justify-between backface-hidden group-hover:border-indigo-500/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{currentCard.category}</span>
              <HelpCircle className="w-5 h-5 text-slate-500" />
            </div>

            <div className="text-center my-auto">
              <h3 className="font-heading font-bold text-xl text-white leading-relaxed">
                "{currentCard.question}"
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to Flip Card</span>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute inset-0 w-full h-full bg-slate-900 rounded-2xl p-8 border border-indigo-500/40 flex flex-col justify-between backface-hidden rotate-y-180">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Answer & Concept</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="text-center my-auto">
              <p className="text-sm font-medium text-slate-200 leading-relaxed font-mono">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to Flip Back</span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          className="btn-secondary text-xs font-bold px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="btn-primary text-xs font-bold px-4 py-2 shadow-lg shadow-indigo-600/30"
        >
          <span>Next Card</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
