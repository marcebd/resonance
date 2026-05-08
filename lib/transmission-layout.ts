// Pure helpers for the transmission graph: layout, edge trimming, edge
// extraction, density labeling. Keeps TransmissionGraph.tsx focused on rendering.

import type { Reaction, Persona } from './types';

export type Edge = {
  fromId: string;
  toId: string;
  score: number;
  reasoning: string;
};

export function computeHexLayout(
  personas: Persona[],
  cx: number,
  cy: number,
  r: number,
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const n = personas.length;
  // Start at top (-90 degrees) and go clockwise
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    positions.set(personas[i].id, {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return positions;
}

// Trim an edge so it starts/ends at the node circle's perimeter, not center.
// Without this the arrowhead would be hidden inside the destination circle.
export function trimEdgeToNodeBoundary(
  from: { x: number; y: number },
  to: { x: number; y: number },
  radius: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: from.x + ux * radius,
    y1: from.y + uy * radius,
    x2: to.x - ux * radius,
    y2: to.y - uy * radius,
  };
}

export function extractEdgesForVariant(
  reactions: Reaction[],
  variantId: string,
): Edge[] {
  const edges: Edge[] = [];
  for (const r of reactions.filter((x) => x.variantId === variantId)) {
    for (const ts of r.transmissionScores) {
      edges.push({
        fromId: r.personaId,
        toId: ts.toPersonaId,
        score: ts.score,
        reasoning: ts.reasoning,
      });
    }
  }
  return edges;
}

export function densityDescription(visible: number, total: number): string {
  const pct = total === 0 ? 0 : visible / total;
  if (pct === 0)
    return 'No persona would recommend this to anyone — likely a personal-listening track, not a social-spread candidate.';
  if (pct < 0.15)
    return 'Sparse network — this variant lives in a few personal listening contexts but unlikely to spread socially.';
  if (pct < 0.35)
    return 'Moderate transmission likelihood — selective social spread within specific personas.';
  if (pct < 0.6)
    return 'Dense network — this variant has strong cross-panel recommendation appeal.';
  return 'Near-universal recommendation density — this variant is positioned for broad social spread.';
}

export function firstNameOf(name: string): string {
  return name.split(',')[0].trim();
}
