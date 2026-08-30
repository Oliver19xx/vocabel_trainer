-- ==============================================================================
-- SUPABASE SCHEMA: Vokabel Trainer (Active Recall & Spaced Repetition)
-- ==============================================================================
-- Kopiere dieses SQL in das Supabase SQL Editor Fenster und klicke auf "Run".
-- Damit werden alle nötigen Tabellen, Indizes und Sicherheitsregeln (RLS) angelegt.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Decks Table
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    source_lang TEXT NOT NULL DEFAULT 'de',
    target_lang TEXT NOT NULL DEFAULT 'en',
    color TEXT DEFAULT 'indigo',
    icon TEXT DEFAULT 'BookOpen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    front TEXT NOT NULL,                -- Begriff / Frage (z.B. Deutsch oder Englisch)
    back TEXT NOT NULL,                 -- Antwort / Übersetzung
    hint TEXT DEFAULT '',               -- Optionaler Hinweis
    example_sentence TEXT DEFAULT '',   -- Beispielsatz zur Vertiefung
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],-- Tags für Kategorisierung
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Card Progress Table (Spaced Repetition & Active Recall Tracking)
CREATE TABLE IF NOT EXISTS public.card_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL UNIQUE REFERENCES public.cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interval_days INTEGER NOT NULL DEFAULT 0,       -- Aktueller Wiederholungsabstand in Tagen
    ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50, -- SM-2 Leichtigkeit (Standard: 2.50)
    repetitions INTEGER NOT NULL DEFAULT 0,         -- Anzahl erfolgreicher Wiederholungen in Folge
    box INTEGER NOT NULL DEFAULT 1,                 -- Leitner-Box Stufe (1-5)
    last_quality INTEGER DEFAULT NULL,              -- Zuletzt bewertete Qualität (0-5)
    last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. User Profiles / Study Streaks Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    streak_days INTEGER DEFAULT 0,
    last_study_date DATE,
    total_cards_reviewed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_decks_user ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck ON public.cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_user ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_card ON public.card_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_next_review ON public.card_progress(user_id, next_review_at);

-- 7. Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_decks_updated_at
BEFORE UPDATE ON public.decks
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_card_progress_updated_at
BEFORE UPDATE ON public.card_progress
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Row Level Security (RLS)
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DECKS
CREATE POLICY "Users can view own decks"
    ON public.decks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own decks"
    ON public.decks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
    ON public.decks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
    ON public.decks FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for CARDS
CREATE POLICY "Users can view own cards"
    ON public.cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cards"
    ON public.cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
    ON public.cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
    ON public.cards FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for CARD_PROGRESS
CREATE POLICY "Users can view own card progress"
    ON public.card_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card progress"
    ON public.card_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card progress"
    ON public.card_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card progress"
    ON public.card_progress FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for USER_PROFILES
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 9. Automatic Profile Creation on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
