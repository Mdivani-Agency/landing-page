import { describe, expect, it } from "vitest";
import { BLOG_WRITE_RATE_WINDOW_MS } from "../../../lib/blog-schema";
import { mapApiError, parseRetryAfterMs } from "../http/errors";

describe("mapApiError", () => {
  it("returns per-field 400 messages verbatim", () => {
    const mapped = mapApiError(400, {
      ok: false,
      errors: {
        title: "Enter a title (3–160 characters).",
        content: "Enter Markdown content (at least 20 characters).",
      },
    });

    expect(mapped.status).toBe(400);
    expect(mapped.errors).toEqual({
      title: "Enter a title (3–160 characters).",
      content: "Enter Markdown content (at least 20 characters).",
    });
    expect(mapped.message).toContain("title: Enter a title (3–160 characters).");
    expect(mapped.message).toContain(
      "content: Enter Markdown content (at least 20 characters).",
    );
  });

  it("points a 409 at blog_update_post and includes the slug", () => {
    const mapped = mapApiError(409, {
      ok: false,
      errors: { slug: "A post with that slug already exists." },
      slug: "a-new-note",
    });

    expect(mapped.status).toBe(409);
    expect(mapped.message).toContain("a-new-note");
    expect(mapped.message).toContain("blog_update_post");
    expect(mapped.message).toContain("different title");
  });

  it("surfaces a 429 retry window and does not invite a tight loop", () => {
    const mapped = mapApiError(
      429,
      { ok: false, errors: { form: "Too many requests. Try again in a minute." } },
      "45",
    );

    expect(mapped.status).toBe(429);
    expect(mapped.retryAfterMs).toBe(45_000);
    expect(mapped.message).toContain("45 seconds");
    expect(mapped.message).toContain("Do not retry in a tight loop");
  });

  it("defaults 429 backoff to the API window when Retry-After is missing", () => {
    const mapped = mapApiError(429, {});

    expect(mapped.retryAfterMs).toBe(BLOG_WRITE_RATE_WINDOW_MS);
  });

  it("treats 401 as a configuration problem", () => {
    const mapped = mapApiError(401, {
      ok: false,
      errors: { form: "Unauthorized." },
    });

    expect(mapped.status).toBe(401);
    expect(mapped.message).toContain("BLOG_WRITE_TOKEN");
    expect(mapped.message).toContain("configuration problem");
    expect(mapped.message).not.toMatch(/retry the write/i);
  });

  it("treats 500 as a configuration or persistence problem", () => {
    const mapped = mapApiError(500, {
      ok: false,
      errors: { form: "Write API is not configured." },
    });

    expect(mapped.status).toBe(500);
    expect(mapped.message).toBe("Write API is not configured.");
    expect(mapped.message).not.toMatch(/try again immediately/i);
  });
});

describe("parseRetryAfterMs", () => {
  it("reads integer seconds and HTTP dates", () => {
    expect(parseRetryAfterMs("12")).toBe(12_000);
    expect(parseRetryAfterMs("0")).toBe(0);

    const now = Date.parse("Wed, 21 Oct 2015 07:28:00 GMT");
    expect(
      parseRetryAfterMs("Wed, 21 Oct 2015 07:28:30 GMT", now),
    ).toBe(30_000);
  });

  it("returns undefined for missing or unparsable values", () => {
    expect(parseRetryAfterMs(null)).toBeUndefined();
    expect(parseRetryAfterMs("soon")).toBeUndefined();
  });
});
