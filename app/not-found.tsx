// Custom 404 — replaces Next.js's default for stale shared URLs and typo'd run IDs.

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="flex items-center justify-between border-b border-black px-6 py-3">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.2em] hover:text-neutral-500"
        >
          <span aria-hidden="true">♪ </span>RESONANCE
        </Link>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-2xl flex-col items-center justify-center px-6 py-16">
        <div className="text-center">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Not found
          </p>
          <h1 className="mb-3 font-mono text-2xl tracking-tight">
            This run has expired or doesn&apos;t exist.
          </h1>
          <p className="mb-8 font-mono text-sm leading-relaxed text-neutral-600">
            Runs are stored for 30 days. Start a new one to test a brief.
          </p>
          <Link
            href="/"
            className="inline-block border border-black bg-black px-6 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-white hover:bg-neutral-800"
          >
            Start a new run →
          </Link>
        </div>
      </div>
    </main>
  );
}
