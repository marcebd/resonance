'use client';

import Link from 'next/link';
import { useRunPolling } from '@/lib/hooks/use-run-polling';
import { STAGES, getStageStatus } from '@/lib/run-stages';
import StageCard from '@/components/StageCard';

export default function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { runId, fullRun, error, notFound } = useRunPolling(params);
  if (notFound) return <NotFoundState />;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 py-3">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.2em] hover:text-neutral-500"
        >
          <span aria-hidden="true">♪ </span>RESONANCE
        </Link>
        <span className="border border-black px-3 py-1 font-mono text-[10px] tracking-[0.25em]">
          RUN {runId ? runId.slice(4, 12).toUpperCase() : '────────'}
        </span>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {fullRun && (
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-neutral-500">
              BRIEF / 01
            </p>
            <p className="border-l-2 border-cyan-400 pl-4 font-mono text-sm leading-relaxed text-neutral-800">
              {fullRun.brief.rawText}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 border border-red-500 bg-red-50 px-4 py-3 font-mono text-xs text-red-800">
            <p className="font-medium uppercase tracking-[0.2em]">
              Generation failed
            </p>
            <p className="mt-2 leading-relaxed">{error}</p>
            <Link
              href="/"
              className="mt-3 inline-block underline hover:no-underline"
            >
              ← Start a new run
            </Link>
          </div>
        )}

        <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-neutral-500">
          PIPELINE / 02
        </p>
        <div className="space-y-2">
          {STAGES.map((s) => (
            <StageCard
              key={s.status}
              label={s.label}
              status={getStageStatus(fullRun?.run.status, s.status)}
              detail={s.detail(fullRun)}
              multiline={s.multiline}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function NotFoundState() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-mono text-2xl tracking-tight">RUN NOT FOUND</h1>
        <p className="mt-3 font-mono text-sm text-neutral-600">
          This run ID doesn&apos;t exist or has expired (30-day TTL).
        </p>
        <Link
          href="/"
          className="mt-6 inline-block border border-black bg-black px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
        >
          Start a new run →
        </Link>
      </div>
    </main>
  );
}
