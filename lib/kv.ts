// Single abstraction over the Vercel-managed Upstash Redis instance.
// Every API route uses these helpers; never reach for the redis client directly.
// Storage keys: run:{runId}, brief:{briefId}, variants:{briefId}, etc.

import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';
import { env } from './env';
import type {
  Brief,
  Variant,
  Persona,
  Reaction,
  Synthesis,
  Run,
  RunStatus,
  FullRun,
} from './types';

const kv = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// --- Brief ---

export async function saveBrief(
  rawText: string,
  parsedAttributes: Brief['parsedAttributes'],
): Promise<Brief> {
  const brief: Brief = {
    id: `brief_${randomUUID()}`,
    rawText,
    parsedAttributes,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`brief:${brief.id}`, brief, { ex: TTL_SECONDS });
  return brief;
}

export async function getBrief(briefId: string): Promise<Brief | null> {
  return await kv.get<Brief>(`brief:${briefId}`);
}

// --- Run ---

export async function createRun(briefId: string): Promise<Run> {
  const now = new Date().toISOString();
  const run: Run = {
    id: `run_${randomUUID()}`,
    briefId,
    status: 'parsing',
    createdAt: now,
    updatedAt: now,
  };
  await kv.set(`run:${run.id}`, run, { ex: TTL_SECONDS });
  return run;
}

export async function getRun(runId: string): Promise<Run | null> {
  return await kv.get<Run>(`run:${runId}`);
}

export async function updateRunStatus(
  runId: string,
  status: RunStatus,
  errorMessage?: string,
): Promise<Run> {
  const existing = await getRun(runId);
  if (!existing) {
    throw new Error(`Run ${runId} not found`);
  }
  const updated: Run = {
    ...existing,
    status,
    errorMessage,
    updatedAt: new Date().toISOString(),
  };
  await kv.set(`run:${runId}`, updated, { ex: TTL_SECONDS });
  return updated;
}

// --- Variants / Personas / Reactions / Synthesis (all keyed by briefId) ---

export async function saveVariants(
  briefId: string,
  variants: Variant[],
): Promise<void> {
  await kv.set(`variants:${briefId}`, variants, { ex: TTL_SECONDS });
}

export async function getVariants(briefId: string): Promise<Variant[]> {
  return (await kv.get<Variant[]>(`variants:${briefId}`)) ?? [];
}

export async function savePersonas(
  briefId: string,
  personas: Persona[],
): Promise<void> {
  await kv.set(`personas:${briefId}`, personas, { ex: TTL_SECONDS });
}

export async function getPersonas(briefId: string): Promise<Persona[]> {
  return (await kv.get<Persona[]>(`personas:${briefId}`)) ?? [];
}

export async function saveReactions(
  briefId: string,
  reactions: Reaction[],
): Promise<void> {
  await kv.set(`reactions:${briefId}`, reactions, { ex: TTL_SECONDS });
}

export async function getReactions(briefId: string): Promise<Reaction[]> {
  return (await kv.get<Reaction[]>(`reactions:${briefId}`)) ?? [];
}

export async function saveSynthesis(
  briefId: string,
  synthesis: Synthesis,
): Promise<void> {
  await kv.set(`synthesis:${briefId}`, synthesis, { ex: TTL_SECONDS });
}

export async function getSynthesis(
  briefId: string,
): Promise<Synthesis | null> {
  return await kv.get<Synthesis>(`synthesis:${briefId}`);
}

// --- Full run aggregator (results page) ---

export async function getFullRun(runId: string): Promise<FullRun | null> {
  const run = await getRun(runId);
  if (!run) return null;

  const brief = await getBrief(run.briefId);
  if (!brief) return null;

  const [variants, personas, reactions, synthesis] = await Promise.all([
    getVariants(run.briefId),
    getPersonas(run.briefId),
    getReactions(run.briefId),
    getSynthesis(run.briefId),
  ]);

  return { run, brief, variants, personas, reactions, synthesis };
}
