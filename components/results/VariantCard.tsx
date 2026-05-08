// Used by the Deep Dive "Variants" tab — full description + production notes
// for each variant. Different shape from VariantList (which is the cast list
// at the top of the page).

import type { Variant } from '@/lib/types';

type Props = {
  variant: Variant;
};

export default function VariantCard({ variant }: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-4 py-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl font-bold text-neutral-900">
          {variant.label}
        </span>
        {variant.title && (
          <p className="font-mono text-sm font-bold text-neutral-700">
            {variant.title}
          </p>
        )}
      </div>

      <p className="mt-2 font-mono text-xs italic leading-relaxed text-neutral-600">
        {variant.hook}
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Description
          </p>
          <p className="mt-1 font-mono text-sm leading-relaxed text-neutral-800">
            {variant.description}
          </p>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Production
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-600">
            {variant.productionNotes}
          </p>
        </div>
      </div>
    </div>
  );
}
