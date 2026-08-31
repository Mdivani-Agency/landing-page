import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONTACT_RATE_LIMIT_MAX_REQUESTS,
  CONTACT_RATE_LIMIT_WINDOW_SECONDS,
} from "@/lib/rate-limit";

async function importRateLimit() {
  return import("@/lib/rate-limit");
}

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", async () => {
    const { getClientIp } = await importRateLimit();

    expect(
      getClientIp(
        new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
      ),
    ).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then unknown", async () => {
    const { getClientIp } = await importRateLimit();

    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9",
    );
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("checkContactRateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("blocks after the per-window limit and reports a retry delay", async () => {
    const { checkContactRateLimit } = await importRateLimit();
    const now = 1_000_000;

    for (let i = 0; i < CONTACT_RATE_LIMIT_MAX_REQUESTS; i += 1) {
      await expect(checkContactRateLimit("1.2.3.4", {}, now)).resolves.toEqual(
        { allowed: true },
      );
    }

    const blocked = await checkContactRateLimit("1.2.3.4", {}, now + 1_000);

    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(
        CONTACT_RATE_LIMIT_WINDOW_SECONDS,
      );
    }
  });

  it("tracks each client independently and resets after the window", async () => {
    const { checkContactRateLimit } = await importRateLimit();
    const now = 1_000_000;

    for (let i = 0; i <= CONTACT_RATE_LIMIT_MAX_REQUESTS; i += 1) {
      await checkContactRateLimit("1.2.3.4", {}, now);
    }

    await expect(checkContactRateLimit("5.6.7.8", {}, now)).resolves.toEqual({
      allowed: true,
    });

    const afterWindow = now + (CONTACT_RATE_LIMIT_WINDOW_SECONDS + 1) * 1000;
    await expect(
      checkContactRateLimit("1.2.3.4", {}, afterWindow),
    ).resolves.toEqual({ allowed: true });
  });
});

describe("checkContactRateLimit (Upstash REST)", () => {
  const env = {
    UPSTASH_REDIS_REST_URL: "https://fake.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "token",
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("allows requests under the limit and blocks over it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json([{ result: 1 }, { result: 1 }]),
      )
      .mockResolvedValueOnce(
        Response.json([
          { result: CONTACT_RATE_LIMIT_MAX_REQUESTS + 1 },
          { result: 0 },
        ]),
      );
    vi.stubGlobal("fetch", fetchMock);
    const { checkContactRateLimit } = await importRateLimit();

    await expect(checkContactRateLimit("1.2.3.4", env)).resolves.toEqual({
      allowed: true,
    });
    await expect(checkContactRateLimit("1.2.3.4", env)).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: CONTACT_RATE_LIMIT_WINDOW_SECONDS,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://fake.upstash.io/pipeline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
  });

  it("fails open when the store is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { checkContactRateLimit } = await importRateLimit();

    await expect(checkContactRateLimit("1.2.3.4", env)).resolves.toEqual({
      allowed: true,
    });
    expect(error).toHaveBeenCalledWith(
      "contact: rate limit store failed",
      expect.any(Error),
    );
  });
});
