import React from 'react';
import { useTrainer } from '../../store/useTrainerStore';
import { Flame, Brain, Award, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  const { getStats, cards, progress, profile } = useTrainer();
  const stats = getStats();

  // Leitner box counts
  const boxCounts = [0, 0, 0, 0, 0];
  cards.forEach(c => {
    const p = progress[c.id];
    if (p && p.box >= 1 && p.box <= 5) {
      boxCounts[p.box - 1]++;
    }
  });

  const masteryPercent = stats.totalCards > 0 
    ? Math.round((stats.masteredCount / stats.totalCards) * 100) 
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Lernfortschritt & Statistiken</h1>
        <p className="text-sm text-slate-400">Verfolge dein Langzeitgedächtnis und deine tägliche Lernserie.</p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Streak</span>
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/40">
              <Flame size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.streakDays} Tage</div>
          <div className="text-[11px] text-slate-400 mt-1">Tägliche Kontinuität</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fällig Heute</span>
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/40">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.dueTodayCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Bereit zur Wiederholung</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Beherrscht</span>
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
              <Award size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.masteredCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{masteryPercent}% aller Vokabeln</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gesamte Vokabeln</span>
            <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40">
              <Brain size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats.totalCards}</div>
          <div className="text-[11px] text-slate-400 mt-1">In {stats.totalDecks} Decks</div>
        </div>
      </div>

      {/* Leitner Box Progress */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-400" />
          <span>Leitner-Boxen (Spaced Repetition Stufen)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Je höher die Box, desto länger ist das Wiederholungsintervall im Langzeitgedächtnis.
        </p>

        <div className="grid grid-cols-5 gap-3">
          {['Box 1 (1 Tag)', 'Box 2 (3-4 Tage)', 'Box 3 (7 Tage)', 'Box 4 (14 Tage)', 'Box 5 (30+ Tage)'].map((label, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-center flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">{label}</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 my-2">{boxCounts[idx]}</p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${stats.totalCards > 0 ? (boxCounts[idx] / stats.totalCards) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Recall Guide Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/30 shadow-xl">
        <div className="flex items-center gap-2.5 text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">
          <Sparkles size={18} />
          <span>Warum Active Recall funktioniert</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Beim traditionellen Lesen (passives Lernen) entsteht die Illusion des Wissens. Beim <strong>Active Recall</strong> zwingst du dein Gehirn, die Information aktiv aus dem Gedächtnisspeicher abzurufen. Dadurch entstehen stärkere neuronale Synapsenverbindungen.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <strong className="text-white block mb-1">1. Abrufen vor Aufdecken</strong>
            Versuche immer zuerst aktiv das Wort im Kopf oder laut auszusprechen.
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <strong className="text-white block mb-1">2. Tipp-Modus nutzen</strong>
            Das Eintippen verhindert Selbsttäuschung bei Rechtschreibung und Endungen.
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <strong className="text-white block mb-1">3. Ehrlich bewerten</strong>
            Bewerte mit &quot;Nochmal&quot;, wenn du gezögert hast, um den optimalen Lernabstand zu treffen.
          </div>
        </div>
      </div>
    </div>
  );
};
