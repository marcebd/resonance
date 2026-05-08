// Used by the Deep Dive "Personas" tab — full persona profile with traits.

import type { Persona } from '@/lib/types';

type Props = {
  persona: Persona;
};

export default function PersonaCard({ persona }: Props) {
  return (
    <div className="border border-neutral-300 bg-white px-4 py-3">
      <p className="font-mono text-sm font-bold text-neutral-900">
        {persona.name}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">
        {persona.demographics.occupation}
      </p>

      <div className="mt-3 space-y-3">
        <Field label="Genres" value={persona.musicProfile.favoriteGenres.join(' · ')} />
        <Field
          label="Listening contexts"
          value={persona.musicProfile.listeningContexts.join(' · ')}
        />
        <Field
          label="Discovery"
          value={persona.musicProfile.discoveryHabits.join(' · ')}
        />

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
            Traits
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {persona.personalityTraits.map((trait, i) => (
              <li
                key={i}
                className="font-mono text-xs leading-relaxed text-neutral-700 before:mr-1.5 before:text-neutral-400 before:content-['—']"
              >
                {trait}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs leading-relaxed text-neutral-700">
        {value}
      </p>
    </div>
  );
}
