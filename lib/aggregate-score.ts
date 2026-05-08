// Single weighted aggregate formula shared by the synthesis prompt and the
// reaction-matrix UI so they cannot disagree about which variants ranked highest.

import type { Reaction } from './types';

export function aggregateScore(scores: Reaction['scores']): number {
  return (
    scores.saveWorthiness * 0.4 +
    (10 - scores.skipLikelihood) * 0.2 +
    scores.shareLikelihood * 0.2 +
    scores.repeatListening * 0.2
  );
}

// 0-1 intensity for color/bar mapping.
export function intensityFromScore(score: number): number {
  const clamped = Math.max(1, Math.min(10, score));
  return (clamped - 1) / 9;
}

// Maps a 1-10 score to an RGB color along the neutral-100 → neutral-900 axis.
// Same neutral palette as the rest of the page; works for color-blind users.
export function scoreToColor(score: number): string {
  const t = intensityFromScore(score);
  const start = { r: 245, g: 245, b: 245 }; // neutral-100
  const end = { r: 23, g: 23, b: 23 }; // neutral-900
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
