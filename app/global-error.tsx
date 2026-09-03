"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans">
        <main className="mx-auto mt-11 flex w-full max-w-site flex-col gap-4 px-2 pb-10">
          <h1 className="font-serif text-title text-primary">
            Something went wrong
          </h1>
          <p className="text-sm text-muted">
            Please refresh the page or try again later.
          </p>
        </main>
      </body>
    </html>
  );
}
