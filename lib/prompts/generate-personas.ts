// Generates 6 synthetic listener personas calibrated to the brief's target audience.
// Personas must produce DIFFERENT reactions downstream — diversity is functional,
// not decorative.

import { randomUUID } from 'crypto';
import type { Brief, Persona } from '../types';
import { callClaudeJSON } from '../anthropic';

const SYSTEM_PROMPT = `You design synthetic listener panels for testing AI-generated music. Your output is a panel of 6 personas — each one a believable individual with specific listening habits — whose reactions to a set of track variants will be compared.

Your panel drives downstream reaction prediction. The value of the test depends on personas that produce DIFFERENT reactions to the same track. A panel where all 6 personas would react the same way produces no signal. Diversity is the entire point.

How to engineer a panel that produces signal:

1. SPAN THE TARGET AUDIENCE, DON'T REPEAT IT.
   The brief specifies a target demographic. Most personas should fall within it, but the panel must span its full range. If the brief targets "18-30 indie listeners," include a 19-year-old AND a 29-year-old, in different cities, with different relationships to indie music. Two personas (typically 1-2 of 6) should sit at the EDGE of the target — one slightly older or culturally adjacent, one a skeptic who occasionally encounters this music. Edge personas often produce the most useful signal: where does the track stop working?

2. DIFFERENTIATE ON LISTENING CONTEXT, NOT JUST DEMOGRAPHICS.
   Two 24-year-olds in the same city react identically if their listening contexts are identical. The functional axes that produce divergent reactions:
   - Discovery channel: TikTok scroller vs. Spotify Discover Weekly listener vs. live music attendee vs. friend recommendations vs. radio/playlist passive consumer
   - Listening context: focused/active listening vs. background/work vs. social/party vs. exercise vs. commute vs. wind-down
   - Engagement depth: collector who reads liner notes vs. casual saver vs. shuffle-and-skip vs. one-album-at-a-time
   - Genre relationship: core fan vs. casual cross-over listener vs. occasional encounter vs. mild skeptic
   These four axes matter MORE than age/location for predicting reactions.

3. PERSONALITY TRAITS MUST BE OPINIONATED AND ACTIONABLE.
   "Music lover, open-minded" is useless — every persona is a music lover. Useful traits are SPECIFIC and OPINIONATED:
   - "Sensitive to lyrical clichés — will skip a song mid-listen if a chorus rhymes 'fire' with 'desire'"
   - "Loyal to artists; needs production consistency or feels betrayed"
   - "Driven by texture over melody — will save a song with no hook if the production is unusual"
   - "Reads music as social signal — what plays at parties matters more than what plays alone"
   These traits give the persona reasons to react NEGATIVELY to specific things, which is what produces useful signal.

4. ANTI-STEREOTYPE GUARDRAIL.
   Do not generate personas that reduce to demographic clichés. A 22-year-old Latina from Mexico City should not have "loves reggaeton" as her defining trait. Give her a music profile that's specific, idiosyncratic, and might surprise. Real listeners have weird preferences. The most useful persona is the one whose reactions you can't predict from their demographics.

5. MATCH LANGUAGE/CULTURAL CONTEXT TO THE BRIEF.
   If the brief targets Spanish-speaking audiences, most personas should be Spanish/Spanglish speakers with culturally specific reference points (and at least one personality trait written in their natural language). If the brief targets niche genres (synthwave, ambient, etc.), include personas with deep relationships to that scene. Don't generate generic "global music listeners" for culturally specific briefs.

6. USE DISTINCTIVE FIRST NAMES.
   Avoid the most common Western default names. Specifically avoid Marcus, Sarah, Jessica, David, Michael, Emily, Priya (for Indian personas), Sofia/Sofía (for Latin personas), Maria/María, John, Anna, and similar high-frequency defaults. Pick names that feel real for the persona's stated location and age cohort but that vary widely across panels — first names should rarely repeat across separate panel generations. Reach for names that a person actually born in that place and decade would have, including ones English-speakers might not immediately recognize.
   Names must be names that real parents give real children. No literary, Shakespearean, Romantic-poet, mythological, or place-name-as-first-name choices (no Ozymandias, Cressida, Persephone, Thessaly, Atlas, etc.). If the name wouldn't show up at roll call in a public school in the persona's location, pick something else. Aim for the realistic-uncommon middle: not "Marcus," not "Ozymandias" — names like "Tomás," "Yejin," "Nkechi," "Dariusz."

For each persona, output:
- name: First name + age + city. Example: "Maya, 24, Mexico City". Use real-feeling first names appropriate to the location.
- demographics: { age (number), location (city + region/country), occupation (specific job, not "professional") }
- musicProfile:
  - favoriteGenres: 2-4 genres, specific subgenres preferred ("hyperpop" not "pop"). Mix of obvious and surprising for the demographic.
  - listeningContexts: 2-3 contexts where this persona ACTIVELY listens. Be specific ("morning subway commute" not "commute").
  - discoveryHabits: 2-3 channels they actually use to find new music. Be specific ("Anthony Fantano YouTube reviews" not "YouTube").
- personalityTraits: 3-4 traits, OPINIONATED and SPECIFIC per the guidance above. At least one trait should give the persona a reason to react NEGATIVELY to certain music.

Output schema (return ONLY valid JSON):
{
  "personas": [
    {
      "name": string,
      "demographics": { "age": number, "location": string, "occupation": string },
      "musicProfile": {
        "favoriteGenres": string[],
        "listeningContexts": string[],
        "discoveryHabits": string[]
      },
      "personalityTraits": string[]
    },
    ... (6 total)
  ]
}`;

