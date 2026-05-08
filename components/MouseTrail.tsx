'use client';

import { useEffect, useRef } from 'react';

type Props = {
  color?: string;
  lineWidth?: number;
  minDistance?: number;
};

export default function MouseTrail({
  color = 'rgba(34, 211, 238, 0.4)', // cyan-400 @ 40%
  lineWidth = 14,
  minDistance = 4,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function configure() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    configure();

    let last: { x: number; y: number } | null = null;

    function onMove(e: MouseEvent) {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        if (Math.hypot(dx, dy) < minDistance) return;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      last = { x, y };
    }

    function onResize() {
      configure();
      last = null; // canvas was cleared by resize; lift the pen
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, [color, lineWidth, minDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
