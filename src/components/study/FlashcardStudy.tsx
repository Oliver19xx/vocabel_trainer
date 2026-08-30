import React, { useState, useEffect } from 'react';
import { Card, Deck, RecallQuality } from '../../types';
import { AudioButton } from './AudioButton';
import { QualityButtons } from './QualityButtons';
import { Lightbulb, Sparkles, HelpCircle } from 'lucide-react';

interface FlashcardStudyProps {
  card: Card;
  deck: Deck;
  onAnswer: (quality: RecallQuality) => void;
}

export const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ card, deck, onAnswer }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setIsRevealed(false);
    setShowHint(false);
  }, [card.id]);

  // Spacebar to reveal answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space' && !isRevealed) {
        e.preventDefault();
        setIsRevealed(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      {/* Flashcard Container */}
      <div 
        onClick={() => !isRevealed && setIsRevealed(true)}
        className={`w-full min-h-[320px] sm:min-h-[380px] p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between relative transition-all duration-300 ${!isRevealed ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/10' : ''}`}
      >
        {/* Top Header info */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-slate-800/80 text-indigo-400 border border-slate-700/50">
            {isRevealed ? 'Lösung' : 'Frage / Begriff'}
          </span>

          <div className="flex items-center gap-2">
            {card.hint && !showHint && !isRevealed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(true);
                }}
                className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Lightbulb size={14} />
                <span>Hinweis anzeigen</span>
              </button>
            )}
            
            {/* Audio Button for front/back */}
            <AudioButton
              text={isRevealed ? card.back : card.front}
              lang={isRevealed ? deck.target_lang : deck.source_lang}
              size="md"
            />
          </div>
        </div>

        {/* Card Main Body */}
        <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
          {/* Front Prompt */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {card.front}
          </h2>

          {/* Hint if opened */}
          {showHint && card.hint && (
            <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200/90 text-sm max-w-md animate-fade-in flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400 shrink-0" />
              <span>{card.hint}</span>
            </div>
          )}

          {/* Revealed Back */}
          {isRevealed && (
            <div className="mt-8 pt-8 border-t border-slate-800/90 w-full animate-fade-in">
              <p className="text-xs uppercase font-bold text-emerald-400 mb-2 tracking-wider">
                Übersetzung / Bedeutung
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-emerald-300">
                {card.back}
              </h3>

              {card.example_sentence && (
                <div className="mt-4 p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 max-w-lg mx-auto text-sm text-slate-300 italic">
                  &ldquo;{card.example_sentence}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Hint / Action Indicator */}
        <div className="text-center">
          {!isRevealed ? (
            <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
              <HelpCircle size={14} />
              <span>Klicke auf die Karte oder drücke <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">Leertaste</kbd> zum Aufdecken</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Wie gut konntest du dich aktiv erinnern?
            </div>
          )}
        </div>
      </div>

      {/* Quality Rating Controls */}
      <div className="w-full mt-6">
        {isRevealed ? (
          <QualityButtons onSelect={onAnswer} />
        ) : (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="w-full max-w-md mx-auto py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            <span>Antwort aufdecken</span>
          </button>
        )}
      </div>
    </div>
  );
};
