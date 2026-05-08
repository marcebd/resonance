// Stub. Task 2.1 will replace the unparsed-attribute placeholders with real
// parse-brief Claude calls. The shape of the request/response stays identical.

import { NextRequest, NextResponse } from 'next/server';
import { saveBrief, createRun } from '@/lib/kv';

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

  try {
    const brief = await saveBrief(rawText, {
      genre: 'unparsed',
      mood: [],
      tempo: 'unparsed',
      targetUseCase: 'unparsed',
      targetDemographic: 'unparsed',
    });
    const run = await createRun(brief.id);
    return NextResponse.json({ runId: run.id });
  } catch (err) {
    console.error('POST /api/brief failed:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
