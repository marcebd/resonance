import BriefInput from '@/components/BriefInput';
import MouseTrail from '@/components/MouseTrail';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white text-black">
      <MouseTrail />

      <div className="relative">
        <header className="flex items-center justify-between border-b border-black px-6 py-3">
          <span className="font-mono text-xs tracking-[0.2em]">
            <span aria-hidden="true">♪ </span>RESONANCE
          </span>
          <span className="border border-black px-3 py-1 font-mono text-[10px] tracking-[0.25em]">
            DEMO V0.1
          </span>
        </header>

        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
          <span className="mb-6 block font-mono text-[10px] tracking-[0.3em] text-neutral-500">
            INTRO / 01
          </span>

          <h1 className="font-mono text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            AUDIENCE REACTION
            <br />
            PREDICTION
            <br />
            <span className="text-neutral-400">FOR AI&nbsp;MUSIC.</span>
          </h1>

          <p className="mt-10 max-w-xl font-mono text-sm leading-relaxed text-neutral-700">
            Input a creative brief. Get comparative reactions across a synthetic
            listener panel. Identify which variants resonate with which segments
            before you ship.
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Move your cursor — the page draws back.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <span className="mb-4 block font-mono text-[10px] tracking-[0.3em] text-neutral-500">
            BRIEF / 02
          </span>
          <BriefInput />
        </section>

        <footer className="border-t border-black px-6 py-4">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Built with Claude Code · Powered by Claude Sonnet 4.6 + Opus 4.7
          </p>
        </footer>
      </div>
    </main>
  );
}
