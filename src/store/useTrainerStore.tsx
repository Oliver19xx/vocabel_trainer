import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { Deck, Card, CardProgress, UserProfile, RecallQuality, StudyResult, SupportedLanguage } from '../types';
import { getSupabase, getStoredSupabaseConfig, signInWithGoogle as supabaseSignInGoogle, signOut as supabaseSignOut } from '../lib/supabase';
import { INITIAL_DECKS, INITIAL_CARDS } from '../lib/sampleData';
import { calculateNextReview, isCardDue, getCardMasteryLevel } from '../lib/srs';

const LOCAL_DECKS_KEY = 'vokabel_local_decks';
const LOCAL_CARDS_KEY = 'vokabel_local_cards';
const LOCAL_PROGRESS_KEY = 'vokabel_local_progress';
const LOCAL_PROFILE_KEY = 'vokabel_local_profile';

interface TrainerContextType {
  user: User | null;
  profile: UserProfile | null;
  decks: Deck[];
  cards: Card[];
  progress: Record<string, CardProgress>; // card_id -> CardProgress
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  
  // Auth actions
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  reloadConfig: () => void;

  // Deck actions
  createDeck: (title: string, description: string, source_lang: SupportedLanguage, target_lang: SupportedLanguage, color?: string) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;

  // Card actions
  createCard: (deck_id: string, front: string, back: string, hint?: string, example_sentence?: string, tags?: string[]) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  bulkImportCards: (deck_id: string, cards: Array<{ front: string; back: string; hint?: string; example_sentence?: string }>) => Promise<number>;

  // Study actions
  submitReview: (card_id: string, quality: RecallQuality, userAnswer?: string, timeSpentMs?: number) => Promise<StudyResult>;
  resetDeckProgress: (deck_id: string) => Promise<void>;
  
  // Helpers
  getCardsForDeck: (deck_id: string) => Card[];
  getDueCardsForDeck: (deck_id: string) => Card[];
  getAllDueCards: () => Card[];
  getStats: () => {
    totalDecks: number;
    totalCards: number;
    dueTodayCount: number;
    masteredCount: number;
    learningCount: number;
    newCount: number;
    streakDays: number;
  };
}

const TrainerContext = createContext<TrainerContextType | null>(null);

