import React, { useEffect } from 'react';
import { RotateCcw, Flame, CheckCircle2, Zap } from 'lucide-react';
import { RecallQuality } from '../../types';

interface QualityButtonsProps {
  onSelect: (quality: RecallQuality) => void;
  disabled?: boolean;
}

export const QualityButtons: React.FC<QualityButtonsProps> = ({ onSelect, disabled }) => {
  // Add keyboard shortcuts 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // If user is focused on an input element, ignore
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        onSelect(0);
      } else if (e.key === '2') {
        e.preventDefault();
        onSelect(1);
      } else if (e.key === '3') {
        e.preventDefault();
        onSelect(2);
      } else if (e.key === '4') {
        e.preventDefault();
        onSelect(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, disabled]);

  return (
    <div className="w-full max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 0 - Again / Nochmal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(0)}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-500/80 text-rose-300 hover:text-rose-200 transition-all duration-150 shadow-lg hover:shadow-rose-950/30 active:scale-95"
      >
        <div className="flex items-center gap-1.5 mb-1 font-semibold text-sm sm:text-base">
          <RotateCcw size={18} className="text-rose-400 group-hover:rotate-[-45deg] transition-transform" />
          <span>Nochmal</span>
        </div>
        <span className="text-xs text-rose-400/80">&lt; 10 Min</span>
        <span className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">1</span>
      </button>

      {/* 1 - Hard / Schwer */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(1)}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500/80 text-amber-300 hover:text-amber-200 transition-all duration-150 shadow-lg hover:shadow-amber-950/30 active:scale-95"
      >
        <div className="flex items-center gap-1.5 mb-1 font-semibold text-sm sm:text-base">
          <Flame size={18} className="text-amber-400" />
          <span>Schwer</span>
        </div>
        <span className="text-xs text-amber-400/80">~ 1 Tag</span>
        <span className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">2</span>
      </button>

      {/* 2 - Good / Gut */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(2)}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-emerald-950/40 border border-emerald-900/40 hover:border-emerald-500/80 text-emerald-300 hover:text-emerald-200 transition-all duration-150 shadow-lg hover:shadow-emerald-950/30 active:scale-95"
      >
        <div className="flex items-center gap-1.5 mb-1 font-semibold text-sm sm:text-base">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>Gut</span>
        </div>
        <span className="text-xs text-emerald-400/80">3 - 4 Tage</span>
        <span className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">3</span>
      </button>

      {/* 3 - Easy / Einfach */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelect(3)}
        className="group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/40 border border-indigo-900/40 hover:border-indigo-500/80 text-indigo-300 hover:text-indigo-200 transition-all duration-150 shadow-lg hover:shadow-indigo-950/30 active:scale-95"
      >
        <div className="flex items-center gap-1.5 mb-1 font-semibold text-sm sm:text-base">
          <Zap size={18} className="text-indigo-400" />
          <span>Einfach</span>
        </div>
        <span className="text-xs text-indigo-400/80">6+ Tage</span>
        <span className="absolute top-2 right-2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">4</span>
      </button>
    </div>
  );
};
