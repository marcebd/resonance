'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MIN_LENGTH = 20;
const MAX_LENGTH = 2000;

const PLACEHOLDER = `Describe the track concept you want to test...

Example: "Upbeat indie pop, female vocal, summer road-trip energy. Around 3 minutes, hook-driven. Targeting 18-30 demographic for playlist placement and TikTok seeding."`;

export default function BriefInput() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const charCount = text.length;
  const isValid = charCount >= MIN_LENGTH && charCount <= MAX_LENGTH;

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server returned ${res.status}`);
      }

      const { runId } = await res.json();
      router.push(`/run/${runId}`);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Try again.');
      setSubmitting(false);
    }
  }

  const counterTone =
    charCount > MAX_LENGTH
      ? 'text-red-600'
      : charCount < MIN_LENGTH
        ? 'text-neutral-400'
        : 'text-neutral-600';

  return (
    <div className="w-full space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitting}
        placeholder={PLACEHOLDER}
        rows={10}
        className="w-full border border-black bg-white px-4 py-3 font-mono text-sm leading-relaxed text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:bg-neutral-50 disabled:text-neutral-500"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`font-mono text-[10px] tracking-[0.2em] uppercase ${counterTone}`}
        >
          {charCount} / {MAX_LENGTH} chars
          {charCount < MIN_LENGTH &&
            ` · ${MIN_LENGTH - charCount} more to submit`}
        </span>

        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="border border-black bg-black px-6 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Spinner /> Generating
            </span>
          ) : (
            'Generate →'
          )}
        </button>
      </div>

      {error && (
        <div className="border border-red-500 bg-red-50 px-4 py-3 font-mono text-xs text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-3 w-3 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