export const TrainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [progress, setProgress] = useState<Record<string, CardProgress>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  // Initialize data from LocalStorage
  const loadLocalData = useCallback(() => {
    try {
      const storedDecks = localStorage.getItem(LOCAL_DECKS_KEY);
      const storedCards = localStorage.getItem(LOCAL_CARDS_KEY);
      const storedProgress = localStorage.getItem(LOCAL_PROGRESS_KEY);
      const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);

      if (storedDecks) {
        setDecks(JSON.parse(storedDecks));
      } else {
        setDecks(INITIAL_DECKS);
        localStorage.setItem(LOCAL_DECKS_KEY, JSON.stringify(INITIAL_DECKS));
      }

      if (storedCards) {
        setCards(JSON.parse(storedCards));
      } else {
        setCards(INITIAL_CARDS);
        localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(INITIAL_CARDS));
      }

      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      } else {
        setProgress({});
      }

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        const defaultProfile: UserProfile = {
          id: 'local-guest-user',
          display_name: 'Lern-Entdecker',
          streak_days: 1,
          last_study_date: new Date().toISOString().split('T')[0],
          total_cards_reviewed: 0
        };
        setProfile(defaultProfile);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
      }
    } catch (e) {
      console.error('Error loading local data:', e);
      setDecks(INITIAL_DECKS);
      setCards(INITIAL_CARDS);
    }
  }, []);

  // Save to LocalStorage whenever state changes in guest mode
  useEffect(() => {
    if (!user) {
      if (decks.length > 0) localStorage.setItem(LOCAL_DECKS_KEY, JSON.stringify(decks));
      if (cards.length > 0) localStorage.setItem(LOCAL_CARDS_KEY, JSON.stringify(cards));
      localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
      if (profile) localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    }
  }, [decks, cards, progress, profile, user]);

  // Load Remote Data from Supabase
  const loadSupabaseData = useCallback(async (currentUser: User) => {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      setIsLoading(true);

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as UserProfile);
      } else {
        const newProf: UserProfile = {
          id: currentUser.id,
          display_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
          avatar_url: currentUser.user_metadata?.avatar_url,
          streak_days: 0,
          total_cards_reviewed: 0,
          last_study_date: null
        };
        await supabase.from('user_profiles').upsert(newProf);
        setProfile(newProf);
      }

      // 2. Fetch Decks
      const { data: remoteDecks, error: decksErr } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (decksErr) throw decksErr;

      // 3. Fetch Cards
      const { data: remoteCards, error: cardsErr } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', currentUser.id);

      if (cardsErr) throw cardsErr;

      // 4. Fetch Progress
      const { data: remoteProgress, error: progErr } = await supabase
        .from('card_progress')
        .select('*')
        .eq('user_id', currentUser.id);

      if (progErr) throw progErr;

      // If user has no remote decks yet, we can copy local sample decks for them!
      if (!remoteDecks || remoteDecks.length === 0) {
        // Insert starter decks into Supabase
        const starterDecksToInsert = INITIAL_DECKS.map(d => ({
          user_id: currentUser.id,
          title: d.title,
          description: d.description,
          source_lang: d.source_lang,
          target_lang: d.target_lang,
          color: d.color
        }));

        const { data: insertedDecks } = await supabase
          .from('decks')
          .insert(starterDecksToInsert)
          .select();

        if (insertedDecks && insertedDecks.length > 0) {
          setDecks(insertedDecks as Deck[]);
          
          // Insert sample cards for first deck
          const englishDeck = insertedDecks[0];
          const cardsToInsert = INITIAL_CARDS.map(c => ({
            deck_id: englishDeck.id,
            user_id: currentUser.id,
            front: c.front,
            back: c.back,
            hint: c.hint,
            example_sentence: c.example_sentence,
            tags: c.tags
          }));

          const { data: insertedCards } = await supabase
            .from('cards')
            .insert(cardsToInsert)
            .select();

          if (insertedCards) setCards(insertedCards as Card[]);
        }
      } else {
        setDecks(remoteDecks as Deck[]);
        setCards((remoteCards || []) as Card[]);
        
        const progMap: Record<string, CardProgress> = {};
        (remoteProgress || []).forEach((p: CardProgress) => {
          progMap[p.card_id] = p;
        });
        setProgress(progMap);
      }
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize Auth & Supabase State
  const initApp = useCallback(async () => {
    setIsLoading(true);
    const config = getStoredSupabaseConfig();
    setIsSupabaseConfigured(config.isConfigured);

    if (config.isConfigured) {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadSupabaseData(session.user);
        } else {
          setUser(null);
          loadLocalData();
          setIsLoading(false);
        }

        // Listen for auth state changes (e.g. OAuth redirect return)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.user) {
            setUser(newSession.user);
            await loadSupabaseData(newSession.user);
          } else {
            setUser(null);
            loadLocalData();
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }

    loadLocalData();
    setIsLoading(false);
  }, [loadLocalData, loadSupabaseData]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  const reloadConfig = useCallback(() => {
    initApp();
  }, [initApp]);

  // Auth Functions
  const loginWithGoogle = async () => {
    return await supabaseSignInGoogle();
  };

  const logout = async () => {
    await supabaseSignOut();
    setUser(null);
    loadLocalData();
  };

  // Streak Tracker Helper
  const checkAndUpdateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!profile) return;

    let newStreak = profile.streak_days;
    const lastDate = profile.last_study_date;

    if (!lastDate) {
      newStreak = 1;
    } else if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1; // streak broke
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      streak_days: newStreak,
      last_study_date: today,
      total_cards_reviewed: (profile.total_cards_reviewed || 0) + 1
    };

    setProfile(updatedProfile);

    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('user_profiles').upsert(updatedProfile);
      }
    }
  }, [profile, user]);

  // Deck CRUD
  const createDeck = async (
    title: string, 
    description: string, 
    source_lang: SupportedLanguage, 
    target_lang: SupportedLanguage, 
    color: string = 'indigo'
  ): Promise<Deck> => {
    const newDeck: Deck = {
      id: user ? crypto.randomUUID() : `deck-${Date.now()}`,
      user_id: user?.id,
      title,
      description,
      source_lang,
      target_lang,
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.from('decks').insert(newDeck).select().single();
        if (error) throw error;
        setDecks(prev => [data as Deck, ...prev]);
        return data as Deck;
      }
    }

    setDecks(prev => [newDeck, ...prev]);
    return newDeck;
  };

  const updateDeck = async (id: string, updates: Partial<Deck>) => {
    const updatedFields = { ...updates, updated_at: new Date().toISOString() };
    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('decks').update(updatedFields).eq('id', id);
        if (error) throw error;
      }
    }
    setDecks(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
  };

  const deleteDeck = async (id: string) => {
    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('decks').delete().eq('id', id);
        if (error) throw error;
      }
    }
    setDecks(prev => prev.filter(d => d.id !== id));
    setCards(prev => prev.filter(c => c.deck_id !== id));
  };

  // Card CRUD
  const createCard = async (
    deck_id: string, 
    front: string, 
    back: string, 
    hint?: string, 
    example_sentence?: string, 
    tags: string[] = []
  ): Promise<Card> => {
    const newCard: Card = {
      id: user ? crypto.randomUUID() : `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      deck_id,
      user_id: user?.id,
      front: front.trim(),
      back: back.trim(),
      hint: hint?.trim() || '',
      example_sentence: example_sentence?.trim() || '',
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.from('cards').insert(newCard).select().single();
        if (error) throw error;
        setCards(prev => [...prev, data as Card]);
        return data as Card;
      }
    }

    setCards(prev => [...prev, newCard]);
    return newCard;
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    const updatedFields = { ...updates, updated_at: new Date().toISOString() };
    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('cards').update(updatedFields).eq('id', id);
        if (error) throw error;
      }
    }
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCard = async (id: string) => {
    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from('cards').delete().eq('id', id);
        if (error) throw error;
      }
    }
    setCards(prev => prev.filter(c => c.id !== id));
    setProgress(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const bulkImportCards = async (
    deck_id: string, 
    importedCards: Array<{ front: string; back: string; hint?: string; example_sentence?: string }>
  ): Promise<number> => {
    const newCards: Card[] = importedCards.map(c => ({
      id: user ? crypto.randomUUID() : `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      deck_id,
      user_id: user?.id,
      front: c.front.trim(),
      back: c.back.trim(),
      hint: c.hint?.trim() || '',
      example_sentence: c.example_sentence?.trim() || '',
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.from('cards').insert(newCards).select();
        if (error) throw error;
        if (data) {
          setCards(prev => [...prev, ...(data as Card[])]);
          return data.length;
        }
      }
    }

    setCards(prev => [...prev, ...newCards]);
    return newCards.length;
  };

  // Active Recall Review Submission
  const submitReview = async (
    card_id: string, 
    quality: RecallQuality, 
    userAnswer?: string, 
    timeSpentMs: number = 0
  ): Promise<StudyResult> => {
    const currentProg = progress[card_id];
    const nextProgData = calculateNextReview(currentProg, quality);

    const updatedProg: CardProgress = {
      id: currentProg?.id || (user ? crypto.randomUUID() : `prog-${card_id}`),
      card_id,
      user_id: user?.id,
      interval_days: nextProgData.interval_days,
      ease_factor: nextProgData.ease_factor,
      repetitions: nextProgData.repetitions,
      box: nextProgData.box,
      last_quality: nextProgData.last_quality,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextProgData.next_review_at,
      created_at: currentProg?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update local progress state immediately
    setProgress(prev => ({
      ...prev,
      [card_id]: updatedProg
    }));

    // Update streak & count
    await checkAndUpdateStreak();

    // Supabase update if logged in
    if (user) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('card_progress').upsert(updatedProg, { onConflict: 'card_id' });
      }
    }

    return {
      cardId: card_id,
      quality,
      userAnswer,
      correct: quality >= 2,
      timeSpentMs
    };
  };

  const resetDeckProgress = async (deck_id: string) => {
    const deckCards = cards.filter(c => c.deck_id === deck_id);
    const cardIds = deckCards.map(c => c.id);

    setProgress(prev => {
      const copy = { ...prev };
      cardIds.forEach(id => delete copy[id]);
      return copy;
    });

    if (user) {
      const supabase = getSupabase();
      if (supabase && cardIds.length > 0) {
        await supabase.from('card_progress').delete().in('card_id', cardIds);
      }
    }
  };

  // Helper getters
  const getCardsForDeck = useCallback((deck_id: string): Card[] => {
    return cards.filter(c => c.deck_id === deck_id);
  }, [cards]);

  const getDueCardsForDeck = useCallback((deck_id: string): Card[] => {
    const deckCards = cards.filter(c => c.deck_id === deck_id);
    return deckCards.filter(c => isCardDue(progress[c.id]));
  }, [cards, progress]);

  const getAllDueCards = useCallback((): Card[] => {
    return cards.filter(c => isCardDue(progress[c.id]));
  }, [cards, progress]);

  const getStats = useCallback(() => {
    const totalDecks = decks.length;
    const totalCards = cards.length;
    let dueTodayCount = 0;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;

    cards.forEach(c => {
      const p = progress[c.id];
      if (isCardDue(p)) dueTodayCount++;
      
      const mastery = getCardMasteryLevel(p);
      if (mastery === 'mastered') masteredCount++;
      else if (mastery === 'learning') learningCount++;
      else newCount++;
    });

    return {
      totalDecks,
      totalCards,
      dueTodayCount,
      masteredCount,
      learningCount,
      newCount,
      streakDays: profile?.streak_days || 0
    };
  }, [decks, cards, progress, profile]);

  return (
    <TrainerContext.Provider
      value={{
        user,
        profile,
        decks,
        cards,
        progress,
        isLoading,
        isSupabaseConfigured,
        loginWithGoogle,
        logout,
        reloadConfig,
        createDeck,
        updateDeck,
        deleteDeck,
        createCard,
        updateCard,
        deleteCard,
        bulkImportCards,
        submitReview,
        resetDeckProgress,
        getCardsForDeck,
        getDueCardsForDeck,
        getAllDueCards,
        getStats
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
};

export const useTrainer = () => {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error('useTrainer must be used within a TrainerProvider');
  }
  return context;
};
