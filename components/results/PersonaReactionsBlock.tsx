// Used by the Deep Dive "Reactions" tab — one block per persona showing all
// of their reactions to all variants. Grouped by persona (not by variant) so
// the reader experiences each panel member as a coherent voice.

import type { Variant, Persona, Reaction } from '@/lib/types';
import { aggregateScore, scoreToColor } from '@/lib/aggregate-score';

type Props = {
  persona: Persona;
  variants: Variant[];
  reactions: Reaction[];
};

export default function PersonaReactionsBlock({
  persona,
  variants,
  reactions,
}: Props) {
  // Order reactions by variant label so they read A, B, C, D, E
  const orderedReactions = variants
    .map((v) => reactions.find((r) => r.variantId === v.id))
    .filter((r): r is Reaction => r !== undefined);

  if (orderedReactions.length === 0) return null;

  return (
    <div className="border border-neutral-300 bg-white">
      <div className="border-b border-neutral-300 bg-neutral-50 px-4 py-3">
        <p className="font-mono text-sm font-bold text-neutral-900">
          {persona.name}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
          {persona.demographics.occupation} ·{' '}
          {persona.musicProfile.favoriteGenres.slice(0, 3).join(', ')}
        </p>
      </div>

      <div className="divide-y divide-neutral-300">
        {orderedReactions.map((reaction) => {
          const variant = variants.find((v) => v.id === reaction.variantId);
          if (!variant) return null;
          const aggregate = aggregateScore(reaction.scores);

          return (
            <div key={reaction.id} className="px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-sm font-medium text-neutral-900">
                  Variant {variant.label}
                  {variant.title && (
                    <span className="ml-1 font-normal text-neutral-700">
                      — {variant.title}
                    </span>
                  )}
                </p>
                <ScoreChip score={aggregate} />
              </div>

              <p className="mb-3 whitespace-pre-line font-mono text-xs leading-relaxed text-neutral-700">
                {reaction.qualitativeReaction}
              </p>

              <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <ScoreInline label="Save" value={reaction.scores.saveWorthiness} />
                <ScoreInline label="Skip" value={reaction.scores.skipLikelihood} />
                <ScoreInline label="Share" value={reaction.scores.shareLikelihood} />
                <ScoreInline label="Repeat" value={reaction.scores.repeatListening} />
              </div>

              {reaction.flagsRaised.length > 0 && (
                <div className="mt-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                    Flags
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {reaction.flagsRaised.map((flag, i) => (
                      <li
                        key={i}
                        className="font-mono text-[11px] leading-relaxed text-neutral-600 before:mr-1 before:text-neutral-400 before:content-['—']"
                      >
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 font-mono text-xs font-bold"
      style={{
        backgroundColor: scoreToColor(score),
        color: score > 5.5 ? 'white' : '#171717',
      }}
    >
      {score.toFixed(1)}
    </span>
  );
}

function ScoreInline({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between bg-neutral-50 px-2 py-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
        {label}
      </span>
      <span className="font-mono text-xs font-bold text-neutral-900">{value}</span>
    </div>
  );
}
