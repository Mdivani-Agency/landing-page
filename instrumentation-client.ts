import * as Sentry from "@sentry/nextjs";
import { isSentryRuntimeEnabled } from "@/lib/sentry-runtime";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isSentryRuntimeEnabled(),

  environment:
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV,

  tracesSampleRate: 0.1,

  enableLogs: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
