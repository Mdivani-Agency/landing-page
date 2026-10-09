import "server-only";

import { BLOG_WRITE_MIN_TOKEN_BYTES } from "@/lib/blog-schema";

export const BLOG_READ_MIN_TOKEN_BYTES = BLOG_WRITE_MIN_TOKEN_BYTES;

/** Page size when `limit` is omitted. Below `BLOG_READ_MAX_LIMIT`. */
export const BLOG_READ_DEFAULT_LIMIT = 20;

/**
 * Largest page the route will ask PostgREST for.
 *
 * Supabase `max_rows` defaults to 1000. Staying under that cap means a page
 * is never silently truncated, and `total` can prove the client saw every
 * eligible row.
 */
export const BLOG_READ_MAX_LIMIT = 100;

export const BLOG_READ_MAX_OFFSET = 100_000;

/** Accepted reads per credential per window. Separate from the write gate. */
export const BLOG_READ_RATE_LIMIT = 120;

export const BLOG_READ_RATE_WINDOW_SECONDS = 60;

const CURRENT_ENV = "BLOG_READ_TOKEN_TALVIO";
const NEXT_ENV = "BLOG_READ_TOKEN_TALVIO_NEXT";

export type TalvioReadTokens = {
  current: string;
  next?: string;
};

function longEnough(value: string): boolean {
  return Buffer.byteLength(value, "utf8") >= BLOG_READ_MIN_TOKEN_BYTES;
}

/**
 * Current token, plus an optional next token so rotation does not drop
 * in-flight readers. A present-but-too-short next token fails the whole
 * config — ignoring it would hide a bad rotation.
 */
export function readTalvioReadTokens(
  env: Record<string, string | undefined> = process.env,
): TalvioReadTokens | undefined {
  if (talvioReadTokenProblems(env).length > 0) {
    return undefined;
  }

  const current = env[CURRENT_ENV]?.trim() ?? "";
  const next = env[NEXT_ENV]?.trim() ?? "";

  return next ? { current, next } : { current };
}

/** Env var names that are missing or shorter than 32 bytes. Never values. */
export function talvioReadTokenProblems(
  env: Record<string, string | undefined> = process.env,
): string[] {
  const names: string[] = [];
  const current = env[CURRENT_ENV]?.trim() ?? "";
  const next = env[NEXT_ENV]?.trim() ?? "";

  if (!current || !longEnough(current)) {
    names.push(CURRENT_ENV);
  }

  if (next && !longEnough(next)) {
    names.push(NEXT_ENV);
  }

  return names;
}

export type TalvioPostsQuery =
  | { ok: true; limit: number; offset: number }
  | { ok: false; errors: { limit?: string; offset?: string } };

function parseBoundedInteger(
  raw: string | null,
  bounds: { min: number; max: number; fallback: number },
): number | null {
  if (raw == null) {
    return bounds.fallback;
  }

  if (!/^(0|[1-9]\d*)$/.test(raw)) {
    return null;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value) || value < bounds.min || value > bounds.max) {
    return null;
  }

  return value;
}

export function parseTalvioPostsQuery(url: URL): TalvioPostsQuery {
  const limit = parseBoundedInteger(url.searchParams.get("limit"), {
    min: 1,
    max: BLOG_READ_MAX_LIMIT,
    fallback: BLOG_READ_DEFAULT_LIMIT,
  });
  const offset = parseBoundedInteger(url.searchParams.get("offset"), {
    min: 0,
    max: BLOG_READ_MAX_OFFSET,
    fallback: 0,
  });
  const errors: { limit?: string; offset?: string } = {};

  if (limit == null) {
    errors.limit = `Limit must be an integer from 1 to ${BLOG_READ_MAX_LIMIT}.`;
  }

  if (offset == null) {
    errors.offset = `Offset must be an integer from 0 to ${BLOG_READ_MAX_OFFSET}.`;
  }

  if (limit == null || offset == null) {
    return { ok: false, errors };
  }

  return { ok: true, limit, offset };
}
