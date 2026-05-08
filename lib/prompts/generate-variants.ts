// Generates 5 distinct track variants from a parsed brief.
// Variants must differ along axes that produce different audience reactions.

import { randomUUID } from 'crypto';
import type { Brief, Variant } from '../types';
import { callClaudeJSON } from '../anthropic';

const SYSTEM_PROMPT = `You are an A&R-level producer at an AI music studio. Given a creative brief, you generate 5 distinct track variants — each a plausible AI-generated track within the brief — designed to be A/B tested with a synthetic listener panel.

Your output drives downstream reaction prediction. Variants that all sound the same produce indistinguishable reactions, which produces no signal. Variants must differ MEANINGFULLY along axes that real listeners would react to differently.

The seven dimensions you can vary (combine 2-3 per variant):
1. Hook structure — chorus-led, drop-led, post-chorus hook, hook-as-bridge, no traditional hook
2. Instrumental palette — what specific instruments anchor the track (acoustic guitar + synth pad vs. 808 + airy vocal chop vs. piano + strings)
3. Vocal treatment — clean lead vs. processed/AutoTuned vs. layered harmonies vs. spoken-sung vs. instrumental
4. Lyrical theme angle — same overall vibe, different narrative perspective (third-person observation vs. first-person confession vs. abstract mood)
5. Production complexity — minimal/sparse vs. mid-density vs. maximalist
6. Tempo nuance — within the brief's range, where on the spectrum
7. Genre lean — within the subgenre, which adjacent influence it borrows from (e.g., for indie pop: bedroom-pop lean vs. synth-pop lean vs. folk-pop lean)

For each variant, output:
- label: A, B, C, D, or E (in order)
- description: 2-3 sentences describing what a LISTENER would hear, in their experience. Not what a producer knows about the track. Use sensory language. Example good description: "Opens on a single piano motif, then a breathy female vocal enters with no harmony layer. The chorus drops into a heartbeat-like 808 thump, but stays sparse — the vocal carries the emotional weight." Example BAD description: "Track A is a slow ballad with vocals and piano." (vague, no sensory specificity)
- hook: one sentence naming what makes this variant memorable and DIFFERENT from the others. Not the lyrical hook — the production/arrangement choice that's the variant's identity.
- productionNotes: instrumentation list, song structure (e.g., "intro - verse - chorus - verse - chorus - bridge - chorus"), tempo, key. Producer-facing detail.

Critical quality requirements:
- The 5 variants together should form a STRATEGIC SPREAD across the dimensions, not 5 random samples. If variant A is sparse-acoustic, variant E should be maximalist-electronic. The middle three explore the space between.
- No variant should be a strictly worse version of another. Each should win for SOME audience.
- Do not generate variants that sit outside the brief. If the brief is lo-fi hip hop, do not produce a country variant. The differentiation happens INSIDE the brief.
- "hook" field should make a producer immediately understand the variant's identity. If a producer reads "hook" for two variants and can't tell them apart, you've failed.

Output schema (return ONLY valid JSON):
{
  "variants": [
    { "label": "A", "description": string, "hook": string, "productionNotes": string },
    ... (5 total, A through E)
  ]
}`;

type VariantGenerationResponse = {
  variants: Array<{
    label: 'A' | 'B' | 'C' | 'D' | 'E';
    description: string;
    hook: string;
    productionNotes: string;
  }>;
};

export async function generateVariants(brief: Brief): Promise<Variant[]> {
  const result = await callClaudeJSON<VariantGenerationResponse>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(brief),
    temperature: 1.0,
    maxTokens: 3000,
  });

  if (!Array.isArray(result.variants) || result.variants.length !== 5) {
    throw new Error(
      `Variant generator returned ${result.variants?.length ?? 0} variants, expected 5`,
    );
  }

  const expectedLabels: Variant['label'][] = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < 5; i++) {
    const v = result.variants[i];
    if (
      v.label !== expectedLabels[i] ||
      !v.description ||
      !v.hook ||
      !v.productionNotes
    ) {
      throw new Error(`Variant ${i} (label ${v.label}) is malformed`);
    }
  }

  return result.variants.map((v) => ({
    id: `variant_${randomUUID()}`,
    briefId: brief.id,
    label: v.label,
    description: v.description,
    hook: v.hook,
    productionNotes: v.productionNotes,
  }));
}

function buildUserPrompt(brief: Brief): string {
  const { genre, mood, tempo, targetUseCase, targetDemographic } =
    brief.parsedAttributes;

  return `Generate 5 distinct track variants for this brief.

Original brief: "${brief.rawText}"

Parsed attributes:
- Genre: ${genre}
- Mood: ${mood.join(', ')}
- Tempo: ${tempo}
- Target use case: ${targetUseCase}
- Target demographic: ${targetDemographic}

Remember: meaningful differentiation. The 5 variants should produce DIFFERENT reactions from a diverse listener panel.`;
}
