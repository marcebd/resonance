// Cast list of all 5 variants — sits above the recommendation so the reader
// has context for what "Variant D" means before reading the verdict.

import type { Variant } from '@/lib/types';

type Props = {
  variants: Variant[];
};

export default function VariantList({ variants }: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Variants Tested
      </p>
      <div className="space-y-4">
        {variants.map((v) => (
          <div key={v.id} className="border-l-2 border-neutral-300 pl-3">
            <p className="font-mono text-sm font-bold text-neutral-900">
              {v.label}
              {v.title && (
                <span className="ml-1 font-normal text-neutral-700">
                  — {v.title}
                </span>
              )}
            </p>
            <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-700">
              {v.description}
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
              Hook
            </p>
            <p className="mt-0.5 font-mono text-xs leading-relaxed text-neutral-600">
              {v.hook}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
