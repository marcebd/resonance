'use client';

import { useState, useMemo } from 'react';
import type { Variant, Persona, Reaction } from '@/lib/types';
import {
  type Edge,
  computeHexLayout,
  trimEdgeToNodeBoundary,
  extractEdgesForVariant,
  densityDescription,
  firstNameOf,
} from '@/lib/transmission-layout';
import TransmissionEdgeDetail from './TransmissionEdgeDetail';

type Props = {
  variants: Variant[];
  personas: Persona[];
  reactions: Reaction[];
};

const DEFAULT_THRESHOLD = 6;
const SVG_SIZE = 480;
const NODE_RADIUS = 32;
const HEX_RADIUS = 160;

export default function TransmissionGraph({
  variants,
  personas,
  reactions,
}: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? '',
  );
  const [threshold, setThreshold] = useState<number>(DEFAULT_THRESHOLD);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);

  const nodePositions = useMemo(
    () => computeHexLayout(personas, SVG_SIZE / 2, SVG_SIZE / 2, HEX_RADIUS),
    [personas],
  );
  const allEdges = useMemo(
    () => extractEdgesForVariant(reactions, selectedVariantId),
    [reactions, selectedVariantId],
  );
  const visibleEdges = useMemo(
    () => allEdges.filter((e) => e.score >= threshold),
    [allEdges, threshold],
  );

  const totalPossible = personas.length * (personas.length - 1);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className="border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-700">Social Transmission</p>
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">Recommendation paths · hover an arrow for reasoning</p>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Variant</span>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVariantId(v.id)}
            className={`px-3 py-1 font-mono text-xs font-bold tracking-wider transition-colors ${
              selectedVariantId === v.id
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3 bg-neutral-50 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">Threshold</span>
        <input type="range" min={1} max={10} value={threshold}
          onChange={(e) => setThreshold(parseInt(e.target.value))}
          className="flex-1 accent-cyan-400" aria-label="Transmission score threshold" />
        <span className="min-w-[60px] text-right font-mono text-xs font-bold text-neutral-900">≥ {threshold} / 10</span>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="select-none">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,8 L8,4 z" fill="currentColor" />
            </marker>
          </defs>
          <g>
            {visibleEdges.map((edge, i) => {
              const from = nodePositions.get(edge.fromId);
              const to = nodePositions.get(edge.toId);
              if (!from || !to) return null;
              const t = trimEdgeToNodeBoundary(from, to, NODE_RADIUS);
              const isH = hoveredEdge?.fromId === edge.fromId && hoveredEdge?.toId === edge.toId;
              const stroke = isH ? '#22d3ee' : '#404040';
              return (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={stroke}
                  strokeWidth={isH ? 3 : 1 + (edge.score - 1) * 0.2}
                  strokeOpacity={isH ? 1 : 0.3 + ((edge.score - 1) / 9) * 0.7}
                  markerEnd="url(#arrowhead)" style={{ color: stroke }}
                  onMouseEnter={() => setHoveredEdge(edge)} onMouseLeave={() => setHoveredEdge(null)}
                  className="cursor-pointer transition-all" />
              );
            })}
          </g>
          <g>
            {personas.map((p) => {
              const pos = nodePositions.get(p.id);
              if (!pos) return null;
              return (
                <g key={p.id}>
                  <circle cx={pos.x} cy={pos.y} r={NODE_RADIUS} fill="white" stroke="#171717" strokeWidth={2} />
                  <text x={pos.x} y={pos.y - 2} textAnchor="middle" className="fill-neutral-900 font-mono text-[11px] font-bold">{firstNameOf(p.name)}</text>
                  <text x={pos.x} y={pos.y + 11} textAnchor="middle" className="fill-neutral-500 font-mono text-[9px]">{p.demographics.age}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {hoveredEdge && (
        <TransmissionEdgeDetail edge={hoveredEdge} personas={personas} />
      )}

      <div className="mt-3 bg-neutral-50 px-4 py-3">
        <p className="font-mono text-xs leading-relaxed text-neutral-700">
          <span className="font-bold">Variant {selectedVariant?.label}:</span>{' '}
          {visibleEdges.length} of {totalPossible} recommendation paths above
          threshold {threshold}. {densityDescription(visibleEdges.length, totalPossible)}
        </p>
      </div>
    </div>
  );
}
