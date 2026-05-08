// Inline expansion panel for the selected matrix cell. Stays visible
// below the matrix so the user keeps spatial context while reading.

import type { Variant, Persona, Reaction } from '@/lib/types';
import { intensityFromScore } from '@/lib/aggregate-score';

type Props = {
  reaction: Reaction;
  variant: Variant;
  persona: Persona;
  onClose: () => void;
};

export default function ReactionDetail({
  reaction,
  variant,
  persona,
  onClose,
}: Props) {
  return (
    <div className="mt-5 border border-neutral-300 bg-neutral-50 px-5 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-neutral-900">
            {persona.name} → Variant {variant.label}
            {variant.title && (
              <span className="ml-1 font-normal text-neutral-700">
                — {variant.title}
              </span>
            )}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            {persona.demographics.occupation}
          </p>
        </div>
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

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ScoreDimension label="Save" score={reaction.scores.saveWorthiness} />
        <ScoreDimension label="Skip" score={reaction.scores.skipLikelihood} />
        <ScoreDimension label="Share" score={reaction.scores.shareLikelihood} />
        <ScoreDimension label="Repeat" score={reaction.scores.repeatListening} />
      </div>

      <p className="mb-4 whitespace-pre-line font-mono text-sm leading-relaxed text-neutral-800">
        {reaction.qualitativeReaction}
      </p>

      {reaction.flagsRaised.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Flags
          </p>
          <ul className="space-y-1.5">
            {reaction.flagsRaised.map((flag, i) => (
              <li
                key={i}
                className="font-mono text-xs leading-relaxed text-neutral-700 before:mr-1 before:text-neutral-400 before:content-['—']"
              >
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreDimension({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const intensity = intensityFromScore(score);
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
        {label}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="font-mono text-sm font-bold text-neutral-900">
          {score}
        </span>
        <div className="h-1 flex-1 overflow-hidden bg-neutral-200">
          <div
            className="h-full bg-neutral-900 transition-all"
            style={{ width: `${intensity * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
