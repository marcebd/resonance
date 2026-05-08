'use client';

import { useState } from 'react';
import type { Variant, Persona, Reaction } from '@/lib/types';

type Props = {
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
};

export default function DeepDiveSection({
  variants,
  personas,
  reactions,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral-300 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-neutral-50"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">
            Deep Dive
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
            {variants.length} variants · {personas.length} personas ·{' '}
            {reactions.length} reactions in full
          </p>
        </div>
        <svg
          className={`h-4 w-4 text-neutral-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="border-t border-neutral-300 px-5 py-4">
          <div className="border border-dashed border-neutral-300 bg-neutral-50 px-4 py-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed text-neutral-500">
              Deep dive content — variant cards, persona cards, full reactions
              <br />
              (Task 3.6 if time permits, otherwise Phase 4 polish)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
