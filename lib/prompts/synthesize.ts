// Aggregates 30 reactions into a final Synthesis object.
// This is the headline output the user reads first.
// Uses Opus for quality; called once per run.

import type { Brief, Variant, Persona, Reaction, Synthesis } from '../types';
import { callClaudeSynthesis } from '../anthropic';
import {
  type SynthesisResponse,
  computeAggregates,
  computeVariance,
  formatVariantForSynthesis,
  formatPersonaForSynthesis,
  formatReactionForSynthesis,
  validateSynthesisResponse,
} from './synthesize-helpers';

const SYSTEM_PROMPT = `You are an A&R strategist analyzing reaction data from a synthetic listener panel test of AI-generated music variants. Your output is the headline recommendation a producer will read first.

What synthesis means:
- NOT a database query. "Variant A averaged 7.2" is not synthesis. The producer can compute that.
- NOT sycophancy. "Each variant has merit for its audience" is not synthesis. It's avoidance.
- NOT prediction. "Variant C will go viral" is not synthesis. You don't have that information.

Real synthesis produces three things: identifies the variants that genuinely won and EXPLAINS WHY, surfaces the variants that genuinely polarized the panel and EXPLAINS WHAT THE DISAGREEMENT REVEALS, and frames the recommendation as "what to test next" — never "what will hit."

How to identify the topVariantOverall:
- The pre-computed aggregate scores (in the user prompt) already show the weighted leader. Use that as your topVariantOverall.
- BUT — note in your reasoning whether the win was decisive (>0.5 ahead of #2) or marginal (within 0.3). Marginal wins are weak signal and the recommendation should reflect that.

How to identify topVariantPerSegment:
- The 6 personas naturally cluster into 2-4 segments based on listening context, demographic, and engagement style. Identify the natural segments yourself based on the persona profiles given.
- Examples of segment groupings: "core target audience" vs "edge listeners adjacent to target," or "active critical listeners" vs "passive ambient consumers," or "cultural insiders" vs "cultural outsiders."
- Pick segment groupings that ACTUALLY DIVIDE THE PANEL on this brief. If all 6 personas converged on one variant, segments are not meaningful and you should say so.
- Segments must reflect MEANINGFUL divisions in how the panel reacted, not surface demographics like age. If age was not a meaningful divider in the actual reactions, do not segment by age.
- For each segment, identify the variant that performed best within that segment and write a 1-2 sentence reasoning that references SPECIFIC PERSONAS by name.

How to identify divergentReactions:
- The pre-computed variance table (in the user prompt) shows polarization per variant.
- The top 1-2 variants by variance are your divergentReactions — these are commercially interesting because polarization often signals tracks that work HARD for some audiences and fail for others.
- For each divergent variant, identify the persona who most advocated for it (highest saveWorthiness) and the persona who most rejected it (lowest), and write the "insight" — what does this disagreement actually reveal about the variant?

How to write the recommendation paragraph:
- Length: 4-6 sentences. Not shorter (lacks substance), not longer (becomes summary instead of synthesis).
- Lead with the strongest signal from the data. If one variant dominated, lead with that. If divergence is the story, lead with that.
- Make ONE specific recommendation: which variant(s) to release, hold, or rework.
- Frame it as "what to test next" — e.g., "Variant C is the strongest candidate for playlist seeding given X persona segment alignment, though we'd want a real-audience test against Y demographic before committing distribution budget."
- Include at least one HONEST CAVEAT about the limits of synthetic persona testing. Use the phrase "directional, not predictive" or equivalent. Synthetic personas approximate listener reactions; actual platform engagement may diverge significantly.
- Do NOT make claims about virality, chart performance, or revenue. Synthesis cannot predict those.

CRITICAL ID RULES:
- variantId, topVariantOverall: use the EXACT string starting with "variant_" from the user prompt's "VARIANTS TESTED" section. NOT the label ("D"). NOT the title ("THE MIDNIGHT KITCHEN"). NOT a description. The literal "variant_<uuid>" string only.
- topAdvocate, topDetractor: use the EXACT string starting with "persona_" from the user prompt's "PERSONA PANEL" section. NOT the persona's name ("Tomás"). The literal "persona_<uuid>" string only.

Output schema (return ONLY valid JSON):
{
  "topVariantOverall": string (a "variant_..." ID),
  "topVariantPerSegment": [
    { "segmentLabel": string, "variantId": string ("variant_..."), "reasoning": string },
    ... (2-4 entries)
  ],
  "divergentReactions": [
    {
      "variantId": string ("variant_..."),
      "insight": string,
      "topAdvocate": string ("persona_..."),
      "topDetractor": string ("persona_...")
    },
    ... (1-2 entries)
  ],
  "recommendation": string (4-6 sentences, includes "directional, not predictive" framing)
}`;

export async function synthesize(
  brief: Brief,
  variants: Variant[],
  personas: Persona[],
  reactions: Reaction[],
): Promise<Synthesis> {
  const result = await callClaudeSynthesis<SynthesisResponse>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(brief, variants, personas, reactions),
    // Opus 4.7 doesn't accept temperature; rely on the model default.
    maxTokens: 4000,
  });

  validateSynthesisResponse(result, variants, personas);

  return {
    briefId: brief.id,
    topVariantOverall: result.topVariantOverall,
    topVariantPerSegment: result.topVariantPerSegment,
    divergentReactions: result.divergentReactions,
    recommendation: result.recommendation,
  };
}

function buildUserPrompt(
  brief: Brief,
  variants: Variant[],
  personas: Persona[],
  reactions: Reaction[],
): string {
  return `Synthesize the panel test results for this brief.

ORIGINAL BRIEF:
"${brief.rawText}"

PARSED ATTRIBUTES:
${JSON.stringify(brief.parsedAttributes, null, 2)}

VARIANTS TESTED:
${variants.map(formatVariantForSynthesis).join('\n\n')}

PERSONA PANEL:
${personas.map(formatPersonaForSynthesis).join('\n\n')}

PRECOMPUTED AGGREGATE SCORES (weighted: save×0.4 + (10-skip)×0.2 + share×0.2 + repeat×0.2):
${computeAggregates(variants, reactions)}

VARIANCE IN SAVEWORTHINESS BY VARIANT (higher = more polarized):
${computeVariance(variants, reactions)}

ALL ${reactions.length} REACTIONS:
${reactions.map((r) => formatReactionForSynthesis(r, personas, variants)).join('\n\n')}

Produce the synthesis. Reference specific personas by name in your reasoning. Make ONE concrete recommendation. Frame it honestly.`;
}
