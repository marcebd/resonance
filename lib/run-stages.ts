// Stage configuration for the live generation view (/run/[id]).
// Pure data + small status helper, kept out of the page component.

import type { FullRun, RunStatus } from './types';

export type StageConfig = {
  label: string;
  status: RunStatus;
  multiline?: boolean;
  detail: (r: FullRun | null) => string | undefined;
};

export const STAGES: StageConfig[] = [
  {
    label: 'Parse brief',
    status: 'parsing',
    detail: (r) =>
      r?.brief
        ? `${r.brief.parsedAttributes.genre} · ${r.brief.parsedAttributes.tempo} · ${r.brief.parsedAttributes.mood.join(', ')}`
        : undefined,
  },
  {
    label: 'Generate 5 track variants',
    status: 'generating_variants',
    multiline: true,
    detail: (r) =>
      r && r.variants.length > 0
        ? r.variants
            .map((v) =>
              v.title
                ? `${v.label} — ${v.title}: ${v.hook}`
                : `${v.label}: ${v.hook}`,
            )
            .join('\n')
        : undefined,
  },
  {
    label: 'Build 6-persona listener panel',
    status: 'generating_personas',
    detail: (r) =>
      r && r.personas.length > 0
        ? r.personas.map((p) => p.name).join(' · ')
        : undefined,
  },
  {
    label: 'Run 30 reactions in parallel',
    status: 'reacting',
    detail: (r) =>
      r && r.reactions.length > 0
        ? `${r.reactions.length} / 30 reactions complete`
        : r?.run.status === 'reacting'
          ? '0 / 30 reactions complete'
          : undefined,
  },
  {
    label: 'Synthesize recommendations',
    status: 'synthesizing',
    detail: (r) =>
      r?.run.status === 'complete' ? 'Redirecting to results…' : undefined,
  },
];

const STAGE_ORDER: RunStatus[] = [
  'parsing',
  'generating_variants',
  'generating_personas',
  'reacting',
  'synthesizing',
];

export function getStageStatus(
  current: RunStatus | undefined,
  stage: RunStatus,
): 'pending' | 'in_progress' | 'complete' {
  if (!current || current === 'error') return 'pending';
  if (current === 'complete') return 'complete';
  const ci = STAGE_ORDER.indexOf(current);
  const si = STAGE_ORDER.indexOf(stage);
  if (si < ci) return 'complete';
  if (si === ci) return 'in_progress';
  return 'pending';
}
