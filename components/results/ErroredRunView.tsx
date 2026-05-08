// Shown when a run reached status='error' (synthesis failed, validation
// rejected, etc). Surfaces the error message in a sanitized way so the user
// knows the run was real but didn't complete.

import Link from 'next/link';

type Props = {
  message: string;
};

export default function ErroredRunView({ message }: Props) {
  // Truncate long messages to keep stack traces / internal details out of the UI.
  const safeMessage =
    message.length > 200 ? 'Generation failed. Try again with a fresh brief.' : message;

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
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-red-600">
            Generation failed
          </p>
          <h1 className="mb-3 font-mono text-2xl tracking-tight">
            This run hit an error.
          </h1>
          <p className="mb-8 max-w-lg font-mono text-sm leading-relaxed text-neutral-600">
            {safeMessage}
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
