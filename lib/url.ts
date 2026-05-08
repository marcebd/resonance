// Resolves the absolute base URL for self-loopback fetches between API routes.
// Used by fire-and-forget pipeline triggers (brief → variants → personas → ...).

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}
