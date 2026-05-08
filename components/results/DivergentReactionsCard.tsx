import type { DivergentReaction, Variant, Persona } from '@/lib/types';

type Props = {
  divergentReactions: DivergentReaction[];
  variants: Variant[];
  personas: Persona[];
};

export default function DivergentReactionsCard({
  divergentReactions,
  variants,
  personas,
}: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Polarized Variants
      </p>

      <div className="space-y-5">
        {divergentReactions.map((div, i) => {
          const variant = variants.find((v) => v.id === div.variantId);
          const advocate = personas.find((p) => p.id === div.topAdvocate);
          const detractor = personas.find((p) => p.id === div.topDetractor);
          if (!variant) return null;

          return (
            <div key={i} className="border-l-2 border-cyan-400 pl-3">
              <p className="font-mono text-sm font-medium text-neutral-900">
                Variant {variant.label}
                {variant.title && (
                  <span className="ml-1 font-normal text-neutral-700">
                    — {variant.title}
                  </span>
                )}
              </p>
              <p className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                <span>
                  Advocate{' '}
                  <span className="font-medium text-neutral-800">
                    {advocate?.name ?? 'unknown'}
                  </span>
                </span>
                <span>·</span>
                <span>
                  Detractor{' '}
                  <span className="font-medium text-neutral-800">
                    {detractor?.name ?? 'unknown'}
                  </span>
                </span>
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-700">
                {div.insight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
