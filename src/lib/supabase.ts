import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_URL_KEY = 'vokabel_supabase_url';
const STORAGE_ANON_KEY = 'vokabel_supabase_anon_key';

const DEFAULT_URL = 'https://ygtjkrkmmbpubuhpoqcc.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndGprcmttbWJwdWJ1aHBvcWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTc3ODQsImV4cCI6MjEwMzY5Mzc4NH0.fygweFujhfFW276POLZsy521zTxx7lP_RehbqWze9ik';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

  const storedUrl = localStorage.getItem(STORAGE_URL_KEY) || envUrl;
  const storedKey = localStorage.getItem(STORAGE_ANON_KEY) || envKey;

  const isConfigured = Boolean(
    storedUrl && 
    storedKey && 
    storedUrl !== 'https://your-project-id.supabase.co' && 
    storedKey !== 'your-anon-key-here' &&
    storedUrl.startsWith('https://')
  );

  return {
    url: storedUrl,
    anonKey: storedKey,
    isConfigured
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  // Re-initialize client
  initSupabaseClient();
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    initSupabaseClient();
  }
  return supabaseInstance;
}

function initSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
}

/**
 * Trigger Google OAuth Login via Supabase
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: new Error('Supabase ist noch nicht konfiguriert. Bitte trage deine Supabase Zugangsdaten in den Einstellungen ein.') };
  }

  // Determine current redirect URL (compatible with GitHub pages sub-paths)
  const redirectUrl = window.location.origin + window.location.pathname;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  return { error: error as Error | null };
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error: error as Error | null };
}
