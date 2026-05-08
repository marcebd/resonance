// Strict validation + score clamping for react-to-variant responses.
// Kept separate so the main module stays focused on the prompt + flow.

import type { Persona } from '../types';

export type ReactionResponse = {
  scores: {
    saveWorthiness: number;
    skipLikelihood: number;
    shareLikelihood: number;
    repeatListening: number;
  };
  qualitativeReaction: string;
  flagsRaised: string[];
  transmissionScores: Array<{
    toPersonaId: string;
    score: number;
    reasoning: string;
  }>;
};

export function validateReactionResponse(
  r: ReactionResponse,
  otherPersonas: Persona[],
): void {
  if (!r.scores) throw new Error('Missing scores object');
  for (const k of [
    'saveWorthiness',
    'skipLikelihood',
    'shareLikelihood',
    'repeatListening',
  ] as const) {
    if (typeof r.scores[k] !== 'number') {
      throw new Error(`Score ${k} is not a number: ${r.scores[k]}`);
    }
  }
  if (
    typeof r.qualitativeReaction !== 'string' ||
    !r.qualitativeReaction.trim()
  ) {
    throw new Error('Missing or empty qualitativeReaction');
  }
  if (!Array.isArray(r.flagsRaised))
    throw new Error('flagsRaised is not an array');
  if (!Array.isArray(r.transmissionScores))
    throw new Error('transmissionScores is not an array');

  if (r.transmissionScores.length !== otherPersonas.length) {
    throw new Error(
      `Expected ${otherPersonas.length} transmission scores, got ${r.transmissionScores.length}`,
    );
  }
  const expected = new Set(otherPersonas.map((p) => p.id));
  const received = new Set(r.transmissionScores.map((ts) => ts.toPersonaId));
  for (const id of expected) {
    if (!received.has(id))
      throw new Error(`Missing transmission score for persona ${id}`);
  }
}

export function clampScore(n: number): number {
  return Math.max(1, Math.min(10, Math.round(n)));
}

export function clampScores(s: ReactionResponse['scores']) {
  return {
    saveWorthiness: clampScore(s.saveWorthiness),
    skipLikelihood: clampScore(s.skipLikelihood),
    shareLikelihood: clampScore(s.shareLikelihood),
    repeatListening: clampScore(s.repeatListening),
  };
}
