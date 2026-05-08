// Validates input, parses the brief via Claude, persists Brief and Run,
// and advances run status to generating_variants. Task 2.2 will add the
// actual variant generation trigger.

import { NextRequest, NextResponse } from 'next/server';
import { saveBrief, createRun, updateRunStatus } from '@/lib/kv';
import { parseBrief } from '@/lib/prompts/parse-brief';
import { getBaseUrl } from '@/lib/url';

const MIN_LENGTH = 20;
const MAX_LENGTH = 2000;

export async function POST(req: NextRequest) {
  let body: { rawText?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const rawText = body?.rawText;

  if (typeof rawText !== 'string') {
    return NextResponse.json(
      { error: 'rawText must be a string' },
      { status: 400 },
    );
  }

  if (rawText.length < MIN_LENGTH || rawText.length > MAX_LENGTH) {
    return NextResponse.json(
      {
        error: `Brief must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`,
      },
      { status: 400 },
    );
  }

  let parsedAttributes;
  try {
    parsedAttributes = await parseBrief(rawText);
  } catch (err) {
    console.error('Brief parsing failed:', err);
    return NextResponse.json(
      { error: 'Failed to parse brief. Try a more specific description.' },
      { status: 422 },
    );
  }

  try {
    const brief = await saveBrief(rawText, parsedAttributes);
    const run = await createRun(brief.id);
    await updateRunStatus(run.id, 'generating_variants');

    // Fire-and-forget — return runId immediately so the frontend can navigate.
    // The variants endpoint runs asynchronously; the run page polls for status.
    triggerVariantsGeneration(run.id).catch((err) => {
      console.error(`Variants trigger failed for run ${run.id}:`, err);
    });

    return NextResponse.json({
      runId: run.id,
      briefId: brief.id,
      parsedAttributes,
    });
  } catch (err) {
    console.error('POST /api/brief failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function triggerVariantsGeneration(runId: string): Promise<void> {
  await fetch(`${getBaseUrl()}/api/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId }),
  });
}