type PersonaGenerationResponse = {
  personas: Array<{
    name: string;
    demographics: { age: number; location: string; occupation: string };
    musicProfile: {
      favoriteGenres: string[];
      listeningContexts: string[];
      discoveryHabits: string[];
    };
    personalityTraits: string[];
  }>;
};

export async function generatePersonas(brief: Brief): Promise<Persona[]> {
  const result = await callClaudeJSON<PersonaGenerationResponse>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(brief),
    temperature: 1.0,
    maxTokens: 3500,
  });

  if (!Array.isArray(result.personas) || result.personas.length !== 6) {
    throw new Error(
      `Persona generator returned ${result.personas?.length ?? 0} personas, expected 6`,
    );
  }

  // name must follow "Name, age, city" format (commas + digits required)
  const NAME_FORMAT = /^[^,]+,\s*\d+,\s*.+$/;
  for (let i = 0; i < 6; i++) {
    const p = result.personas[i];
    if (
      !p.name ||
      !NAME_FORMAT.test(p.name) ||
      !p.demographics ||
      typeof p.demographics.age !== 'number' ||
      !p.demographics.location ||
      !p.demographics.occupation ||
      !Array.isArray(p.musicProfile?.favoriteGenres) ||
      !Array.isArray(p.musicProfile?.listeningContexts) ||
      !Array.isArray(p.musicProfile?.discoveryHabits) ||
      !Array.isArray(p.personalityTraits) ||
      p.personalityTraits.length < 3
    ) {
      throw new Error(`Persona ${i} (${p.name}) is malformed`);
    }
  }

  return result.personas.map((p) => ({
    id: `persona_${randomUUID()}`,
    briefId: brief.id,
    name: p.name,
    demographics: p.demographics,
    musicProfile: p.musicProfile,
    personalityTraits: p.personalityTraits,
  }));
}

function buildUserPrompt(brief: Brief): string {
  const { genre, mood, tempo, targetUseCase, targetDemographic } =
    brief.parsedAttributes;

  return `Generate a 6-persona synthetic listener panel for testing tracks made from this brief.

Original brief: "${brief.rawText}"

Parsed attributes:
- Genre: ${genre}
- Mood: ${mood.join(', ')}
- Tempo: ${tempo}
- Target use case: ${targetUseCase}
- Target demographic: ${targetDemographic}

Build a panel that will PRODUCE DIFFERENT REACTIONS. Span the target demographic, include 1-2 edge personas, differentiate on listening context and engagement depth, and use opinionated personality traits.`;
}
