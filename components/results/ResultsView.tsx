'use client';

// Owns the cross-component highlight state. The server page fetches FullRun
// and renders this; this component coordinates clicks across the synthesis
// cards and the matrix below.

import { useState } from 'react';
import type { FullRun } from '@/lib/types';
import ResultsHeader from './ResultsHeader';
import VariantList from './VariantList';
import RecommendationCard from './RecommendationCard';
import TopPicksCard from './TopPicksCard';
import DivergentReactionsCard from './DivergentReactionsCard';
import ReactionMatrix from './ReactionMatrix';
import TransmissionGraphPlaceholder from './TransmissionGraphPlaceholder';
import DeepDiveSection from './DeepDiveSection';

type Props = {
  fullRun: FullRun;
};

export default function ResultsView({ fullRun }: Props) {
  const [highlightedVariantId, setHighlightedVariantId] = useState<
    string | null
  >(null);

  function handleVariantClick(variantId: string) {
    setHighlightedVariantId(variantId);
    const matrixEl = document.getElementById('reaction-matrix');
    if (matrixEl) {
      matrixEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // synthesis is guaranteed by the server-side check in the page
  const synthesis = fullRun.synthesis!;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <ResultsHeader brief={fullRun.brief} run={fullRun.run} />

      <VariantList variants={fullRun.variants} />

      <RecommendationCard recommendation={synthesis.recommendation} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TopPicksCard
          segments={synthesis.topVariantPerSegment}
          variants={fullRun.variants}
          topVariantOverall={synthesis.topVariantOverall}
          onVariantClick={handleVariantClick}
          highlightedVariantId={highlightedVariantId}
        />
        <DivergentReactionsCard
          divergentReactions={synthesis.divergentReactions}
          variants={fullRun.variants}
          personas={fullRun.personas}
          onVariantClick={handleVariantClick}
          highlightedVariantId={highlightedVariantId}
        />
      </div>

      <div id="reaction-matrix">
        <ReactionMatrix
          variants={fullRun.variants}
          personas={fullRun.personas}
          reactions={fullRun.reactions}
          highlightedVariantId={highlightedVariantId}
          onClearHighlight={() => setHighlightedVariantId(null)}
        />
      </div>

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

      <footer className="border-t border-neutral-300 pb-2 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
        Built with Claude Code · Sonnet 4.6 + Opus 4.7 · Synthetic personas
        are directional, not predictive
      </footer>
    </div>
  );
}
