import React, { useState, useMemo } from 'react';
import { Deck, Card } from '../../types';
import { useTrainer } from '../../store/useTrainerStore';
import { CardEditorModal } from './CardEditorModal';
import { ImportExportModal } from './ImportExportModal';
import { DeckEditorModal } from './DeckEditorModal';
import { AudioButton } from '../study/AudioButton';
import { getCardMasteryLevel, isCardDue } from '../../lib/srs';
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Upload, 
  Edit3, 
  Trash2, 
  Search, 
  BookOpen, 
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';

interface DeckDetailViewProps {
  deck: Deck;
  onBack: () => void;
  onStartStudy: (deck: Deck) => void;
}

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({ deck, onBack, onStartStudy }) => {
  const { 
    getCardsForDeck, 
    progress, 
    deleteCard, 
    createCard, 
    updateCard, 
    updateDeck, 
    deleteDeck, 
    bulkImportCards,
    resetDeckProgress
  } = useTrainer();

  const cards = getCardsForDeck(deck.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'due' | 'new' | 'mastered'>('all');
  
  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const p = progress[c.id];
      const matchesSearch = 
        c.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.hint && c.hint.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'due') return isCardDue(p);
      if (filter === 'new') return getCardMasteryLevel(p) === 'new';
      if (filter === 'mastered') return getCardMasteryLevel(p) === 'mastered';
      return true;
    });
  }, [cards, progress, searchQuery, filter]);

  const dueCount = cards.filter(c => isCardDue(progress[c.id])).length;

  const handleSaveCard = async (deckId: string, front: string, back: string, hint?: string, example_sentence?: string) => {
    if (cardToEdit) {
      await updateCard(cardToEdit.id, { front, back, hint, example_sentence });
    } else {
      await createCard(deckId, front, back, hint, example_sentence);
    }
  };

  const handleDeleteDeck = async () => {
    if (window.confirm(`Möchtest du das Deck "${deck.title}" mit allen ${cards.length} Vokabeln wirklich unwiderruflich löschen?`)) {
      await deleteDeck(deck.id);
      onBack();
    }
  };

  const handleResetProgress = async () => {
    if (window.confirm(`Möchtest du den Lernfortschritt für "${deck.title}" zurücksetzen? Alle Vokabeln werden wieder als 'Neu' eingestuft.`)) {
      await resetDeckProgress(deck.id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Alle Decks</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditDeckModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Deck bearbeiten"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={handleResetProgress}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-colors"
            title="Fortschritt zurücksetzen"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={handleDeleteDeck}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Deck löschen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Hero Deck Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <span>{deck.source_lang.toUpperCase()}</span>
            <span>&rarr;</span>
            <span>{deck.target_lang.toUpperCase()}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {deck.title}
          </h1>

          {deck.description && (
            <p className="text-sm text-slate-400 leading-relaxed">
              {deck.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
            <span><strong>{cards.length}</strong> Vokabeln gesamt</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-semibold"><strong>{dueCount}</strong> heute fällig</span>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => onStartStudy(deck)}
            disabled={cards.length === 0}
            className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5"
          >
            <Play size={18} fill="currentColor" />
            <span>Jetzt Trainieren ({dueCount > 0 ? `${dueCount} fällig` : 'Alle'})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCardToEdit(null);
              setIsCardModalOpen(true);
            }}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>Karte hinzufügen</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center"
            title="Import / Export"
          >
            <Upload size={18} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Vokabeln durchsuchen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 text-xs outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Alle ({cards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('due')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === 'due' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Fällig ({dueCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('new')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === 'new' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Neu
          </button>
          <button
            type="button"
            onClick={() => setFilter('mastered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === 'mastered' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Beherrscht
          </button>
        </div>
      </div>

      {/* Cards List / Grid */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <BookOpen size={36} className="text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Keine Vokabeln gefunden</h3>
          <p className="text-xs text-slate-400 mb-4">
            {searchQuery ? 'Passe deinen Suchbegriff oder Filter an' : 'Füge deine erste Vokabel zu diesem Deck hinzu'}
          </p>
          <button
            type="button"
            onClick={() => {
              setCardToEdit(null);
              setIsCardModalOpen(true);
            }}
            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Erste Vokabel erstellen</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const prog = progress[card.id];
            const isDue = isCardDue(prog);
            const mastery = getCardMasteryLevel(prog);

            return (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        masteredCountClass(mastery)
                      }`}>
                        {mastery === 'mastered' ? 'Beherrscht' : (mastery === 'learning' ? `Box ${prog?.box || 1}` : 'Neu')}
                      </span>

                      {isDue && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          Heute fällig
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <AudioButton
                        text={card.back}
                        lang={deck.target_lang}
                        size="sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCardToEdit(card);
                          setIsCardModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCard(card.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Vocabulary pair */}
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">{card.front}</p>
                    <h4 className="text-lg font-bold text-white tracking-tight">{card.back}</h4>
                  </div>

                  {card.hint && (
                    <p className="text-xs text-amber-300/80 mt-2 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30">
                      💡 {card.hint}
                    </p>
                  )}

                  {card.example_sentence && (
                    <p className="text-xs text-slate-400 italic mt-2">
                      &ldquo;{card.example_sentence}&rdquo;
                    </p>
                  )}
                </div>

                {/* Bottom SRS Meta */}
                {prog && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Wdh: {prog.repetitions} &bull; Intervall: {prog.interval_days} Tage</span>
                    <span>Nächste: {new Date(prog.next_review_at).toLocaleDateString('de-DE')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CardEditorModal
        isOpen={isCardModalOpen}
        deckId={deck.id}
        cardToEdit={cardToEdit}
        onClose={() => {
          setIsCardModalOpen(false);
          setCardToEdit(null);
        }}
        onSave={handleSaveCard}
      />

      <ImportExportModal
        isOpen={isImportModalOpen}
        deck={deck}
        cards={cards}
        onClose={() => setIsImportModalOpen(false)}
        onImport={bulkImportCards}
      />

      <DeckEditorModal
        isOpen={isEditDeckModalOpen}
        deckToEdit={deck}
        onClose={() => setIsEditDeckModalOpen(false)}
        onSave={async (title, description, source_lang, target_lang, color) => {
          await updateDeck(deck.id, { title, description, source_lang, target_lang, color });
        }}
      />
    </div>
  );
};

function masteredCountClass(mastery: 'new' | 'learning' | 'mastered'): string {
  switch (mastery) {
    case 'mastered':
      return 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40';
    case 'learning':
      return 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}
