import React from 'react';
import { useTrainer } from '../../store/useTrainerStore';
import { 
  BookOpen, 
  BarChart3, 
  Flame, 
  Settings, 
  LogIn, 
  LogOut, 
  Sparkles, 
  Clock,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentView: 'decks' | 'stats';
  onNavigate: (view: 'decks' | 'stats') => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSettings,
  onOpenLogin
}) => {
  const { user, profile, logout, getAllDueCards, isSupabaseConfigured } = useTrainer();
  const dueCount = getAllDueCards().length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('decks')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Layers size={20} />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Vokabel<span className="text-indigo-400">Trainer</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-1">
              Active Recall SRS
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onNavigate('decks')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${currentView === 'decks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen size={15} />
            <span>Decks</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('stats')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${currentView === 'stats' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart3 size={15} />
            <span>Statistiken</span>
          </button>
        </nav>

        {/* Right Actions (Streak, Auth, Settings) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Indicator */}
          <div 
            title="Aktuelle tägliche Lernserie"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs font-bold"
          >
            <Flame size={15} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span>{profile?.streak_days || 0}d</span>
          </div>

          {/* Due Count */}
          {dueCount > 0 && (
            <div 
              title={`${dueCount} Vokabeln heute fällig`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/50 border border-indigo-800/40 text-indigo-300 text-xs font-bold"
            >
              <Clock size={14} />
              <span>{dueCount}</span>
            </div>
          )}

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-1">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/50"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={logout}
                title="Abmelden"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogIn size={15} />
              <span className="hidden sm:inline">Anmelden</span>
            </button>
          )}

          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Einstellungen"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-950/90 py-1.5 px-4 justify-around text-xs">
        <button
          type="button"
          onClick={() => onNavigate('decks')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl ${currentView === 'decks' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          <BookOpen size={18} />
          <span>Decks</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl ${currentView === 'stats' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          <BarChart3 size={18} />
          <span>Statistiken</span>
        </button>
      </div>
    </header>
  );
};
