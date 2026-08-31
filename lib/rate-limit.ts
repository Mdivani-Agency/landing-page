export const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5;
export const CONTACT_RATE_LIMIT_WINDOW_SECONDS = 60;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

async function checkWithUpstash(
  restUrl: string,
  restToken: string,
  key: string,
): Promise<RateLimitResult> {
  const response = await fetch(`${restUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${restToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      // NX: only set the TTL when the key has none, i.e. on the first
      // request of the window, so the window does not keep sliding.
      ["EXPIRE", key, String(CONTACT_RATE_LIMIT_WINDOW_SECONDS), "NX"],
    ]),
  });

  if (!response.ok) {
    throw new Error(`rate limit store responded with ${response.status}`);
  }

  const results = (await response.json()) as Array<{
    result?: unknown;
    error?: string;
  }>;
  const incr = results[0];

  if (!incr || incr.error != null || typeof incr.result !== "number") {
    throw new Error("unexpected rate limit store response");
  }

  if (incr.result > CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: CONTACT_RATE_LIMIT_WINDOW_SECONDS,
    };
  }

  return { allowed: true };
}

type MemoryWindow = { count: number; resetAt: number };

const memoryWindows = new Map<string, MemoryWindow>();

function pruneMemoryWindows(now: number): void {
  for (const [key, window] of memoryWindows) {
    if (window.resetAt <= now) {
      memoryWindows.delete(key);
    }
  }
}

function checkWithMemory(key: string, now: number): RateLimitResult {
  const existing = memoryWindows.get(key);

  if (!existing || existing.resetAt <= now) {
    pruneMemoryWindows(now);
    memoryWindows.set(key, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_SECONDS * 1000,
    });
    return { allowed: true };
  }

  existing.count += 1;

  if (existing.count > CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000),
      ),
    };
  }

  return { allowed: true };
}

/**
 * Fixed-window rate limit per client IP for POST /api/contact.
 *
 * Uses Upstash Redis over REST when UPSTASH_REDIS_REST_URL /
 * UPSTASH_REDIS_REST_TOKEN are set (e.g. the Vercel Upstash integration), so
 * the counter holds across serverless isolates. Without those variables it
 * falls back to a best-effort in-memory window, which only protects within a
 * single long-lived isolate (fine for `yarn dev`, weak in production — set the
 * Upstash variables there).
 *
 * Store failures fail open: an outage must not block real inquiries.
 */
export async function checkContactRateLimit(
  ip: string,
  env: Record<string, string | undefined> = process.env,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  const key = `contact:rate:${ip}`;
  const restUrl = env.UPSTASH_REDIS_REST_URL?.trim();
  const restToken = env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (restUrl && restToken) {
    try {
      return await checkWithUpstash(restUrl, restToken, key);
    } catch (error) {
      console.error("contact: rate limit store failed", error);
      return { allowed: true };
    }
  }

  return checkWithMemory(key, now);
}
