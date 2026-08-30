import { Deck, Card } from '../types';

export const INITIAL_DECKS: Deck[] = [
  {
    id: 'deck-english-a2',
    title: 'Englisch Grund- & Aufbauwortschatz',
    description: 'Wichtige Redewendungen, Verben und Vokabeln für den Alltag.',
    source_lang: 'de',
    target_lang: 'en',
    color: 'indigo',
    icon: 'Sparkles',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deck-spanish-starter',
    title: 'Spanisch für Anfänger',
    description: 'Die wichtigsten spanischen Wörter, Begrüßungen und Ausdrücke.',
    source_lang: 'de',
    target_lang: 'es',
    color: 'amber',
    icon: 'Globe',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'deck-tech-english',
    title: 'Software & Tech Terms',
    description: 'Fachbegriffe aus Softwareentwicklung, Cloud & IT.',
    source_lang: 'de',
    target_lang: 'en',
    color: 'emerald',
    icon: 'Terminal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_CARDS: Card[] = [
  // Englisch Grundwortschatz
  {
    id: 'card-en-1',
    deck_id: 'deck-english-a2',
    front: 'sich erinnern / abrufen',
    back: 'to recall',
    hint: 'Regelmäßiges Verb, ähnlich wie "remember"',
    example_sentence: 'Active recall strengthens long-term memory retention.',
    tags: ['Verben', 'Lernen'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-en-2',
    deck_id: 'deck-english-a2',
    front: 'unverzichtbar / wesentlich',
    back: 'essential',
    hint: 'Synonym: vital, crucial',
    example_sentence: 'Good sleep is essential for effective learning.',
    tags: ['Adjektive'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-en-3',
    deck_id: 'deck-english-a2',
    front: 'etwas aufschieben / prokrastinieren',
    back: 'to procrastinate',
    hint: 'Substantiv: procrastination',
    example_sentence: 'Don\'t procrastinate; start reviewing your vocabulary daily.',
    tags: ['Verben', 'Gewohnheiten'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-en-4',
    deck_id: 'deck-english-a2',
    front: 'Erfolg erzielen / erreichen',
    back: 'to achieve',
    hint: 'Substantiv: achievement',
    example_sentence: 'With spaced repetition, you will achieve fluency faster.',
    tags: ['Verben'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-en-5',
    deck_id: 'deck-english-a2',
    front: 'Herausforderung',
    back: 'challenge',
    hint: 'Verb: to challenge someone',
    example_sentence: 'Learning 20 new words a day is a fun challenge.',
    tags: ['Nomen'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Spanisch
  {
    id: 'card-es-1',
    deck_id: 'deck-spanish-starter',
    front: 'Guten Tag / Hallo',
    back: '¡Hola! Buenos días',
    hint: 'Typische spanische Begrüßung am Vormittag',
    example_sentence: '¡Buenos días! ¿Cómo estás hoy?',
    tags: ['Alltag', 'Begrüßung'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-es-2',
    deck_id: 'deck-spanish-starter',
    front: 'Bitte / Gern geschehen',
    back: 'Por favor / De nada',
    hint: 'Höflichkeitsformeln',
    example_sentence: 'Una mesa para dos, por favor.',
    tags: ['Alltag', 'Höflichkeit'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-es-3',
    deck_id: 'deck-spanish-starter',
    front: 'Rechnung (im Restaurant)',
    back: 'la cuenta',
    hint: 'La cuenta, por favor',
    example_sentence: '¿Nos trae la cuenta, por favor?',
    tags: ['Restaurant', 'Reise'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-es-4',
    deck_id: 'deck-spanish-starter',
    front: 'Ich möchte gerne lernen',
    back: 'Me gustaría aprender',
    hint: 'Gustar im Konditional',
    example_sentence: 'Me gustaría aprender español fluido este año.',
    tags: ['Grammatik', 'Ziele'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // Tech English
  {
    id: 'card-tech-1',
    deck_id: 'deck-tech-english',
    front: 'Bereitstellung / Ausrollen einer Software',
    back: 'deployment',
    hint: 'Verb: to deploy',
    example_sentence: 'The automated deployment to GitHub Pages succeeded.',
    tags: ['DevOps', 'CI/CD'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-tech-2',
    deck_id: 'deck-tech-english',
    front: 'Skalierbarkeit',
    back: 'scalability',
    hint: 'Fähigkeit eines Systems mit wachsender Last umzugehen',
    example_sentence: 'PostgreSQL provides excellent scalability for web applications.',
    tags: ['Architektur'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'card-tech-3',
    deck_id: 'deck-tech-english',
    front: 'Gleichzeitigkeit / Nebenläufigkeit',
    back: 'concurrency',
    hint: 'Verarbeitung mehrerer Aufgaben im selben Zeitraum',
    example_sentence: 'Handling concurrency properly avoids race conditions.',
    tags: ['Architektur'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
