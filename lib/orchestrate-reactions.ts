// Orchestrates 30 reaction calls (6 personas × 5 variants) with concurrency
// control, per-call retry with backoff, and partial-failure tolerance.

import pLimit from 'p-limit';
import type { Persona, Variant, Reaction } from './types';
import { generateReaction } from './prompts/react-to-variant';

const CONCURRENCY = 6;
const MAX_RETRIES_PER_REACTION = 2;
const MAX_TOLERABLE_FAILURES = 3; // out of N×M, abort if exceeded

export type ReactionGenerationResult = {
  reactions: Reaction[];
  failureCount: number;
  totalAttempted: number;
};

export async function generateAllReactions(
  variants: Variant[],
  personas: Persona[],
): Promise<ReactionGenerationResult> {
  const limit = pLimit(CONCURRENCY);
  const totalAttempted = variants.length * personas.length;

  const pairs: Array<{ persona: Persona; variant: Variant }> = [];
  for (const persona of personas) {
    for (const variant of variants) {
      pairs.push({ persona, variant });
    }
  }

  const results = await Promise.all(
    pairs.map(({ persona, variant }) =>
      limit(() =>
        generateReactionWithRetry(persona, variant, personas).catch((err) => {
          console.error(
            `Reaction failed permanently — ${persona.name} × variant ${variant.label}:`,
            err.message,
          );
          return null;
        }),
      ),
    ),
  );

  const reactions = results.filter((r): r is Reaction => r !== null);
  const failureCount = totalAttempted - reactions.length;

  if (failureCount > MAX_TOLERABLE_FAILURES) {
    throw new Error(
      `Too many reaction failures: ${failureCount}/${totalAttempted}. Aborting run.`,
    );
  }

  return { reactions, failureCount, totalAttempted };
}

async function generateReactionWithRetry(
  persona: Persona,
  variant: Variant,
  allPersonas: Persona[],
): Promise<Reaction> {
  const otherPersonas = allPersonas.filter((p) => p.id !== persona.id);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES_PER_REACTION; attempt++) {
    try {
      return await generateReaction(persona, variant, otherPersonas);
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES_PER_REACTION) {
        const delay = 1000 * Math.pow(2, attempt); // 1s, 2s
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Reaction generation failed after ${MAX_RETRIES_PER_REACTION + 1} attempts: ${lastError?.message}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
