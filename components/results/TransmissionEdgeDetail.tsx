// Hover detail for a transmission graph edge. Shows the recommending persona,
// the receiving persona, the score, and the per-edge reasoning Claude wrote.

import type { Persona } from '@/lib/types';
import { type Edge, firstNameOf } from '@/lib/transmission-layout';

type Props = {
  edge: Edge;
  personas: Persona[];
};

export default function TransmissionEdgeDetail({ edge, personas }: Props) {
  const from = personas.find((p) => p.id === edge.fromId);
  const to = personas.find((p) => p.id === edge.toId);
  if (!from || !to) return null;
  return (
    <div className="mt-3 border border-cyan-400 bg-cyan-50 px-4 py-3">
      <p className="font-mono text-xs">
        <span className="font-bold text-neutral-900">
          {firstNameOf(from.name)}
        </span>
        <span className="text-neutral-500"> → </span>
        <span className="font-bold text-neutral-900">
          {firstNameOf(to.name)}
        </span>
        <span className="ml-2 inline-flex items-center bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">
          {edge.score} / 10
        </span>
      </p>
      <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-700">
        {edge.reasoning}
      </p>
    </div>
  );
}
