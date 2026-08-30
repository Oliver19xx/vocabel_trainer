import React, { useEffect } from 'react';
import { Trophy, CheckCircle2, RotateCcw, ArrowRight, Flame } from 'lucide-react';
import { StudyResult } from '../../types';
import { triggerConfetti } from '../common/Confetti';

interface StudySummaryProps {
  results: StudyResult[];
  deckTitle: string;
  onRestart: () => void;
  onBackToDecks: () => void;
}

export const StudySummary: React.FC<StudySummaryProps> = ({
  results,
  deckTitle,
  onRestart,
  onBackToDecks
}) => {
  const total = results.length;
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  // Again / Hard / Good / Easy breakdown
  const againCount = results.filter(r => r.quality === 0).length;
  const hardCount = results.filter(r => r.quality === 1).length;
  const goodCount = results.filter(r => r.quality === 2).length;
  const easyCount = results.filter(r => r.quality === 3).length;

  useEffect(() => {
    if (accuracy >= 70) {
      triggerConfetti();
    }
  }, [accuracy]);

  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
        <Trophy size={36} className="text-amber-400" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
        Klasse Leistung! 🎉
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        Du hast die Lerneinheit für <span className="text-indigo-300 font-semibold">{deckTitle}</span> abgeschlossen.
      </p>

      {/* Main Score stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 uppercase font-semibold">Erfolgsquote</span>
          <p className="text-3xl font-black text-indigo-400 mt-1">{accuracy}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-xs text-slate-400 uppercase font-semibold">Wiederholt</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">{total} Vokabeln</p>
        </div>
      </div>

      {/* Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 mb-8 text-left">
        <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-between">
          <span>Erinnerungs-Verteilung</span>
          <span className="text-emerald-400 font-medium">{correctCount} von {total} gemerkt</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-900/30">
            <span className="text-rose-400 font-bold block text-sm">{againCount}</span>
            <span className="text-slate-400 text-[11px]">Nochmal</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-900/30">
            <span className="text-amber-400 font-bold block text-sm">{hardCount}</span>
            <span className="text-slate-400 text-[11px]">Schwer</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30">
            <span className="text-emerald-400 font-bold block text-sm">{goodCount}</span>
            <span className="text-slate-400 text-[11px]">Gut</span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-900/30">
            <span className="text-indigo-400 font-bold block text-sm">{easyCount}</span>
            <span className="text-slate-400 text-[11px]">Einfach</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          <span>Erneut lernen</span>
        </button>

        <button
          type="button"
          onClick={onBackToDecks}
          className="flex-1 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <span>Zurück zur Übersicht</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
