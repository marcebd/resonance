'use client';

import type { DivergentReaction, Variant, Persona } from '@/lib/types';

type Props = {
  divergentReactions: DivergentReaction[];
  variants: Variant[];
  personas: Persona[];
  onVariantClick: (variantId: string) => void;
  highlightedVariantId: string | null;
};

export default function DivergentReactionsCard({
  divergentReactions,
  variants,
  personas,
  onVariantClick,
  highlightedVariantId,
}: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Polarized Variants
      </p>

      <div className="space-y-3">
        {divergentReactions.map((div, i) => {
          const variant = variants.find((v) => v.id === div.variantId);
          const advocate = personas.find((p) => p.id === div.topAdvocate);
          const detractor = personas.find((p) => p.id === div.topDetractor);
          if (!variant) return null;
          const isHighlighted = highlightedVariantId === variant.id;
          return (
            <button
              key={i}
              onClick={() => onVariantClick(variant.id)}
              className={`block w-full border-l-2 py-2 pl-3 pr-2 text-left transition-colors ${
                isHighlighted
                  ? 'border-black bg-neutral-50'
                  : 'border-cyan-400 hover:border-black hover:bg-neutral-50'
              }`}
            >
              <p className="font-mono text-sm font-medium text-neutral-900">
                Variant {variant.label}
                {variant.title && (
                  <span className="ml-1 font-normal text-neutral-700">
                    — {variant.title}
                  </span>
                )}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em]">
                <span className="text-neutral-500">
                  Advocate{' '}
                  <span className="font-medium normal-case text-neutral-800">
                    {firstNameOf(advocate?.name)}
                  </span>
                </span>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500">
                  Detractor{' '}
                  <span className="font-medium normal-case text-neutral-800">
                    {firstNameOf(detractor?.name)}
                  </span>
                </span>
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-700">
                {div.insight}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function firstNameOf(name: string | undefined): string {
  if (!name) return 'Unknown';
  return name.split(',')[0].trim();
}
