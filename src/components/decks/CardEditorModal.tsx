import React, { useState, useEffect } from 'react';
import { Card } from '../../types';
import { X, Sparkles, Plus } from 'lucide-react';

interface CardEditorModalProps {
  isOpen: boolean;
  deckId: string;
  cardToEdit?: Card | null;
  onClose: () => void;
  onSave: (deckId: string, front: string, back: string, hint?: string, example_sentence?: string) => Promise<void>;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  isOpen,
  deckId,
  cardToEdit,
  onClose,
  onSave
}) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [hint, setHint] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cardToEdit) {
      setFront(cardToEdit.front);
      setBack(cardToEdit.back);
      setHint(cardToEdit.hint || '');
      setExampleSentence(cardToEdit.example_sentence || '');
    } else {
      setFront('');
      setBack('');
      setHint('');
      setExampleSentence('');
    }
  }, [cardToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave(deckId, front.trim(), back.trim(), hint.trim(), exampleSentence.trim());
      onClose();
    } catch (err) {
      console.error('Error saving card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {cardToEdit ? 'Vokabel bearbeiten' : 'Neue Vokabel hinzufügen'}
            </h3>
            <p className="text-xs text-slate-400">
              Pflege Begriff, Übersetzung und Beispielsatz ein
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Frage / Ausgangsbegriff *
            </label>
            <input
              type="text"
              required
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="z.B. sich erinnern oder to recall"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Antwort / Zielsprache (Lösung) *
            </label>
            <input
              type="text"
              required
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="z.B. to recall (Mehrere Varianten mit Komma trennen)"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Hinweis / Eselsbrücke (optional)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="z.B. Unregelmäßiges Verb oder Merkhilfe"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Beispielsatz (optional)
            </label>
            <textarea
              rows={2}
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="z.B. Active recall is essential for memory retention."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !front.trim() || !back.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>{cardToEdit ? 'Speichern' : 'Hinzufügen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
