import React, { useState } from 'react';
import { useTrainer, TrainerProvider } from './store/useTrainerStore';
import { Navbar } from './components/common/Navbar';
import { DeckList } from './components/decks/DeckList';
import { DeckDetailView } from './components/decks/DeckDetailView';
import { StudySession } from './components/study/StudySession';
import { StatsDashboard } from './components/stats/StatsDashboard';
import { SettingsModal } from './components/common/SettingsModal';
import { LoginModal } from './components/auth/LoginModal';
import { ImpressumModal } from './components/common/ImpressumModal';
import { Deck } from './types';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isLoading } = useTrainer();

  const [currentView, setCurrentView] = useState<'decks' | 'stats'>('decks');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<Deck | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isImpressumOpen, setIsImpressumOpen] = useState(false);

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setStudyingDeck(null);
  };

  const handleStartStudy = (deck: Deck) => {
    setStudyingDeck(deck);
  };

  const handleExitStudy = () => {
    setStudyingDeck(null);
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
    setStudyingDeck(null);
    setCurrentView('decks');
  };

  const handleNavigate = (view: 'decks' | 'stats') => {
    setCurrentView(view);
    setSelectedDeck(null);
    setStudyingDeck(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
        <span className="text-sm font-medium">VokabelTrainer wird geladen...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        {studyingDeck ? (
          /* Study Session in progress */
          <StudySession
            deck={studyingDeck}
            onExit={handleExitStudy}
          />
        ) : selectedDeck ? (
          /* Single Deck Detail View */
          <DeckDetailView
            deck={selectedDeck}
            onBack={handleBackToDecks}
            onStartStudy={handleStartStudy}
          />
        ) : currentView === 'stats' ? (
          /* Stats & Analytics Dashboard */
          <StatsDashboard />
        ) : (
          /* Main Decks Grid Overview */
          <DeckList
            onSelectDeck={handleSelectDeck}
            onStartStudy={handleStartStudy}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} VokabelTrainer &bull; Active Recall & Spaced Repetition</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsImpressumOpen(true)}
              className="text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Impressum &amp; Datenschutz
            </button>
            <span>&bull;</span>
            <span>Gehostet auf GitHub Pages</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ImpressumModal
        isOpen={isImpressumOpen}
        onClose={() => setIsImpressumOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <TrainerProvider>
      <AppContent />
    </TrainerProvider>
  );
}

export default App;
