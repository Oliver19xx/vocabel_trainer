import { CardProgress, RecallQuality } from '../types';

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm & Leitner Box calculation.
 * 
 * Quality values:
 * 0: Again / Blackout - Complete failure to recall
 * 1: Hard - Correct recall with serious difficulty
 * 2: Good - Correct recall after hesitation
 * 3: Easy - Perfect instantaneous recall
 */
export function calculateNextReview(
  currentProgress: Partial<CardProgress> | undefined,
  quality: RecallQuality
): {
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  box: number;
  next_review_at: string;
  last_quality: number;
} {
  const prevInterval = currentProgress?.interval_days ?? 0;
  let prevEase = currentProgress?.ease_factor ?? 2.5;
  const prevRepetitions = currentProgress?.repetitions ?? 0;
  let prevBox = currentProgress?.box ?? 1;

  let newInterval: number;
  let newRepetitions: number;
  let newBox: number;

  // Map 0..3 quality to SM-2 0..5 scale for formula
  // 0 -> 1 (Again), 1 -> 3 (Hard), 2 -> 4 (Good), 3 -> 5 (Easy)
  const qMap = [1, 3, 4, 5];
  const q = qMap[quality];

  // Calculate new Ease Factor (SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEase = prevEase + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEase < 1.3) newEase = 1.3;
  if (newEase > 3.0) newEase = 3.0;

  if (quality === 0) {
    // Failed recall (Again) - reset to beginning
    newRepetitions = 0;
    newInterval = 0; // Due immediately or next day
    newBox = 1;
  } else {
    // Successful recall (Hard, Good, Easy)
    newRepetitions = prevRepetitions + 1;

    if (newRepetitions === 1) {
      newInterval = quality === 1 ? 1 : (quality === 3 ? 2 : 1);
      newBox = 1;
    } else if (newRepetitions === 2) {
      newInterval = quality === 1 ? 3 : (quality === 3 ? 6 : 4);
      newBox = 2;
    } else {
      // Multiply previous interval by Ease Factor
      const multiplier = quality === 1 ? 1.2 : (quality === 3 ? newEase * 1.3 : newEase);
      newInterval = Math.round(prevInterval * multiplier);
      if (newInterval <= prevInterval) {
        newInterval = prevInterval + 1;
      }
      
      // Calculate Leitner Box based on interval
      if (newInterval >= 30) newBox = 5;
      else if (newInterval >= 14) newBox = 4;
      else if (newInterval >= 7) newBox = 3;
      else if (newInterval >= 3) newBox = 2;
      else newBox = 1;
    }
  }

  // Calculate Next Review Date
  const nextDate = new Date();
  if (newInterval === 0) {
    // Review again in 10 minutes for immediate re-test
    nextDate.setMinutes(nextDate.getMinutes() + 10);
  } else {
    // Add days
    nextDate.setDate(nextDate.getDate() + newInterval);
    // Set to morning 04:00 to keep daily consistency
    nextDate.setHours(4, 0, 0, 0);
  }

  return {
    interval_days: newInterval,
    ease_factor: Math.round(newEase * 100) / 100,
    repetitions: newRepetitions,
    box: newBox,
    next_review_at: nextDate.toISOString(),
    last_quality: quality
  };
}

/**
 * Checks if a card is currently due for review.
 */
export function isCardDue(progress?: CardProgress | null): boolean {
  if (!progress || !progress.next_review_at) {
    return true; // Never studied = always due
  }
  const nextReview = new Date(progress.next_review_at);
  return nextReview <= new Date();
}

/**
 * Categorize a card's mastery level
 */
export function getCardMasteryLevel(progress?: CardProgress | null): 'new' | 'learning' | 'mastered' {
  if (!progress || progress.repetitions === 0) return 'new';
  if (progress.interval_days >= 21 || progress.box >= 4) return 'mastered';
  return 'learning';
}

/**
 * Normalizes strings for active typing comparison (handles case, whitespace, brackets, punctuation).
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove parenthesized notes like "(noun)", "(to)"
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    // Remove trailing punctuation (. , ! ?)
    .replace(/[.,!?;:]+$/g, '')
    .trim();
}

/**
 * Check if the user answer is considered correct with fuzzy/synonym matching.
 */
export function checkTypingAnswer(userAnswer: string, expectedAnswer: string): {
  isCorrect: boolean;
  similarity: number;
  matchedVariant?: string;
} {
  const normUser = normalizeAnswer(userAnswer);
  
  // Split multiple possible translations separated by comma, slash or semicolon
  const variants = expectedAnswer.split(/[,/;\n]+/).map(v => normalizeAnswer(v)).filter(Boolean);
  
  if (variants.length === 0) {
    const normExp = normalizeAnswer(expectedAnswer);
    return {
      isCorrect: normUser === normExp,
      similarity: normUser === normExp ? 1 : calculateSimilarity(normUser, normExp),
      matchedVariant: expectedAnswer
    };
  }

  for (const variant of variants) {
    if (normUser === variant) {
      return { isCorrect: true, similarity: 1.0, matchedVariant: variant };
    }
  }

  // Check closest similarity
  let bestSim = 0;
  let bestVar = variants[0];
  for (const variant of variants) {
    const sim = calculateSimilarity(normUser, variant);
    if (sim > bestSim) {
      bestSim = sim;
      bestVar = variant;
    }
  }

  // Treat >= 90% similarity as typo-acceptable if length is reasonable
  const isCorrect = bestSim >= 0.90 && normUser.length > 3;

  return {
    isCorrect,
    similarity: bestSim,
    matchedVariant: bestVar
  };
}

/**
 * Levenshtein distance similarity (0.0 - 1.0)
 */
function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;

  const costs = new Array();
  for (let i = 0; i <= shorter.length; i++) {
    costs[i] = i;
  }

  for (let i = 1; i <= longer.length; i++) {
    let lastValue = i - 1;
    costs[0] = i;
    for (let j = 1; j <= shorter.length; j++) {
      let newValue = costs[j - 1];
      if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
      }
      lastValue = costs[j];
      costs[j] = newValue;
    }
  }

  return (longerLength - costs[shorter.length]) / longerLength;
}
