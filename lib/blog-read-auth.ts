import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {
  BLOG_READ_RATE_LIMIT,
  BLOG_READ_RATE_WINDOW_SECONDS,
  readTalvioReadTokens,
  talvioReadTokenProblems,
} from "@/lib/blog-read";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_FAILURE = "talvio posts: rate limit store failed";

export function blogReadJson(
  status: number,
  body: unknown,
  headers?: HeadersInit,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      ...headers,
    },
  });
}

function digestToken(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Compare against both rotation slots. A missing next token still burns a
 * compare against a dummy digest so the number of configured tokens is not
 * revealed by how long the check takes.
 */
function tokenAccepted(provided: string, expected: readonly string[]): boolean {
  const digest = digestToken(provided);
  const first = digestToken(expected[0] ?? "\0");
  const second = digestToken(expected[1] ?? "\0");
  const matchesFirst = timingSafeEqual(digest, first);
  const matchesSecond = timingSafeEqual(digest, second);

  return (
    (expected.length > 0 && matchesFirst) ||
    (expected.length > 1 && matchesSecond)
  );
}

function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? null;
}

function credentialKey(token: string): string {
  return `blog-read:talvio:${digestToken(token).toString("hex")}`;
}

/**
 * Gate for `/api/talvio/posts`. The write token is not accepted.
 *
 * The limit runs only after the credential matches, and the bucket is the
 * hash of that credential — not the client IP, and not the write-route
 * limiter. The raw token is never the store key.
 */
export async function authorizeTalvioRead(
  request: Request,
): Promise<Response | null> {
  const tokens = readTalvioReadTokens();

  if (!tokens) {
    console.error(
      "talvio posts: missing env",
      talvioReadTokenProblems().join(", "),
    );
    return blogReadJson(500, {
      ok: false,
      errors: { form: "Read API is not configured." },
    });
  }

  const expected = tokens.next ? [tokens.current, tokens.next] : [tokens.current];
  const provided = bearerToken(request.headers.get("authorization"));

  if (!provided || !tokenAccepted(provided, expected)) {
    return blogReadJson(401, { ok: false, errors: { form: "Unauthorized." } });
  }

  const rate = await checkRateLimit(credentialKey(provided), {
    maxRequests: BLOG_READ_RATE_LIMIT,
    windowSeconds: BLOG_READ_RATE_WINDOW_SECONDS,
    failureLabel: RATE_LIMIT_FAILURE,
  });

  if (!rate.allowed) {
    return blogReadJson(
      429,
      { ok: false, errors: { form: "Too many requests. Try again in a minute." } },
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  return null;
}

/**
 * Persistence and configuration failures. The response and the log stay
 * free of the bearer token, stack, and query text. A missing Supabase env
 * is the exception: that log line is the variable names only.
 */
export function talvioReadFailed(
  error: unknown,
  form = "Could not load posts.",
) {
  const message = error instanceof Error ? error.message : "";

  if (message.startsWith("blog: missing env ")) {
    console.error(message);
  } else {
    console.error("talvio posts: read failed");
  }

  Sentry.captureException(new Error("talvio posts: read failed"), {
    tags: { area: "blog-read-api" },
  });

  return blogReadJson(500, { ok: false, errors: { form } });
}
