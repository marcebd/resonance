// Generates one persona's reaction to one variant, including transmission
// scores to other panel members. Called 30 times per run (6 personas × 5 variants).

import { randomUUID } from 'crypto';
import type { Persona, Variant, Reaction } from '../types';
import { callClaudeJSON } from '../anthropic';
import {
  type ReactionResponse,
  validateReactionResponse,
  clampScore,
  clampScores,
} from './react-to-variant-validate';

const SYSTEM_PROMPT = `You roleplay as a specific listener evaluating a music track. Your output is a structured reaction that captures how this individual would actually respond to this specific track, in their voice and according to their stated traits and biases.

Your reactions drive A/B test analysis for AI-generated music. The value of the test depends on:
1. Reactions TRUE to the persona — not generic music opinions
2. Reactions that DIFFER from other personas — disagreement is signal
3. Specific, actionable feedback — not vague approval or rejection

SCORING DIMENSIONS (1-10 integers):
- saveWorthiness: would this persona save this to a personal playlist? Reflects their CURATION threshold (curators save liberally; passive listeners save almost nothing).
- skipLikelihood: would this persona skip on first listen? LOWER is better. A wrong-audience persona scores HIGH here even on technically good tracks.
- shareLikelihood: would this persona send this to a friend or post about it? Sharing is a high bar; most personas score LOW even on tracks they like.
- repeatListening: would this persona return to this track? Reflects depth of impact, not first-listen reaction.

Score distribution: Reactions should USE THE FULL RANGE 1-10 across the panel.
For any given variant, expect at least one persona to score saveWorthiness ≥ 8 (a champion) and at least one to score ≤ 4 (a clear non-fit). If your scoring across all variants and personas clusters in a 5-7 band, you are being too cautious and not honoring the persona traits you were given.
Specifically: when a persona's stated personality traits are TRIGGERED by a variant (e.g., "allergic to autotune" meets a heavily autotuned track), score saveWorthiness 2-3, not 4-5. When traits ALIGN STRONGLY (e.g., "jazz-literate" meets actual jazz arrangement), score 8-9, not 7. The numbers should reflect the qualitative reaction's intensity.

QUALITATIVE REACTION:
2-3 sentences in the persona's first-person voice. NOT a producer review, NOT a music critic essay. Their internal monologue or text-to-a-friend register. Match their stated voice and language: a 19-year-old TikTok user does not write like a 41-year-old music journalist. If the persona is described as Spanish/Spanglish-speaking, write at least part of the reaction in their natural language. Reference their stated listening contexts where relevant ("I'd put this on for [specific context]" beats "I'd listen to this sometime").

FLAGS RAISED:
0-3 specific concerns this persona would have, in their voice. Empty array if no concerns. SPECIFIC ("the chorus rhyme feels lazy — 'fire' and 'desire' is the kind of thing I tune out") not generic ("not my style"). Tied to the persona's stated sensitivities.

TRANSMISSION SCORES:
For each OTHER persona on the panel, rate (1-10) how likely you'd be to recommend this track to them, with brief reasoning. This isn't whether the OTHER persona would like it — it's whether YOU would think to share it with them based on what you know about them.
- High example: "9 — she's been on a Phoebe Bridgers kick and this lap steel work would land for her"
- Low example: "2 — he hates anything that feels engineered for virality, this would lose him"
Reasoning must reference at least one specific trait or genre preference of the receiving persona, not just generic compatibility.

Output schema (return ONLY valid JSON):
{
  "scores": { "saveWorthiness": int, "skipLikelihood": int, "shareLikelihood": int, "repeatListening": int },
  "qualitativeReaction": string,
  "flagsRaised": string[],
  "transmissionScores": [
    { "toPersonaId": string, "score": int, "reasoning": string },
    ...
  ]
}

The transmissionScores array must contain one entry per OTHER persona (5 entries when there are 6 personas total).`;

export async function generateReaction(
  persona: Persona,
  variant: Variant,
  otherPersonas: Persona[],
): Promise<Reaction> {
  const result = await callClaudeJSON<ReactionResponse>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(persona, variant, otherPersonas),
    temperature: 0.9,
    maxTokens: 1500,
  });

  validateReactionResponse(result, otherPersonas);

  return {
    id: `reaction_${randomUUID()}`,
    variantId: variant.id,
    personaId: persona.id,
    scores: clampScores(result.scores),
    qualitativeReaction: result.qualitativeReaction,
    flagsRaised: result.flagsRaised ?? [],
    transmissionScores: result.transmissionScores.map((ts) => ({
      toPersonaId: ts.toPersonaId,
      score: clampScore(ts.score),
      reasoning: ts.reasoning,
    })),
  };
}

function buildUserPrompt(
  persona: Persona,
  variant: Variant,
  otherPersonas: Persona[],
): string {
  return `You are reacting AS this persona to this track variant.

YOU ARE:
Name: ${persona.name}
Age: ${persona.demographics.age}, Location: ${persona.demographics.location}, Occupation: ${persona.demographics.occupation}
Favorite genres: ${persona.musicProfile.favoriteGenres.join(', ')}
Listening contexts: ${persona.musicProfile.listeningContexts.join(', ')}
Discovery habits: ${persona.musicProfile.discoveryHabits.join(', ')}
Personality traits:
${persona.personalityTraits.map((t) => `  - ${t}`).join('\n')}

THE TRACK YOU JUST HEARD:
Label: Variant ${variant.label}${variant.title ? ` — ${variant.title}` : ''}
Description: ${variant.description}
Hook: ${variant.hook}
Production: ${variant.productionNotes}

THE OTHER PERSONAS ON THE PANEL (for transmission scoring):
${otherPersonas
  .map(
    (p) =>
      `[id: ${p.id}] ${p.name} — ${p.demographics.occupation}\nGenres: ${p.musicProfile.favoriteGenres.join(', ')}\nKey traits: ${p.personalityTraits.slice(0, 2).join(' / ')}`,
  )
  .join('\n\n')}

React authentically as yourself. Score on the 4 dimensions, write a qualitative reaction in your voice, raise flags for specific concerns, and score transmission likelihood to each other panel member.`;
}
