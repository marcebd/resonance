import type { Brief, Run } from '@/lib/types';

type Props = {
  brief: Brief;
  run: Run;
};

export default function ResultsHeader({ brief, run }: Props) {
  const generatedAt = new Date(run.updatedAt);
  const ageMinutes = Math.floor(
    (Date.now() - generatedAt.getTime()) / (1000 * 60),
  );
  const ageLabel =
    ageMinutes < 1
      ? 'just now'
      : ageMinutes < 60
        ? `${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago`
        : `${Math.floor(ageMinutes / 60)} hour${ageMinutes >= 120 ? 's' : ''} ago`;

  const pills = [
    brief.parsedAttributes.genre,
    brief.parsedAttributes.tempo,
    ...brief.parsedAttributes.mood,
  ];

  return (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        Brief · generated {ageLabel}
      </p>
      <p className="border-l-2 border-cyan-400 pl-4 font-mono text-sm leading-relaxed text-neutral-800">
        {brief.rawText}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {pills.map((p) => (
          <span
            key={p}
            className="border border-neutral-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
