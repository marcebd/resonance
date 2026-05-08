// Polling endpoint for the live generation view. Returns whatever data exists
// for a run; the UI renders progressively from this single shape.

import { NextRequest, NextResponse } from 'next/server';
import { getFullRun } from '@/lib/kv';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const fullRun = await getFullRun(id);
  if (!fullRun) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }
  return NextResponse.json(fullRun);
}
