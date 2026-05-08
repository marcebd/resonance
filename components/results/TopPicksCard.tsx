import type { SegmentWinner, Variant } from '@/lib/types';

type Props = {
  segments: SegmentWinner[];
  variants: Variant[];
  topVariantOverall: string;
};

export default function TopPicksCard({
  segments,
  variants,
  topVariantOverall,
}: Props) {
  const overallVariant = variants.find((v) => v.id === topVariantOverall);

  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Top Picks
      </p>

      {overallVariant && (
        <div className="mb-5 bg-neutral-50 px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Overall
          </p>
          <p className="mt-2 font-mono text-sm font-bold text-neutral-900">
            Variant {overallVariant.label}
            {overallVariant.title && (
              <span className="ml-1 font-normal">
                — {overallVariant.title}
              </span>
            )}
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-neutral-600">
            {overallVariant.hook}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {segments.map((seg, i) => {
          const variant = variants.find((v) => v.id === seg.variantId);
          if (!variant) return null;
          return (
            <div key={i} className="border-l-2 border-neutral-300 pl-3">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
