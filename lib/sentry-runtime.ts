/**
 * Sentry should only ingest events from Vercel preview and production.
 * Local `yarn dev` / `yarn start` and GitLab check jobs have a DSN in
 * `.env.local` or CI, and must not create issues from those runs.
 */
export function isSentryRuntimeEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const vercelEnv = env.NEXT_PUBLIC_VERCEL_ENV ?? env.VERCEL_ENV;
  return vercelEnv === "production" || vercelEnv === "preview";
}
