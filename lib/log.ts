// Logging helper that's quiet in production browser consoles.
// Server-side logs still appear in Vercel logs regardless.

export function logServerError(message: string, err: unknown): void {
  if (typeof window === 'undefined') {
    // Server: log normally — Vercel captures these.
    console.error(message, err);
  } else if (process.env.NODE_ENV !== 'production') {
    // Client in dev: log normally for debugging.
    console.error(message, err);
  }
  // Client in prod: silent — no DevTools spam for users.
}
