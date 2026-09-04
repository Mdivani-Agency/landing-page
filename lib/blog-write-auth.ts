import { createHash, timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/nextjs";
import {
  consumeWriteRateLimit,
  readWriteToken,
} from "@/lib/blog-write";
import { getClientIp } from "@/lib/rate-limit";

export function blogWriteJson(status: number, body: unknown) {
  return Response.json(body, { status });
}

export function unauthorizedBlogWrite() {
  return blogWriteJson(401, { ok: false, errors: { form: "Unauthorized." } });
}

function digestToken(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function tokensEqual(provided: string, expected: string): boolean {
  return timingSafeEqual(digestToken(provided), digestToken(expected));
}

function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? null;
}

/**
 * Shared gate for every `/api/posts` method. Rate-limits first so a missing
 * token cannot be probed faster than the write path allows, then compares
 * SHA-256 digests so secret length is not leaked by timing.
 *
 * Returns an error response, or `null` when the request may proceed.
 */
export function authorizeBlogWrite(request: Request): Response | null {
  if (!consumeWriteRateLimit(getClientIp(request.headers))) {
    return blogWriteJson(429, {
      ok: false,
      errors: { form: "Too many requests. Try again in a minute." },
    });
  }

  const expected = readWriteToken();

  if (!expected) {
    console.error("posts: missing env", "BLOG_WRITE_TOKEN");
    return blogWriteJson(500, {
      ok: false,
      errors: { form: "Write API is not configured." },
    });
  }

  const provided = bearerToken(request.headers.get("authorization"));

  if (!provided || !tokensEqual(provided, expected)) {
    return unauthorizedBlogWrite();
  }

  return null;
}

export function blogWritePersistenceFailed(
  error: unknown,
  form = "Could not save the post.",
) {
  const exception =
    error instanceof Error ? error : new Error("blog write failed");

  console.error("posts: persistence failed", exception);
  Sentry.captureException(exception, { tags: { area: "blog-write" } });

  return blogWriteJson(500, {
    ok: false,
    errors: { form },
  });
}
