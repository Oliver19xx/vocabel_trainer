import React from 'react';
import { Deck } from '../../types';
import { useTrainer } from '../../store/useTrainerStore';
import { isCardDue, getCardMasteryLevel } from '../../lib/srs';
import { Play, BookOpen, Layers, Sparkles, ChevronRight } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onSelect: (deck: Deck) => void;
  onStartStudy: (deck: Deck) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onSelect, onStartStudy }) => {
  const { getCardsForDeck, progress } = useTrainer();
  const cards = getCardsForDeck(deck.id);

  const dueCards = cards.filter(c => isCardDue(progress[c.id]));
  const masteredCards = cards.filter(c => getCardMasteryLevel(progress[c.id]) === 'mastered');
  
  const masteryPercentage = cards.length > 0 ? Math.round((masteredCards.length / cards.length) * 100) : 0;

  const colorStyles: Record<string, { border: string; badge: string; glow: string }> = {
    indigo: {
      border: 'hover:border-indigo-500/60',
      badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
      glow: 'group-hover:shadow-indigo-500/10'
    },
    emerald: {
      border: 'hover:border-emerald-500/60',
      badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    amber: {
      border: 'hover:border-amber-500/60',
      badge: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
      glow: 'group-hover:shadow-amber-500/10'
    },
    rose: {
      border: 'hover:border-rose-500/60',
      badge: 'bg-rose-950/60 text-rose-300 border-rose-800/40',
      glow: 'group-hover:shadow-rose-500/10'
    },
    purple: {
      border: 'hover:border-purple-500/60',
      badge: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
      glow: 'group-hover:shadow-purple-500/10'
    },
    cyan: {
      border: 'hover:border-cyan-500/60',
      badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40',
      glow: 'group-hover:shadow-cyan-500/10'
    }
  };

  const style = colorStyles[deck.color || 'indigo'] || colorStyles.indigo;

  return (
    <div
      onClick={() => onSelect(deck)}
      className={`group relative p-6 rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${style.border} ${style.glow}`}
    >
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 text-slate-300 border border-slate-800">
            <span>{deck.source_lang.toUpperCase()}</span>
            <span className="text-slate-500">&rarr;</span>
            <span className="text-indigo-400">{deck.target_lang.toUpperCase()}</span>
          </div>

          {dueCards.length > 0 ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/50 animate-pulse">
              {dueCards.length} fällig
            </span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
              Up-to-date ✨
            </span>
          )}
        </div>

        {/* Deck Title & Description */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {deck.title}
        </h3>

        {deck.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {deck.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{cards.length} Vokabeln</span>
          <span>{masteryPercentage}% Beherrscht</span>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-4 border border-slate-800">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${masteryPercentage}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartStudy(deck);
            }}
            disabled={cards.length === 0}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
          >
            <Play size={14} fill="currentColor" />
            <span>Lernen</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(deck);
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Karten anzeigen & bearbeiten"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
