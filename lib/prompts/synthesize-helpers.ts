// Pre-computation, formatting, and validation for synthesize.ts.
import type { Variant, Persona, Reaction } from '../types';

export type SynthesisResponse = {
  topVariantOverall: string;
  topVariantPerSegment: Array<{
    segmentLabel: string;
    variantId: string;
    reasoning: string;
  }>;
  divergentReactions: Array<{
    variantId: string;
    insight: string;
    topAdvocate: string;
    topDetractor: string;
  }>;
  recommendation: string;
};

export function computeAggregates(variants: Variant[], reactions: Reaction[]): string {
  return variants.flatMap((v) => {
    const rs = reactions.filter((r) => r.variantId === v.id);
    if (rs.length === 0) return [];
    const total = rs.reduce((sum, r) =>
      sum + r.scores.saveWorthiness * 0.4 + (10 - r.scores.skipLikelihood) * 0.2 +
      r.scores.shareLikelihood * 0.2 + r.scores.repeatListening * 0.2, 0);
    return [`  Variant ${v.label} [${v.id}]: ${(total / rs.length).toFixed(2)}`];
  }).join('\n');
}

export function computeVariance(variants: Variant[], reactions: Reaction[]): string {
  return variants.flatMap((v) => {
    const scores = reactions.filter((r) => r.variantId === v.id).map((r) => r.scores.saveWorthiness);
    if (scores.length === 0) return [];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length;
    return [`  Variant ${v.label} [${v.id}]: variance=${variance.toFixed(2)} (range ${Math.min(...scores)}-${Math.max(...scores)})`];
  }).join('\n');
}

export function formatVariantForSynthesis(v: Variant): string {
  return `[${v.id}] Variant ${v.label}${v.title ? ` — ${v.title}` : ''}
  Description: ${v.description}
  Hook: ${v.hook}`;
}

export function formatPersonaForSynthesis(p: Persona): string {
  return `[${p.id}] ${p.name} — ${p.demographics.occupation}
  Genres: ${p.musicProfile.favoriteGenres.join(', ')}
  Key trait: ${p.personalityTraits[0]}`;
}

export function formatReactionForSynthesis(
  r: Reaction,
  personas: Persona[],
  variants: Variant[],
): string {
  const persona = personas.find((p) => p.id === r.personaId);
  const variant = variants.find((v) => v.id === r.variantId);
  if (!persona || !variant) return '';
  return `${persona.name} → Variant ${variant.label}
  Scores: save=${r.scores.saveWorthiness} skip=${r.scores.skipLikelihood} share=${r.scores.shareLikelihood} repeat=${r.scores.repeatListening}
  Reaction: ${r.qualitativeReaction}
  Flags: ${r.flagsRaised.join(' | ') || '(none)'}`;
}

function coerceVariantId(value: string, variants: Variant[]): string {
  if (variants.some((v) => v.id === value)) return value;
  // Fallback: model returned a label like "Variant D — THE MIDNIGHT KITCHEN"
  const m = value.match(/Variant\s+([A-E])/);
  if (m) {
    const v = variants.find((x) => x.label === m[1]);
    if (v) return v.id;
  }
  return value;
}

function coercePersonaId(value: string, personas: Persona[]): string {
  if (personas.some((p) => p.id === value)) return value;
  // Fallback: match by leading first name
  const first = value.split(',')[0].trim().toLowerCase();
  const p = personas.find((x) =>
    x.name.toLowerCase().startsWith(first.toLowerCase()),
  );
  return p ? p.id : value;
}

export function validateSynthesisResponse(
  response: SynthesisResponse,
  variants: Variant[],
  personas: Persona[],
): void {
  // Coerce labels/names back to IDs before validation (defensive)
  response.topVariantOverall = coerceVariantId(response.topVariantOverall, variants);
  for (const seg of response.topVariantPerSegment ?? []) {
    seg.variantId = coerceVariantId(seg.variantId, variants);
  }
  for (const div of response.divergentReactions ?? []) {
    div.variantId = coerceVariantId(div.variantId, variants);
    div.topAdvocate = coercePersonaId(div.topAdvocate, personas);
    div.topDetractor = coercePersonaId(div.topDetractor, personas);
  }

  const variantIds = new Set(variants.map((v) => v.id));
  const personaIds = new Set(personas.map((p) => p.id));

  if (!variantIds.has(response.topVariantOverall)) {
    throw new Error(`topVariantOverall "${response.topVariantOverall}" is not a known variant ID`);
  }
  const segs = response.topVariantPerSegment;
  if (!Array.isArray(segs) || segs.length < 2 || segs.length > 4) {
    throw new Error(`topVariantPerSegment must have 2-4 entries, got ${segs?.length}`);
  }
  for (const seg of segs) {
    if (!variantIds.has(seg.variantId)) {
      throw new Error(`Segment "${seg.segmentLabel}" references unknown variant ID ${seg.variantId}`);
    }
    if (!seg.segmentLabel || !seg.reasoning) {
      throw new Error(`Segment is missing label or reasoning`);
    }
  }
  const divs = response.divergentReactions;
  if (!Array.isArray(divs) || divs.length < 1 || divs.length > 2) {
    throw new Error(`divergentReactions must have 1-2 entries, got ${divs?.length}`);
  }
  for (const div of divs) {
    if (!variantIds.has(div.variantId)) {
      throw new Error(`Divergent reaction references unknown variant ID ${div.variantId}`);
    }
    if (!personaIds.has(div.topAdvocate)) {
      throw new Error(`Divergent reaction topAdvocate "${div.topAdvocate}" not in panel. Valid: ${[...personaIds].join(', ')}`);
    }
    if (!personaIds.has(div.topDetractor)) {
      throw new Error(`Divergent reaction topDetractor "${div.topDetractor}" not in panel. Valid: ${[...personaIds].join(', ')}`);
    }
  }
  if (typeof response.recommendation !== 'string' || response.recommendation.length < 100) {
    throw new Error('recommendation must be a substantive paragraph (100+ chars)');
  }
}
