// Triggered after variants generation completes. Generates 6 personas,
// persists them, advances run status to reacting.

import { NextRequest, NextResponse } from 'next/server';
import { getRun, getBrief, savePersonas, updateRunStatus } from '@/lib/kv';
import { generatePersonas } from '@/lib/prompts/generate-personas';
import { getBaseUrl } from '@/lib/url';

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

  if (run.status !== 'generating_personas') {
    return NextResponse.json(
      {
        error: `Run is in status '${run.status}', expected 'generating_personas'`,
      },
      { status: 409 },
    );
  }

  const brief = await getBrief(run.briefId);
  if (!brief) {
    await updateRunStatus(runId, 'error', 'Brief not found for run');
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }

  let personas;
  try {
    personas = await generatePersonas(brief);
  } catch (err) {
    console.error('Persona generation failed:', err);
    await updateRunStatus(
      runId,
      'error',
      `Persona generation failed: ${(err as Error).message}`,
    );
    return NextResponse.json(
      { error: 'Failed to generate personas' },
      { status: 500 },
    );
  }

  try {
    await savePersonas(brief.id, personas);
    await updateRunStatus(runId, 'reacting');

    triggerReactions(runId).catch((err) => {
      console.error(`Reactions trigger failed for run ${runId}:`, err);
    });

    return NextResponse.json({
      runId: run.id,
      personaCount: personas.length,
      personas,
    });
  } catch (err) {
    console.error('POST /api/personas persistence failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function triggerReactions(runId: string): Promise<void> {
  await fetch(`${getBaseUrl()}/api/reactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId }),
  });
}
