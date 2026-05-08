// Server-fetches the run, hands data to the client ResultsView for state
// coordination. Keeps the matrix/cards highlight wiring out of this layer.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getFullRun } from '@/lib/kv';
import ResultsView from '@/components/results/ResultsView';
import ErroredRunView from '@/components/results/ErroredRunView';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fullRun = await getFullRun(id);

  if (!fullRun) notFound();

  if (fullRun.run.status === 'error') {
    return (
      <ErroredRunView
        message={fullRun.run.errorMessage ?? 'Generation failed.'}
      />
    );
  }

  if (fullRun.run.status !== 'complete') {
    // Run is still in progress — send the user to the live generation view
    redirect(`/run/${id}`);
  }

  if (!fullRun.synthesis || fullRun.reactions.length === 0) {
    return (
      <ErroredRunView message="Run completed but synthesis or reactions are missing." />
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 py-3">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.2em] hover:text-neutral-500"
        >
          <span aria-hidden="true">♪ </span>RESONANCE
        </Link>
        <Link
          href="/"
          className="border border-black px-3 py-1 font-mono text-[10px] tracking-[0.25em] hover:bg-black hover:text-white"
        >
          NEW RUN →
        </Link>
      </header>

      <ResultsView fullRun={fullRun} />
    </main>
  );
}
