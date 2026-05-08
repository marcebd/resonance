// Triggered after personas generation completes. Generates 30 reactions in
// parallel (6 personas × 5 variants), persists them, advances to synthesizing.

import { NextRequest, NextResponse } from 'next/server';
import {
  getRun,
  getVariants,
  getPersonas,
  saveReactions,
  updateRunStatus,
} from '@/lib/kv';
import { generateAllReactions } from '@/lib/orchestrate-reactions';
import { getBaseUrl } from '@/lib/url';

export const maxDuration = 300; // 5-minute Vercel function timeout

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

  if (run.status !== 'reacting') {
    return NextResponse.json(
      { error: `Run is in status '${run.status}', expected 'reacting'` },
      { status: 409 },
    );
  }

  const [variants, personas] = await Promise.all([
    getVariants(run.briefId),
    getPersonas(run.briefId),
  ]);

  if (variants.length === 0 || personas.length === 0) {
    await updateRunStatus(runId, 'error', 'Missing variants or personas');
    return NextResponse.json(
      { error: 'Missing variants or personas' },
      { status: 422 },
    );
  }

  let result;
  try {
    result = await generateAllReactions(variants, personas);
  } catch (err) {
    console.error('Reaction generation failed:', err);
    await updateRunStatus(
      runId,
      'error',
      `Reaction generation failed: ${(err as Error).message}`,
    );
    return NextResponse.json(
      { error: 'Failed to generate reactions' },
      { status: 500 },
    );
  }

  try {
    await saveReactions(run.briefId, result.reactions);
    await updateRunStatus(runId, 'synthesizing');

    triggerSynthesis(runId).catch((err) => {
      console.error(`Synthesis trigger failed for run ${runId}:`, err);
    });

    return NextResponse.json({
      runId: run.id,
      reactionCount: result.reactions.length,
      failureCount: result.failureCount,
      totalAttempted: result.totalAttempted,
    });
  } catch (err) {
    console.error('POST /api/reactions persistence failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function triggerSynthesis(runId: string): Promise<void> {
  await fetch(`${getBaseUrl()}/api/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId }),
  });
}
