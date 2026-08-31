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
 * REST credentials from either the official Upstash names or the pair the
 * Vercel KV / Upstash integration writes (`KV_REST_API_*`). The TCP URLs
 * (`KV_URL`, `REDIS_URL`) and the read-only token are ignored.
 */
export function readRateLimitStoreEnv(
  env: Record<string, string | undefined> = process.env,
): { restUrl: string; restToken: string } | null {
  const restUrl = (
    env.UPSTASH_REDIS_REST_URL ??
    env.KV_REST_API_URL ??
    ""
  ).trim();
  const restToken = (
    env.UPSTASH_REDIS_REST_TOKEN ??
    env.KV_REST_API_TOKEN ??
    ""
  ).trim();

  if (!restUrl || !restToken) {
    return null;
  }

  return { restUrl, restToken };
}

/**
 * Fixed-window rate limit per client IP for POST /api/contact.
 *
 * Uses Upstash Redis over REST when either UPSTASH_REDIS_REST_URL/TOKEN or
 * the Vercel KV aliases (KV_REST_API_URL/TOKEN) are set, so the counter
 * holds across serverless isolates. Without those variables it falls back
 * to a best-effort in-memory window, which only protects within a single
 * long-lived isolate (fine for `yarn dev`, weak in production).
 *
 * Store failures fail open: an outage must not block real inquiries.
 */
export async function checkContactRateLimit(
  ip: string,
  env: Record<string, string | undefined> = process.env,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  const key = `contact:rate:${ip}`;
  const store = readRateLimitStoreEnv(env);

  if (store) {
    try {
      return await checkWithUpstash(store.restUrl, store.restToken, key);
    } catch (error) {
      console.error("contact: rate limit store failed", error);
      return { allowed: true };
    }
  }

  return checkWithMemory(key, now);
}
