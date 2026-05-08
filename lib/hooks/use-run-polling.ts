'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FullRun } from '../types';

const POLL_INTERVAL_MS = 2000;
const REDIRECT_DELAY_MS = 800;
const STUCK_TIMEOUT_MS = 6 * 60 * 1000; // 6 minutes — covers cold starts + worst-case pipeline

type PollingState = {
  runId: string | null;
  fullRun: FullRun | null;
  error: string | null;
  notFound: boolean;
};

export function useRunPolling(
  params: Promise<{ id: string }>,
): PollingState {
  const router = useRouter();
  const [runId, setRunId] = useState<string | null>(null);
  const [fullRun, setFullRun] = useState<FullRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then((p) => setRunId(p.id));
  }, [params]);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/run/${runId}`);
        if (cancelled) return;
        if (res.status === 404) return setNotFound(true);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const data: FullRun = await res.json();
        setFullRun(data);

        if (data.run.status === 'complete') {
          setTimeout(
            () => router.push(`/results/${runId}`),
            REDIRECT_DELAY_MS,
          );
          return;
        }
        if (data.run.status === 'error') {
          setError(data.run.errorMessage ?? 'Something went wrong.');
          return;
        }

        // Stuck-run detection: if updatedAt hasn't moved in 6+ minutes and
        // status isn't terminal, treat as stuck so the user isn't left waiting.
        const updatedAt = new Date(data.run.updatedAt).getTime();
        if (Date.now() - updatedAt > STUCK_TIMEOUT_MS) {
          setError(
            `Run appears stuck at "${data.run.status.replace('_', ' ')}". This usually resolves on retry.`,
          );
          return;
        }

        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        // Transient errors keep polling — don't surface a blip as an error
        timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [runId, router]);

  return { runId, fullRun, error, notFound };
}
