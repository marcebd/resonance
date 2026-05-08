// Single orchestrator that runs the entire pipeline (variants → personas →
// reactions → synthesis) inline. Replaces the chain-of-fetches architecture
// because Vercel-to-Vercel fetches inside after() callbacks dispatch
// unreliably; running the full chain in one function removes that failure mode.

import type { Brief } from './types';
import {
  saveVariants,
  savePersonas,
  saveReactions,
  saveSynthesis,
  updateRunStatus,
} from './kv';
import { generateVariants } from './prompts/generate-variants';
import { generatePersonas } from './prompts/generate-personas';
import { generateAllReactions } from './orchestrate-reactions';
import { synthesize } from './prompts/synthesize';

export async function runPipeline(runId: string, brief: Brief): Promise<void> {
  try {
    // Stage 1: variants (status is already 'generating_variants' from caller)
    const variants = await generateVariants(brief);
    await saveVariants(brief.id, variants);
    await updateRunStatus(runId, 'generating_personas');

    // Stage 2: personas
    const personas = await generatePersonas(brief);
    await savePersonas(brief.id, personas);
    await updateRunStatus(runId, 'reacting');

    // Stage 3: reactions (30 in parallel)
    const result = await generateAllReactions(variants, personas);
    await saveReactions(brief.id, result.reactions);
    await updateRunStatus(runId, 'synthesizing');

    // Stage 4: synthesis
    const synthesis = await synthesize(
      brief,
      variants,
      personas,
      result.reactions,
    );
    await saveSynthesis(brief.id, synthesis);
    await updateRunStatus(runId, 'complete');
  } catch (err) {
    console.error(`Pipeline failed for run ${runId}:`, err);
    await updateRunStatus(
      runId,
      'error',
      `Pipeline failed: ${(err as Error).message}`,
    );
  }
}
