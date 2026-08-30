import React, { useState, useMemo } from 'react';
import { Card, Deck, StudyMode, RecallQuality, StudyResult } from '../../types';
import { useTrainer } from '../../store/useTrainerStore';
import { FlashcardStudy } from './FlashcardStudy';
import { TypingRecallStudy } from './TypingRecallStudy';
import { StudySummary } from './StudySummary';
import { ArrowLeft, Layers, Keyboard, Sparkles, SlidersHorizontal } from 'lucide-react';

interface StudySessionProps {
  deck: Deck;
  onExit: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ deck, onExit }) => {
  const { getDueCardsForDeck, getCardsForDeck, submitReview } = useTrainer();
  
  // Study Mode: flashcard, typing
  const [studyMode, setStudyMode] = useState<StudyMode>('flashcard');
  const [studyAll, setStudyAll] = useState<boolean>(false);

  // Determine cards to study
  const cardsToStudy = useMemo(() => {
    const dueCards = getDueCardsForDeck(deck.id);
    if (dueCards.length > 0 && !studyAll) {
      return dueCards;
    }
    const allCards = getCardsForDeck(deck.id);
    return allCards;
  }, [deck.id, studyAll, getDueCardsForDeck, getCardsForDeck]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());

  const currentCard = cardsToStudy[currentIndex];

  const handleAnswer = async (quality: RecallQuality, userAnswer?: string) => {
    if (!currentCard) return;

    const timeSpent = Date.now() - cardStartTime;
    const result = await submitReview(currentCard.id, quality, userAnswer, timeSpent);
    setResults(prev => [...prev, result]);

    if (currentIndex + 1 < cardsToStudy.length) {
      setCurrentIndex(prev => prev + 1);
      setCardStartTime(Date.now());
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setResults([]);
    setIsCompleted(false);
    setCardStartTime(Date.now());
  };

  if (cardsToStudy.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Keine Vokabeln vorhanden</h3>
        <p className="text-sm text-slate-400 mb-6">
          Füge diesem Deck zuerst einige Vokabelkarten hinzu, um mit dem Training zu starten.
        </p>
        <button
          type="button"
          onClick={onExit}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
        >
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <StudySummary
        results={results}
        deckTitle={deck.title}
        onRestart={handleRestart}
        onBackToDecks={onExit}
      />
    );
  }

  const progressPercentage = Math.round(((currentIndex) / cardsToStudy.length) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Session Top Navigation & Progress */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Beenden</span>
        </button>

        {/* Mode Switcher */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setStudyMode('flashcard')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${studyMode === 'flashcard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers size={14} />
            <span>Karteikarte</span>
          </button>
          <button
            type="button"
            onClick={() => setStudyMode('typing')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-all ${studyMode === 'typing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Keyboard size={14} />
            <span>Eintippen</span>
          </button>
        </div>

        {/* Counter Badge */}
        <div className="text-sm font-semibold text-slate-300 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono">
          {currentIndex + 1} / {cardsToStudy.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div 
          className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Active Study View */}
      {studyMode === 'flashcard' ? (
        <FlashcardStudy
          key={currentCard.id}
          card={currentCard}
          deck={deck}
          onAnswer={handleAnswer}
        />
      ) : (
        <TypingRecallStudy
          key={currentCard.id}
          card={currentCard}
          deck={deck}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
};
