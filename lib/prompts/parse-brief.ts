// Parses a free-text creative brief into structured attributes.
// Used by /api/brief to populate Brief.parsedAttributes.

import type { ParsedAttributes } from '../types';
import { callClaudeJSON } from '../anthropic';

const SYSTEM_PROMPT = `You parse music creative briefs into structured attributes for downstream content generation in an AI music studio's production pipeline.

Your output drives:
- Variant generation (5 distinct track concepts derived from the brief)
- Persona generation (synthetic listener panel matching the target audience)
- Reaction prediction (how those listeners respond to those variants)

Quality requirements:
- genre: specific subgenre, not broad category. "lo-fi hip hop" not "hip hop". "indie folk pop" not "pop".
- mood: 1-3 evocative tags drawn from how a listener would describe the feel, not how a producer would describe the production. Use words like "melancholic", "euphoric", "introspective", "playful". Avoid technical terms. Quality over quantity — return 2 strong tags rather than padding to 3 with a weak one like "calm" or "nice".
- tempo: BPM range or descriptor. "75-85 BPM" or "mid-tempo" or "slow ballad pacing". Specific is better than vague. Keep it under 8 words.
- targetUseCase: where/how this would be heard. "background study music", "TikTok-ready hook", "playlist anchor track for road trips", "gym playlist filler", "sleep aid". Be specific to the listener's context.
- targetDemographic: age range and identity signals describing the END LISTENERS — people who actually hear and react to the song. NOT buyers, curators, music supervisors, A&R, or other industry intermediaries. For sync-licensing briefs (films, ads, games), the listeners are the audience watching the film/ad/game, not the people licensing the track. Examples: "18-30 urban listeners", "Gen Z TikTok users", "millennial nostalgia listeners", "indie sci-fi film audiences, 25-40".

If the brief is vague or missing information, infer reasonable values from genre conventions. Don't return placeholder strings — every field must be a meaningful value.

Output schema (return ONLY valid JSON):
{
  "genre": string,
  "mood": string[] (1-3 items),
  "tempo": string,
  "targetUseCase": string,
  "targetDemographic": string
}`;

export async function parseBrief(rawText: string): Promise<ParsedAttributes> {
  const result = await callClaudeJSON<ParsedAttributes>({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Parse this creative brief:\n\n${rawText}`,
    temperature: 0.3,
  });

  if (
    !result.genre ||
    !Array.isArray(result.mood) ||
    !result.tempo ||
    !result.targetUseCase ||
    !result.targetDemographic
  ) {
    throw new Error('Brief parser returned incomplete attributes');
  }

  return result;
}
