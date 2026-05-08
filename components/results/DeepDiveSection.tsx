'use client';

import { useState } from 'react';
import type { Variant, Persona, Reaction } from '@/lib/types';
import VariantCard from './VariantCard';
import PersonaCard from './PersonaCard';
import PersonaReactionsBlock from './PersonaReactionsBlock';

type Props = {
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
};

type Tab = 'variants' | 'personas' | 'reactions';

export default function DeepDiveSection({
  variants,
  personas,
  reactions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('variants');

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
          className={`h-4 w-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
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
        <div className="border-t border-neutral-300">
          <div className="flex border-b border-neutral-300 px-5">
            <TabButton
              active={tab === 'variants'}
              onClick={() => setTab('variants')}
              label="Variants"
              count={variants.length}
            />
            <TabButton
              active={tab === 'personas'}
              onClick={() => setTab('personas')}
              label="Personas"
              count={personas.length}
            />
            <TabButton
              active={tab === 'reactions'}
              onClick={() => setTab('reactions')}
              label="Reactions"
              count={reactions.length}
            />
          </div>

          <div className="px-5 py-5">
            {tab === 'variants' && (
              <div className="space-y-4">
                {variants.map((v) => (
                  <VariantCard key={v.id} variant={v} />
                ))}
              </div>
            )}
            {tab === 'personas' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {personas.map((p) => (
                  <PersonaCard key={p.id} persona={p} />
                ))}
              </div>
            )}
            {tab === 'reactions' && (
              <div className="space-y-6">
                {personas.map((p) => (
                  <PersonaReactionsBlock
                    key={p.id}
                    persona={p}
                    variants={variants}
                    reactions={reactions.filter((r) => r.personaId === p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${active ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
    >
      {label}
      <span
        className={`ml-2 ${active ? 'text-neutral-500' : 'text-neutral-400'}`}
      >
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
      )}
    </button>
  );
}
