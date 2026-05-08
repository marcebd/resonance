// Inline expansion panel for a clicked variant row in the matrix.
// Mirrors ReactionDetail's location/style so the user keeps spatial context.

import type { Variant } from '@/lib/types';

type Props = {
  variant: Variant;
  onClose: () => void;
};

export default function VariantDetail({ variant, onClose }: Props) {
  return (
    <div className="mt-5 border border-neutral-300 bg-neutral-50 px-5 py-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-mono text-sm font-bold text-neutral-900">
          Variant {variant.label}
          {variant.title && (
            <span className="ml-1 font-normal text-neutral-700">
              — {variant.title}
            </span>
          )}
        </p>
        <button
          onClick={onClose}
          className="shrink-0 text-neutral-400 hover:text-black"
          aria-label="Close detail panel"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
        Description
      </p>
      <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-800">
        {variant.description}
      </p>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
        Hook
      </p>
      <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-800">
        {variant.hook}
      </p>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
        Production notes
      </p>
      <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-600">
        {variant.productionNotes}
      </p>
    </div>
  );
}
