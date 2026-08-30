import React, { useState } from 'react';
import { Card, Deck } from '../../types';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  deck: Deck;
  cards: Card[];
  onClose: () => void;
  onImport: (deckId: string, cards: Array<{ front: string; back: string; hint?: string; example_sentence?: string }>) => Promise<number>;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  deck,
  cards,
  onClose,
  onImport
}) => {
  const [tab, setTab] = useState<'import' | 'export'>('import');
  const [rawText, setRawText] = useState('');
  const [parsedCards, setParsedCards] = useState<Array<{ front: string; back: string; hint?: string; example_sentence?: string }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setRawText(text);
    setImportedCount(null);
    if (!text.trim()) {
      setParsedCards([]);
      return;
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const results: Array<{ front: string; back: string; hint?: string; example_sentence?: string }> = [];

    for (const line of lines) {
      // Try semicolon, comma, tab, pipe, or hyphen delimiters
      let parts: string[] = [];
      if (line.includes(';')) parts = line.split(';');
      else if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes('|')) parts = line.split('|');
      else if (line.includes(' - ')) parts = line.split(' - ');
      else if (line.includes(',')) parts = line.split(',');

      if (parts.length >= 2) {
        results.push({
          front: parts[0].trim(),
          back: parts[1].trim(),
          hint: parts[2]?.trim() || '',
          example_sentence: parts[3]?.trim() || ''
        });
      }
    }

    setParsedCards(results);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    if (parsedCards.length === 0) return;
    try {
      setIsImporting(true);
      const count = await onImport(deck.id, parsedCards);
      setImportedCount(count);
      setRawText('');
      setParsedCards([]);
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setIsImporting(false);
    }
  };

  // Export handlers
  const exportAsCSV = () => {
    const header = 'Frage / Front;Antwort / Back;Hinweis;Beispielsatz\n';
    const rows = cards.map(c => 
      `"${c.front.replace(/"/g, '""')}";"${c.back.replace(/"/g, '""')}";"${(c.hint || '').replace(/"/g, '""')}";"${(c.example_sentence || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.title.replace(/\s+/g, '_')}_vokabeln.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const data = JSON.stringify({
      deck: {
        title: deck.title,
        description: deck.description,
        source_lang: deck.source_lang,
        target_lang: deck.target_lang
      },
      cards: cards.map(c => ({
        front: c.front,
        back: c.back,
        hint: c.hint,
        example_sentence: c.example_sentence
      }))
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.title.replace(/\s+/g, '_')}_vokabeln.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Tab Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all ${tab === 'import' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Upload size={18} />
            <span>CSV / Text Import</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('export')}
            className={`flex items-center gap-2 pb-2 text-sm font-semibold border-b-2 transition-all ${tab === 'export' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Download size={18} />
            <span>Exportieren</span>
          </button>
        </div>

        {tab === 'import' ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <p className="text-xs text-slate-400">
              Füge Vokabeln im Format <code className="text-indigo-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">Wort; Übersetzung; Hinweis</code> zeilenweise ein oder lade eine CSV-Datei hoch.
            </p>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors">
                <FileText size={16} />
                <span>CSV-Datei auswählen</span>
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="z.B.&#10;to recall; sich erinnern; Verb&#10;essential; unverzichtbar; Adjektiv&#10;to achieve; erreichen"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-xs font-mono"
            />

            {/* Parse preview */}
            {parsedCards.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Vorschau ({parsedCards.length} Vokabeln erkannt):</span>
                </div>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 p-2 space-y-1">
                  {parsedCards.slice(0, 10).map((c, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 px-2 border-b border-slate-800/50 last:border-0 font-mono">
                      <span className="text-white font-medium">{c.front}</span>
                      <span className="text-indigo-400">{c.back}</span>
                    </div>
                  ))}
                  {parsedCards.length > 10 && (
                    <div className="text-[11px] text-slate-500 text-center py-1">
                      ... und {parsedCards.length - 10} weitere
                    </div>
                  )}
                </div>
              </div>
            )}

            {importedCount !== null && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{importedCount} Vokabeln erfolgreich in &quot;{deck.title}&quot; importiert!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Schließen
              </button>
              <button
                type="button"
                disabled={isImporting || parsedCards.length === 0}
                onClick={executeImport}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Upload size={16} />
                <span>{parsedCards.length} Vokabeln importieren</span>
              </button>
            </div>
          </div>
        ) : (
          /* Export Tab */
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Exportiere alle <strong className="text-white">{cards.length} Vokabeln</strong> aus diesem Deck für Backups oder zum Teilen.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={exportAsCSV}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col items-center text-center group"
              >
                <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">CSV-Tabelle (.csv)</h4>
                <p className="text-xs text-slate-400">Kompatibel mit Excel, Anki und Google Sheets</p>
              </button>

              <button
                type="button"
                onClick={exportAsJSON}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col items-center text-center group"
              >
                <div className="p-3 rounded-xl bg-emerald-600/20 text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <Download size={24} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">JSON-Backup (.json)</h4>
                <p className="text-xs text-slate-400">Vollständiges strukturiertes Datenformat</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
