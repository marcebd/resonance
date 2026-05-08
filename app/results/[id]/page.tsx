// The headline page Soheil reads first. Layout-only —
// real components plug in via Tasks 3.3 (matrix), 3.5 (transmission), 3.6 (deep-dive).

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFullRun } from '@/lib/kv';
import ResultsHeader from '@/components/results/ResultsHeader';
import RecommendationCard from '@/components/results/RecommendationCard';
import TopPicksCard from '@/components/results/TopPicksCard';
import DivergentReactionsCard from '@/components/results/DivergentReactionsCard';
import ReactionMatrix from '@/components/results/ReactionMatrix';
import TransmissionGraphPlaceholder from '@/components/results/TransmissionGraphPlaceholder';
import DeepDiveSection from '@/components/results/DeepDiveSection';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fullRun = await getFullRun(id);

  if (!fullRun || fullRun.run.status !== 'complete' || !fullRun.synthesis) {
    notFound();
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

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <ResultsHeader brief={fullRun.brief} run={fullRun.run} />

        <RecommendationCard
          recommendation={fullRun.synthesis.recommendation}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <TopPicksCard
            segments={fullRun.synthesis.topVariantPerSegment}
            variants={fullRun.variants}
            topVariantOverall={fullRun.synthesis.topVariantOverall}
          />
          <DivergentReactionsCard
            divergentReactions={fullRun.synthesis.divergentReactions}
            variants={fullRun.variants}
            personas={fullRun.personas}
          />
        </div>

        <ReactionMatrix
          variants={fullRun.variants}
          personas={fullRun.personas}
          reactions={fullRun.reactions}
        />

        <TransmissionGraphPlaceholder
          variants={fullRun.variants}
          personas={fullRun.personas}
          reactions={fullRun.reactions}
        />

        <DeepDiveSection
          variants={fullRun.variants}
          personas={fullRun.personas}
          reactions={fullRun.reactions}
        />

        <footer className="border-t border-neutral-300 pt-6 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          Built with Claude Code · Sonnet 4.6 + Opus 4.7 · Synthetic personas
          are directional, not predictive
        </footer>
      </div>
    </main>
  );
}
