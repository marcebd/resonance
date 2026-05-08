type StageStatus = 'pending' | 'in_progress' | 'complete';

type Props = {
  label: string;
  status: StageStatus;
  detail?: string;
  multiline?: boolean;
};

export default function StageCard({
  label,
  status,
  detail,
  multiline = false,
}: Props) {
  const borderClass =
    status === 'in_progress' ? 'border-black' : 'border-neutral-300';
  const labelClass =
    status === 'pending' ? 'text-neutral-400' : 'text-black';

  return (
    <div className={`border ${borderClass} bg-white px-4 py-3 transition-colors`}>
      <div className="flex items-start gap-3">
        <StatusIcon status={status} />
        <div className="min-w-0 flex-1">
          <p
            className={`font-mono text-[11px] uppercase tracking-[0.2em] ${labelClass}`}
          >
            {label}
          </p>
          {detail && (status === 'in_progress' || status === 'complete') && (
            <p
              className={`mt-2 font-mono text-xs leading-relaxed text-neutral-700 ${
                multiline ? 'whitespace-pre-line' : ''
              }`}
            >
              {detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === 'complete') {
    return (
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-black">
        <svg
          className="h-2.5 w-2.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <svg
        className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-cyan-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className="mt-0.5 h-4 w-4 shrink-0 border border-neutral-300" />
  );
}
