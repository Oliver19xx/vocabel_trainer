import { SupportedLanguage } from '../types';

const langMap: Record<SupportedLanguage, string> = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
  la: 'it-IT',
  other: 'en-US'
};

export function speakText(text: string, lang: SupportedLanguage = 'en', rate: number = 0.9): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop ongoing speech

    // Clean text (remove brackets or explanations)
    const cleanText = text.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = rate; // slightly slower for better learner comprehension
    utterance.pitch = 1.0;

    // Pick best voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetCode = utterance.lang.toLowerCase();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetCode.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Error playing speech:', err);
    return false;
  }
}
