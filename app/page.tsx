import BriefInput from '@/components/BriefInput';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 py-3">
        <span className="font-mono text-xs tracking-[0.2em]">
          <span aria-hidden="true">♪ </span>RESONANCE
        </span>
        <span className="border border-black px-3 py-1 font-mono text-[10px] tracking-[0.25em]">
          DEMO V0.1
        </span>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
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

        <svg
          aria-hidden="true"
          viewBox="0 0 320 100"
          className="pointer-events-none absolute right-0 top-12 hidden w-64 text-cyan-400 sm:block lg:right-6 lg:w-80"
          fill="none"
        >
          <path
            d="M 10 70 C 40 20, 90 90, 130 50 S 220 20, 250 60 C 270 80, 300 30, 315 55"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        <p className="mt-10 max-w-xl font-mono text-sm leading-relaxed text-neutral-700">
          Input a creative brief. Get comparative reactions across a synthetic
          listener panel. Identify which variants resonate with which segments
          before you ship.
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
    </main>
  );
}
