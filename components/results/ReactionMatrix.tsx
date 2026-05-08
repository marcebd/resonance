'use client';

import { useState, useMemo } from 'react';
import type { Variant, Persona, Reaction } from '@/lib/types';
import { aggregateScore, scoreToColor } from '@/lib/aggregate-score';
import ReactionDetail from './ReactionDetail';

type Props = {
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
};

type CellKey = `${string}|${string}`; // variantId|personaId

export default function ReactionMatrix({
  variants,
  personas,
  reactions,
}: Props) {
  const [selected, setSelected] = useState<CellKey | null>(null);

  const reactionMap = useMemo(() => {
    const map = new Map<CellKey, Reaction>();
    for (const r of reactions) {
      map.set(`${r.variantId}|${r.personaId}`, r);
    }
    return map;
  }, [reactions]);

  const variantAverages = useMemo(() => {
    return new Map(variants.map((v) => {
      const rs = reactions.filter((r) => r.variantId === v.id);
      const avg = rs.length === 0 ? 0 : rs.reduce((s, r) => s + aggregateScore(r.scores), 0) / rs.length;
      return [v.id, avg];
    }));
  }, [variants, reactions]);

  const sel = selected ? reactionMap.get(selected) : null;
  const selVariant = sel ? variants.find((v) => v.id === sel.variantId) : null;
  const selPersona = sel ? personas.find((p) => p.id === sel.personaId) : null;

  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
        Reaction Matrix
      </p>
      <p className="mt-1 mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
        {variants.length} variants × {personas.length} personas · {reactions.length} reactions · click a cell for detail
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                Variant
              </th>
              {personas.map((p) => (
                <th key={p.id} className="px-1 py-1 text-center font-mono text-[10px] tracking-[0.1em] text-neutral-700" title={p.name}>
                  <div className="max-w-[72px] truncate uppercase">{firstNameOf(p.name)}</div>
                  <div className="font-normal text-[9px] text-neutral-400">{p.demographics.age}</div>
                </th>
              ))}
              <th className="px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="sticky left-0 z-10 bg-white px-2 py-1">
                  <div className="font-mono text-sm font-bold text-neutral-900">
                    {v.label}
                    {v.title && (
                      <span className="ml-1 font-normal text-neutral-700">
                        — {v.title}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 max-w-[180px] truncate font-mono text-[10px] text-neutral-500">
                    {v.hook}
                  </div>
                </td>
                {personas.map((p) => {
                  const key: CellKey = `${v.id}|${p.id}`;
                  const reaction = reactionMap.get(key);
                  if (!reaction) {
                    return <td key={p.id} className="h-12 w-12 bg-neutral-100" title="No reaction" />;
                  }
                  const score = aggregateScore(reaction.scores);
                  const isSel = selected === key;
                  return (
                    <td key={p.id} className="p-0">
                      <button
                        onClick={() => setSelected(isSel ? null : key)}
                        className={`h-12 w-12 font-mono text-xs font-bold transition-all ${isSel ? 'ring-2 ring-cyan-400 ring-offset-1' : 'hover:ring-2 hover:ring-cyan-400 hover:ring-offset-1'}`}
                        style={{ backgroundColor: scoreToColor(score), color: score > 5.5 ? 'white' : '#171717' }}
                        aria-label={`${p.name} reacting to Variant ${v.label}: ${score.toFixed(1)}`}
                      >
                        {score.toFixed(1)}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-1 text-center">
                  <span className="font-mono text-xs font-bold text-neutral-700">
                    {(variantAverages.get(v.id) ?? 0).toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && selVariant && selPersona && (
        <ReactionDetail
          reaction={sel}
          variant={selVariant}
          persona={selPersona}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="mt-4 flex items-center justify-end gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
        <span>Low</span>
        <div className="flex h-2 w-32 overflow-hidden">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
            <div
              key={t}
              className="flex-1"
              style={{ backgroundColor: scoreToColor(1 + t * 9) }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}

function firstNameOf(name: string): string {
  return name.split(',')[0].trim();
}
