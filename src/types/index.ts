export type SupportedLanguage = 
  | 'de' | 'en' | 'es' | 'fr' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'la' | 'other';

export interface Deck {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  source_lang: SupportedLanguage;
  target_lang: SupportedLanguage;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  card_count?: number;
  due_count?: number;
}

export interface Card {
  id: string;
  deck_id: string;
  user_id?: string;
  front: string; // Native / prompt or target word depending on direction
  back: string;  // Solution / translation
  hint?: string;
  example_sentence?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CardProgress {
  id: string;
  card_id: string;
  user_id?: string;
  interval_days: number;   // Days until next review
  ease_factor: number;     // SM-2 multiplier (default 2.5)
  repetitions: number;     // Consecutive successful recalls
  box: number;             // Leitner level (1 to 5)
  last_quality?: number;   // 0: Again, 1: Hard, 2: Good, 3: Easy
  last_reviewed_at: string | null;
  next_review_at: string;  // ISO Date string
  created_at: string;
  updated_at: string;
}

export interface CardWithProgress extends Card {
  progress?: CardProgress;
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  streak_days: number;
  last_study_date?: string | null;
  total_cards_reviewed: number;
}

export type StudyMode = 'flashcard' | 'typing' | 'quiz';

export type RecallQuality = 0 | 1 | 2 | 3; // 0 = Again/Nochmal, 1 = Hard/Schwer, 2 = Good/Gut, 3 = Easy/Einfach

export interface StudyResult {
  cardId: string;
  quality: RecallQuality;
  userAnswer?: string;
  correct: boolean;
  timeSpentMs: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}
