'use client';

import type { SegmentWinner, Variant } from '@/lib/types';

type Props = {
  segments: SegmentWinner[];
  variants: Variant[];
  topVariantOverall: string;
  onVariantClick: (variantId: string) => void;
  highlightedVariantId: string | null;
};

export default function TopPicksCard({
  segments,
  variants,
  topVariantOverall,
  onVariantClick,
  highlightedVariantId,
}: Props) {
  const overallVariant = variants.find((v) => v.id === topVariantOverall);
  const segmentWinnerIds = new Set(segments.map((s) => s.variantId));
  const showsTension =
    !segmentWinnerIds.has(topVariantOverall) || segmentWinnerIds.size > 1;

  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Top Picks
      </p>

      {overallVariant && (
        <button
          onClick={() => onVariantClick(overallVariant.id)}
          className={`mb-4 block w-full px-4 py-3 text-left transition-colors ${
            highlightedVariantId === overallVariant.id
              ? 'bg-black text-white'
              : 'bg-neutral-50 hover:bg-neutral-100'
          }`}
        >
          <p
            className={`font-mono text-[9px] uppercase tracking-[0.25em] ${
              highlightedVariantId === overallVariant.id
                ? 'text-neutral-300'
                : 'text-neutral-500'
            }`}
          >
            Overall winner
          </p>
          <p className="mt-2 font-mono text-sm font-bold">
            Variant {overallVariant.label}
            {overallVariant.title && (
              <span className="ml-1 font-normal">— {overallVariant.title}</span>
            )}
          </p>
          <p
            className={`mt-1 font-mono text-xs leading-relaxed ${
              highlightedVariantId === overallVariant.id
                ? 'text-neutral-300'
                : 'text-neutral-600'
            }`}
          >
            {overallVariant.hook}
          </p>
        </button>
      )}

      {showsTension && (
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          But segments diverge ↓
        </p>
      )}

      <div className="space-y-2">
        {segments.map((seg, i) => {
          const variant = variants.find((v) => v.id === seg.variantId);
          if (!variant) return null;
          const isHighlighted = highlightedVariantId === variant.id;
          return (
            <button
              key={i}
              onClick={() => onVariantClick(variant.id)}
              className={`block w-full border-l-2 py-1.5 pl-3 pr-2 text-left transition-colors ${
                isHighlighted
                  ? 'border-black bg-neutral-50'
                  : 'border-neutral-300 hover:border-black hover:bg-neutral-50'
              }`}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                {seg.segmentLabel}
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-neutral-900">
                Variant {variant.label}
                {variant.title && (
                  <span className="ml-1 font-normal text-neutral-700">
                    — {variant.title}
                  </span>
                )}
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-600">
                {seg.reasoning}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
