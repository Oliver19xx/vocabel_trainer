import React, { useState, useEffect } from 'react';
import { Deck, SupportedLanguage } from '../../types';
import { X, BookOpen, Sparkles } from 'lucide-react';

interface DeckEditorModalProps {
  isOpen: boolean;
  deckToEdit?: Deck | null;
  onClose: () => void;
  onSave: (title: string, description: string, source_lang: SupportedLanguage, target_lang: SupportedLanguage, color: string) => Promise<void>;
}

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'Englisch', flag: '🇬🇧' },
  { code: 'es', label: 'Spanisch', flag: '🇪🇸' },
  { code: 'fr', label: 'Französisch', flag: '🇫🇷' },
  { code: 'it', label: 'Italienisch', flag: '🇮🇹' },
  { code: 'pt', label: 'Portugiesisch', flag: '🇵🇹' },
  { code: 'ru', label: 'Russisch', flag: '🇷🇺' },
  { code: 'zh', label: 'Chinesisch', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanisch', flag: '🇯🇵' },
  { code: 'ko', label: 'Koreanisch', flag: '🇰🇷' },
  { code: 'la', label: 'Latein', flag: '🏛️' },
  { code: 'other', label: 'Sonstige', flag: '🌐' }
];

const COLORS = [
  { id: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-500' }
];

export const DeckEditorModal: React.FC<DeckEditorModalProps> = ({
  isOpen,
  deckToEdit,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceLang, setSourceLang] = useState<SupportedLanguage>('de');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('en');
  const [color, setColor] = useState('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deckToEdit) {
      setTitle(deckToEdit.title);
      setDescription(deckToEdit.description || '');
      setSourceLang(deckToEdit.source_lang);
      setTargetLang(deckToEdit.target_lang);
      setColor(deckToEdit.color || 'indigo');
    } else {
      setTitle('');
      setDescription('');
      setSourceLang('de');
      setTargetLang('en');
      setColor('indigo');
    }
  }, [deckToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave(title.trim(), description.trim(), sourceLang, targetLang, color);
      onClose();
    } catch (err) {
      console.error('Error saving deck:', err);
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
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {deckToEdit ? 'Deck bearbeiten' : 'Neues Deck erstellen'}
            </h3>
            <p className="text-xs text-slate-400">
              Organisiere deine Vokabeln in thematischen Decks
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Deck-Titel *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Englisch B2 Business oder Urlaub Spanisch"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Beschreibung (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Worum geht es in diesem Deck?"
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-sm resize-none"
            />
          </div>

          {/* Languages selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Ausgangssprache
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value as SupportedLanguage)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none text-sm"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Zielsprache
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as SupportedLanguage)}
                className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none text-sm"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Akzentfarbe
            </label>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all ${color === c.id ? 'ring-4 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
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
              disabled={isSubmitting || !title.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>{deckToEdit ? 'Speichern' : 'Erstellen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
