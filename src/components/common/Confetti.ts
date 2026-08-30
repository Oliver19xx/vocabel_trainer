import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    // Left burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7, x: 0.2 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']
    });
    // Right burst
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7, x: 0.8 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b']
    });
  } catch (e) {
    console.warn('Confetti error:', e);
  }
}
