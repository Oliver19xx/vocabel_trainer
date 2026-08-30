import React, { useState, useEffect, useRef } from 'react';
import { Card, Deck, RecallQuality } from '../../types';
import { checkTypingAnswer } from '../../lib/srs';
import { AudioButton } from './AudioButton';
import { QualityButtons } from './QualityButtons';
import { Check, X, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

interface TypingRecallStudyProps {
  card: Card;
  deck: Deck;
  onAnswer: (quality: RecallQuality, userAnswer: string) => void;
}

export const TypingRecallStudy: React.FC<TypingRecallStudyProps> = ({ card, deck, onAnswer }) => {
  const [userInput, setUserInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<{ isCorrect: boolean; similarity: number; matchedVariant?: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on card switch
  useEffect(() => {
    setUserInput('');
    setIsSubmitted(false);
    setEvaluation(null);
    setShowHint(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [card.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitted) return;

    const result = checkTypingAnswer(userInput, card.back);
    setEvaluation(result);
    setIsSubmitted(true);
  };

  const handleQualitySelect = (quality: RecallQuality) => {
    onAnswer(quality, userInput);
  };

  const handleQuickNext = () => {
    // Default quality based on typing correctness: 2 (Good) if correct, 0 (Again) if wrong
    const quality: RecallQuality = evaluation?.isCorrect ? (evaluation.similarity === 1.0 ? 3 : 2) : 0;
    onAnswer(quality, userInput);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="w-full min-h-[360px] p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            Aktives Eintippen
          </span>

          <div className="flex items-center gap-2">
            {card.hint && !showHint && !isSubmitted && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Lightbulb size={14} />
                <span>Hinweis</span>
              </button>
            )}
            
            <AudioButton
              text={isSubmitted ? card.back : card.front}
              lang={isSubmitted ? deck.target_lang : deck.source_lang}
              size="md"
            />
          </div>
        </div>

        {/* Center Prompt & Input Area */}
        <div className="my-auto py-4 flex flex-col items-center text-center w-full">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Übersetze ins {deck.target_lang.toUpperCase()}:
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
            {card.front}
          </h2>

          {showHint && card.hint && !isSubmitted && (
            <div className="mb-6 p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-200/90 text-sm max-w-md animate-fade-in flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400 shrink-0" />
              <span>{card.hint}</span>
            </div>
          )}

          {/* Typing Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Antwort hier eintippen..."
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full px-5 py-4 bg-slate-950/80 border-2 border-slate-700 focus:border-indigo-500 rounded-2xl text-lg text-white placeholder-slate-500 outline-none transition-all shadow-inner text-center font-medium"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  <span>Überprüfen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserInput('');
                    handleSubmit();
                  }}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
                >
                  Weiß ich nicht
                </button>
              </div>
            </form>
          ) : (
            /* Result Evaluation View */
            <div className="w-full max-w-lg animate-fade-in">
              {evaluation?.isCorrect ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 mb-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg mb-1">
                    <Check size={24} />
                    <span>{evaluation.similarity === 1 ? 'Perfekt richtig!' : 'Richtig! (Toleriert)'}</span>
                  </div>
                  <div className="text-xl font-bold text-white mt-2">
                    {card.back}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 mb-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-lg mb-1">
                    <X size={24} />
                    <span>Leider nicht ganz</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    Deine Eingabe: <span className="line-through text-rose-300 font-mono">{userInput || '(keine Eingabe)'}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    Richtige Lösung: <span className="text-emerald-300 font-bold text-lg">{card.back}</span>
                  </div>
                </div>
              )}

              {card.example_sentence && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-sm text-slate-300 italic mb-4">
                  &ldquo;{card.example_sentence}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom guidance */}
        <div className="text-center text-xs text-slate-400">
          {!isSubmitted ? (
            <span>Drücke <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono text-[11px]">Enter</kbd> zum Absenden</span>
          ) : (
            <span>Bewerte deine Erinnerung oder klicke Weiter</span>
          )}
        </div>
      </div>

      {/* Review Rating when submitted */}
      {isSubmitted && (
        <div className="w-full mt-6 flex flex-col gap-3">
          <QualityButtons onSelect={handleQualitySelect} />
          
          <button
            type="button"
            onClick={handleQuickNext}
            className="w-full max-w-xs mx-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Direkt Weiter</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
