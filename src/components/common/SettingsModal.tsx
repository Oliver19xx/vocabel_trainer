import React, { useState } from 'react';
import { getStoredSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../../lib/supabase';
import { useTrainer } from '../../store/useTrainerStore';
import { X, Database, CheckCircle2, AlertCircle, Key, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { reloadConfig, isSupabaseConfigured, user } = useTrainer();
  const currentConfig = getStoredSupabaseConfig();

  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    reloadConfig();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm('Möchtest du die gespeicherte Supabase-Konfiguration entfernen und in den lokalen Gast-Modus wechseln?')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      reloadConfig();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Einstellungen & Supabase</h3>
            <p className="text-xs text-slate-400">Verbinde deine eigene Supabase Cloud-Datenbank</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Status:</span>
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/40">
              <CheckCircle2 size={14} />
              <span>Supabase konfiguriert {user ? '(Eingeloggt)' : '(Bereit für Login)'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-800/40">
              <AlertCircle size={14} />
              <span>Lokaler Speicher (Gast-Modus)</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-indigo-400" />
              <span>Supabase Project URL</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key size={14} className="text-indigo-400" />
              <span>Supabase Anon / Public Key</span>
            </label>
            <textarea
              rows={2}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none text-xs font-mono resize-none"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Einstellungen erfolgreich gespeichert!</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Verbindung speichern</span>
            </button>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 text-xs font-medium border border-slate-700 transition-colors"
              >
                Trennen / Reset
              </button>
            )}
          </div>
        </form>

        {/* Quick Setup Guide Accordion */}
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 text-xs text-slate-400">
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
            Kurzanleitung zur Supabase-Einrichtung:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
            <li>Erstelle ein kostenloses Projekt auf <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">supabase.com</a>.</li>
            <li>Öffne dort den <strong>SQL Editor</strong> und führe den Inhalt von <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-300">supabase/schema.sql</code> aus.</li>
            <li>Aktiviere unter <strong>Authentication &rarr; Providers &rarr; Google</strong> den Google Login.</li>
            <li>Füge unter <strong>Authentication &rarr; URL Configuration</strong> die URL deiner GitHub Page als Redirect-URL hinzu.</li>
            <li>Kopiere die Project URL & den anon key aus <strong>Project Settings &rarr; API</strong> hierher.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
