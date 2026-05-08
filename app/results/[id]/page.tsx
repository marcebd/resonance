// Placeholder. Task 3.2 will replace this with the results dashboard
// (synthesis cards, reaction matrix, transmission graph).
// For now: full FullRun JSON dump so we can verify pipeline output end-to-end.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFullRun } from '@/lib/kv';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fullRun = await getFullRun(id);
  if (!fullRun) notFound();

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
          RESULTS {id.slice(4, 12).toUpperCase()}
        </span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-block font-mono text-[10px] tracking-[0.3em] text-neutral-500 hover:text-black"
        >
          ← BACK
        </Link>

        <h1 className="mb-3 font-mono text-2xl tracking-tight">
          STATUS:{' '}
          <span className="text-cyan-500">
            {fullRun.run.status.replace('_', ' ').toUpperCase()}
          </span>
        </h1>

        <p className="mb-10 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Placeholder · Task 3.2 replaces this with the results dashboard
        </p>

        <pre className="overflow-x-auto border border-black bg-neutral-50 p-4 font-mono text-[11px] leading-relaxed text-neutral-800">
          {JSON.stringify(fullRun, null, 2)}
        </pre>
      </div>
    </main>
  );
}
