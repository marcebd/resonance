// Triggered after brief parsing completes. Generates 5 variants, persists them,
// advances run status to generating_personas.

import { NextRequest, NextResponse } from 'next/server';
import { getRun, getBrief, saveVariants, updateRunStatus } from '@/lib/kv';
import { generateVariants } from '@/lib/prompts/generate-variants';

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

  if (run.status !== 'generating_variants') {
    return NextResponse.json(
      {
        error: `Run is in status '${run.status}', expected 'generating_variants'`,
      },
      { status: 409 },
    );
  }

  const brief = await getBrief(run.briefId);
  if (!brief) {
    await updateRunStatus(runId, 'error', 'Brief not found for run');
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }

  let variants;
  try {
    variants = await generateVariants(brief);
  } catch (err) {
    console.error('Variant generation failed:', err);
    await updateRunStatus(
      runId,
      'error',
      `Variant generation failed: ${(err as Error).message}`,
    );
    return NextResponse.json(
      { error: 'Failed to generate variants' },
      { status: 500 },
    );
  }

  try {
    await saveVariants(brief.id, variants);
    await updateRunStatus(runId, 'generating_personas');
    return NextResponse.json({
      runId: run.id,
      variantCount: variants.length,
      variants,
    });
  } catch (err) {
    console.error('POST /api/variants persistence failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
