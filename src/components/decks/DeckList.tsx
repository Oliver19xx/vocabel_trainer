import React, { useState } from 'react';
import { Deck, SupportedLanguage } from '../../types';
import { useTrainer } from '../../store/useTrainerStore';
import { DeckCard } from './DeckCard';
import { DeckEditorModal } from './DeckEditorModal';
import { Plus, BookOpen, Sparkles, Flame, Play } from 'lucide-react';

interface DeckListProps {
  onSelectDeck: (deck: Deck) => void;
  onStartStudy: (deck: Deck) => void;
}

export const DeckList: React.FC<DeckListProps> = ({ onSelectDeck, onStartStudy }) => {
  const { decks, createDeck, getAllDueCards, profile } = useTrainer();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dueCards = getAllDueCards();

  const handleSaveNewDeck = async (
    title: string, 
    description: string, 
    source_lang: SupportedLanguage, 
    target_lang: SupportedLanguage, 
    color: string
  ) => {
    await createDeck(title, description, source_lang, target_lang, color);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Flame size={14} className="text-amber-400" />
            <span>Active Recall & Spaced Repetition</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bereit für dein heutiges Training?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Aktives Abrufen festigt dein Langzeitgedächtnis bis zu 3x schneller als passives Wiederholen.
          </p>
        </div>

        {/* Quick action for due cards */}
        {decks.length > 0 && (
          <div className="z-10 flex flex-col sm:flex-row items-stretch gap-3">
            <button
              type="button"
              onClick={() => onStartStudy(decks[0])}
              className="py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              <span>{dueCards.length > 0 ? `${dueCards.length} Vokabeln fällig` : 'Deck trainieren'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>Neues Deck</span>
            </button>
          </div>
        )}
      </div>

      {/* Decks Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Deine Vokabel-Decks</h2>
            <p className="text-xs text-slate-400">Wähle ein Deck zum Lernen oder Verwalten</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} />
            <span>Deck hinzufügen</span>
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
            <BookOpen size={40} className="text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Noch keine Decks vorhanden</h3>
            <p className="text-sm text-slate-400 mb-6">
              Erstelle dein erstes Vokabel-Deck oder importiere bestehende Listen.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Jetzt erstes Deck erstellen</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onSelect={onSelectDeck}
                onStartStudy={onStartStudy}
              />
            ))}

            {/* Create New Deck Card Slot */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="p-8 rounded-3xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 border border-slate-700 group-hover:border-indigo-500/40 flex items-center justify-center mb-3 transition-colors">
                <Plus size={24} />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                Neues Deck erstellen
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Für eine neue Sprache oder ein Fachgebiet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Deck Creator Modal */}
      <DeckEditorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveNewDeck}
      />
    </div>
  );
};
