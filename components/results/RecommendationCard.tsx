// The headline output. Black 1px border vs neutral-300 elsewhere
// is the single visual signal that this is the most important thing.

type Props = {
  recommendation: string;
};

export default function RecommendationCard({ recommendation }: Props) {
  return (
    <div className="border border-black bg-white px-6 py-5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-black">
        Recommendation
      </p>
      <p className="whitespace-pre-line font-mono text-base leading-relaxed text-neutral-900">
        {recommendation}
      </p>
    </div>
  );
}
