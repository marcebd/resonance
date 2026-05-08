// Final stage of the pipeline. Aggregates 30 reactions into a Synthesis object,
// persists it, advances run status to 'complete'.

import { NextRequest, NextResponse } from 'next/server';
import {
  getRun,
  getBrief,
  getVariants,
  getPersonas,
  getReactions,
  saveSynthesis,
  updateRunStatus,
} from '@/lib/kv';
import { synthesize } from '@/lib/prompts/synthesize';

export const maxDuration = 120; // Opus is slower; 2-minute window is plenty

export async function POST(req: NextRequest) {
  let body: { runId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const runId = body?.runId;
  if (typeof runId !== 'string') {
    return NextResponse.json(
      { error: 'runId must be a string' },
      { status: 400 },
    );
  }

  const run = await getRun(runId);
  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  if (run.status !== 'synthesizing') {
    return NextResponse.json(
      { error: `Run is in status '${run.status}', expected 'synthesizing'` },
      { status: 409 },
    );
  }

  const [brief, variants, personas, reactions] = await Promise.all([
    getBrief(run.briefId),
    getVariants(run.briefId),
    getPersonas(run.briefId),
    getReactions(run.briefId),
  ]);

  if (
    !brief ||
    variants.length === 0 ||
    personas.length === 0 ||
    reactions.length === 0
  ) {
    await updateRunStatus(runId, 'error', 'Missing data for synthesis');
    return NextResponse.json(
      { error: 'Missing data for synthesis' },
      { status: 422 },
    );
  }

  let synthesis;
  try {
    synthesis = await synthesize(brief, variants, personas, reactions);
  } catch (err) {
    console.error('Synthesis generation failed:', err);
    await updateRunStatus(
      runId,
      'error',
      `Synthesis failed: ${(err as Error).message}`,
    );
    return NextResponse.json(
      { error: 'Failed to generate synthesis' },
      { status: 500 },
    );
  }

  try {
    await saveSynthesis(brief.id, synthesis);
    await updateRunStatus(runId, 'complete');
    return NextResponse.json({ runId: run.id, synthesis });
  } catch (err) {
    console.error('POST /api/synthesize persistence failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
