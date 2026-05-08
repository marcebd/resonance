// Generates 5 distinct track variants from a parsed brief.
// Variants must differ along axes that produce different audience reactions.

import { randomUUID } from 'crypto';
import type { Brief, Variant } from '../types';
import { callClaudeJSON } from '../anthropic';

const SYSTEM_PROMPT = `You are an A&R-level producer at an AI music studio. Given a creative brief, you generate 5 distinct track variants — each a plausible AI-generated track within the brief — designed to be A/B tested with a synthetic listener panel.

Your output drives downstream reaction prediction. Variants must differ MEANINGFULLY along axes real listeners react to differently.

The seven dimensions you can vary (combine 2-3 per variant):
1. Hook structure — chorus-led, drop-led, post-chorus, hook-as-bridge, none
2. Instrumental palette — what specific instruments anchor the track
3. Vocal treatment — clean / processed / layered / spoken-sung / instrumental
4. Lyrical theme angle — same vibe, different narrative perspective
5. Production complexity — minimal / mid-density / maximalist
6. Tempo nuance — within the brief's range, where on the spectrum
7. Genre lean — within the subgenre, which adjacent influence it borrows from

For each variant, output:
- label: A, B, C, D, or E (in order)
- title: 3-4 words. Opinionated, category-naming, NOT descriptive. The handle a producer would use in a creative meeting. Good examples: "THE BEDROOM CRY", "THE TIKTOK COLD-OPEN", "THE RADIO PLAY", "THE SYNC SPOT", "THE HYPERPOP CHAOS", "THE CUMBIA TURN". A producer reading the title should immediately know which one this is. If two titles could refer to the same variant, both have failed. Across the 5 variants, the surface vocabulary of the titles must NOT cluster — if one title uses the brief's use-case word (e.g. "study," "party," "drive"), the other four should reach for adjacent imagery (the walk home, the bus ride, the parking lot at 3am, the empty kitchen). Same emotional register, distinct surface words.
- description: EXACTLY 2 sentences. First sentence: the variant's identity in one move — often a cultural moment ("where does this song play in someone's life"). Second sentence: the production detail or artist reference that sells it. Write in the vernacular of the genre's actual fans, NOT neutral music-journalism voice. Latin trap descriptions read like a Latin trap fan wrote them (Spanglish, regional slang, current-artist references). Lo-fi descriptions sound like chillhop subreddit comments. Dark synthwave descriptions sound like dark-synthwave Discord posts. NEVER use the phrases "feels like" or "sounds like" — anywhere, in any form, including "feels like X just X'd". Both are tells of weak writing. Use direct sensory or cultural detail instead.
  GOOD example (lo-fi): "The 1am rainy-evening study sesh closer. Bass-heavy boom-bap, dusty chopped vocal sample looped like a thought you can't shake — vinyl crackle stays the whole track, not as background but as a second instrument."
  GOOD example (Latin trap): "Está pegao' del primer beat — Bad Bunny early-era flow over un drop sucio y cumbia-laced, hook en Spanglish que pega en TikTok dentro de los primeros 8 bars. La que pones cuando vas pa' la party y todavía estás en el Uber."
  BAD example: "Opens on a slow piano motif. Feels like a record left spinning after the party ended." (uses "feels like", neutral voice, no cultural moment)
- hook: one sentence naming the production/arrangement choice that is this variant's identity. Not the lyrical hook.
- productionNotes: instrumentation list, song structure (e.g., "intro-verse-chorus-bridge-chorus"), tempo, key.

Critical quality requirements:
- The 5 variants together should form a STRATEGIC SPREAD across the dimensions.
- No variant should be a strictly worse version of another. Each wins for SOME audience.
- Differentiation happens INSIDE the brief — don't generate a country variant for a lo-fi brief.
- If you name artists, name TWO and use their tension as the variant's coordinates — "X meets Y" or "X's production with Y's vocals" — NOT "X-adjacent".
- "title" should make a producer say "yeah, the ___ one" — committed, not hedged.

Output schema (return ONLY valid JSON):
{
  "variants": [
    { "label": "A", "title": string, "description": string, "hook": string, "productionNotes": string },
    ... (5 total, A through E)
  ]
}`;

type VariantGenerationResponse = {
  variants: Array<{
    label: 'A' | 'B' | 'C' | 'D' | 'E';
    title: string;
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
      !v.title ||
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
    title: v.title,
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

Remember: meaningful differentiation, opinionated titles, genre vernacular, 2-sentence descriptions.`;
}
