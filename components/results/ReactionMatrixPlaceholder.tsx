import type { Variant, Persona, Reaction } from '@/lib/types';

type Props = {
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
};

export default function ReactionMatrixPlaceholder({
  variants,
  personas,
  reactions,
}: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Reaction Matrix
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
        {variants.length} variants × {personas.length} personas ·{' '}
        {reactions.length} reactions
      </p>
      <div className="mt-4 border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
          Task 3.3 — Reaction matrix component
        </p>
      </div>
    </div>
  );
}
