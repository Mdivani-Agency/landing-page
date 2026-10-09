import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BLOG_READ_DEFAULT_LIMIT,
  BLOG_READ_MAX_LIMIT,
  BLOG_READ_RATE_LIMIT,
  BLOG_READ_RATE_WINDOW_SECONDS,
} from "@/lib/blog-read";
import { BLOG_WRITE_MIN_TOKEN_BYTES } from "@/lib/blog-schema";
import {
  createFakeSupabase,
  fakeBlogRow,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
  configured: true,
  captureException: vi.fn(),
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(
    () => state.client,
    () => state.configured,
  );
});

vi.mock("@sentry/nextjs", () => ({
  captureException: state.captureException,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const READ_TOKEN = "r".repeat(BLOG_WRITE_MIN_TOKEN_BYTES);
const NEXT_TOKEN = "n".repeat(BLOG_WRITE_MIN_TOKEN_BYTES);
const WRITE_TOKEN = "w".repeat(BLOG_WRITE_MIN_TOKEN_BYTES);

const NOT_FOUND = { ok: false, errors: { slug: "Post not found." } };

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function listRequest(query = "", headers: HeadersInit = bearer(READ_TOKEN)) {
  return new Request(`http://localhost/api/talvio/posts${query}`, { headers });
}

function slugRequest(slug: string, headers: HeadersInit = bearer(READ_TOKEN)) {
  return new Request(`http://localhost/api/talvio/posts/${slug}`, { headers });
}

function slugContext(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

async function importListRoute() {
  return import("@/app/api/talvio/posts/route");
}

async function importSlugRoute() {
  return import("@/app/api/talvio/posts/[slug]/route");
}

function catalog() {
  return [
    fakeBlogRow({
      slug: "published-talvio",
      title: "Published on Talvio",
      description: "A Talvio essay that is live.",
      content: "## Talvio body",
      cover_image_url: "/covers/talvio.png",
      tags: ["product"],
      sites: ["talvio"],
      status: "published",
      featured: true,
      published_at: "2026-09-03T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "older-talvio",
      title: "Older Talvio note",
      sites: ["talvio"],
      published_at: "2026-09-01T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "shared-note",
      title: "Shared note",
      sites: ["agency", "talvio"],
      tags: ["engineering"],
      published_at: "2026-09-02T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "shared-agency-tag",
      title: "Tagged only agency",
      sites: ["agency", "talvio"],
      tags: ["agency"],
      published_at: "2026-09-04T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "agency-only",
      title: "Agency only",
      sites: ["agency"],
      published_at: "2026-09-04T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "kept-timestamp",
      title: "Unpublished but dated",
      sites: ["talvio"],
      status: "draft",
      published_at: "2026-09-04T00:00:00.000Z",
    }),
    fakeBlogRow({
      slug: "future-talvio",
      title: "Not yet",
      sites: ["talvio"],
      published_at: "2099-01-01T00:00:00.000Z",
    }),
  ];
}

describe("Talvio read API", () => {
  beforeEach(() => {
    vi.resetModules();
    state.client = createFakeSupabase(catalog());
    state.configured = true;
    state.captureException.mockClear();
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO", READ_TOKEN);
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO_NEXT", "");
    vi.stubEnv("BLOG_WRITE_TOKEN", WRITE_TOKEN);
    vi.stubEnv("KV_REST_API_URL", "");
    vi.stubEnv("KV_REST_API_TOKEN", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  afterEach(async () => {
    const { resetWriteRateLimit } = await import("@/lib/blog-write");
    resetWriteRateLimit();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a published Talvio post and a shared post, without content on the list", async () => {
    const { GET } = await importListRoute();
    const response = await GET(listRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("access-control-allow-origin")).toBeNull();

    const payload = await response.json();
    expect(payload).toMatchObject({
      ok: true,
      limit: BLOG_READ_DEFAULT_LIMIT,
      offset: 0,
      total: 3,
    });
    expect(payload.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "published-talvio",
      "shared-note",
      "older-talvio",
    ]);
    expect(payload.posts[0]).toEqual({
      slug: "published-talvio",
      title: "Published on Talvio",
      description: "A Talvio essay that is live.",
      cover_image_url: "/covers/talvio.png",
      tags: ["product"],
      sites: ["talvio"],
      status: "published",
      featured: true,
      published_at: "2026-09-03T00:00:00.000Z",
      created_at: "2026-08-01T09:00:00.000Z",
      updated_at: "2026-08-01T09:00:00.000Z",
    });
    expect(payload.posts[0]).not.toHaveProperty("content");
  });

  it("returns the body for an eligible slug", async () => {
    const { GET } = await importSlugRoute();
    const response = await GET(
      slugRequest("published-talvio"),
      slugContext("published-talvio"),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.post.content).toBe("## Talvio body");
    expect(payload.post.slug).toBe("published-talvio");
  });

  it("uses one 404 body for drafts, other sites, future posts, and unknown slugs", async () => {
    const { GET } = await importSlugRoute();
    const hidden = [
      "agency-only",
      "kept-timestamp",
      "future-talvio",
      "shared-agency-tag",
      "missing-slug",
    ];
    const bodies = [];

    for (const slug of hidden) {
      const response = await GET(slugRequest(slug), slugContext(slug));
      expect(response.status).toBe(404);
      bodies.push(await response.json());
    }

    expect(new Set(bodies.map((body) => JSON.stringify(body)))).toEqual(
      new Set([JSON.stringify(NOT_FOUND)]),
    );
  });

  it("rejects an invalid slug with 400", async () => {
    const { GET } = await importSlugRoute();
    const response = await GET(slugRequest("Nope"), slugContext("Nope"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { slug: "Use a lowercase slug with letters, numbers, and hyphens." },
    });
  });

  it("paginates under the max_rows cap and reports the full total", async () => {
    const { GET } = await importListRoute();
    const first = await GET(listRequest("?limit=2&offset=0"));
    const second = await GET(listRequest("?limit=2&offset=2"));
    const past = await GET(listRequest("?limit=2&offset=3"));

    const firstBody = await first.json();
    const secondBody = await second.json();
    const pastBody = await past.json();

    expect(firstBody.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "published-talvio",
      "shared-note",
    ]);
    expect(firstBody.total).toBe(3);
    expect(secondBody.posts.map((post: { slug: string }) => post.slug)).toEqual([
      "older-talvio",
    ]);
    expect(secondBody.total).toBe(3);
    expect(pastBody.posts).toEqual([]);
    expect(pastBody.total).toBe(3);

    const seen = [
      ...firstBody.posts,
      ...secondBody.posts,
      ...pastBody.posts,
    ].map((post: { slug: string }) => post.slug);
    expect(seen).toEqual(["published-talvio", "shared-note", "older-talvio"]);
  });

  it("rejects a limit above the maximum", async () => {
    const { GET } = await importListRoute();
    const response = await GET(listRequest(`?limit=${BLOG_READ_MAX_LIMIT + 1}`));

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.errors.limit).toMatch(/1 to 100/);
  });

  it("rejects the write token and a missing credential", async () => {
    const { GET } = await importListRoute();
    const wrong = await GET(listRequest("", bearer(WRITE_TOKEN)));
    const missing = await GET(listRequest("", {}));

    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    await expect(wrong.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Unauthorized." },
    });
    await expect(missing.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Unauthorized." },
    });
  });

  it("accepts the next rotation token and still rejects it on the write API", async () => {
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO_NEXT", NEXT_TOKEN);
    const { GET } = await importListRoute();
    const read = await GET(listRequest("", bearer(NEXT_TOKEN)));
    expect(read.status).toBe(200);

    const { POST } = await import("@/app/api/posts/route");
    const write = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...bearer(NEXT_TOKEN),
        },
        body: JSON.stringify({
          title: "A new note",
          description: "Enough description for the card.",
          content: "## Hello\n\nThis is enough markdown content.",
        }),
      }),
    );

    expect(write.status).toBe(401);
  });

  it("returns 500 when the read token is missing or the next token is too short", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO", "");
    const { GET } = await importListRoute();
    const missing = await GET(listRequest());

    expect(missing.status).toBe(500);
    await expect(missing.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Read API is not configured." },
    });
    expect(error.mock.calls.flat().join(" ")).toContain("BLOG_READ_TOKEN_TALVIO");
    expect(error.mock.calls.flat().join(" ")).not.toContain(READ_TOKEN);

    error.mockClear();
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO", READ_TOKEN);
    vi.stubEnv("BLOG_READ_TOKEN_TALVIO_NEXT", "too-short");
    const shortNext = await GET(listRequest());

    expect(shortNext.status).toBe(500);
    expect(error.mock.calls.flat().join(" ")).toContain("BLOG_READ_TOKEN_TALVIO_NEXT");
    expect(error.mock.calls.flat().join(" ")).not.toContain("too-short");
  });

  it("hides query failures from the response and the log", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    state.client = createFakeSupabase([], {
      error: { message: "secret sql from blog_posts" },
    });
    const { GET } = await importListRoute();
    const response = await GET(listRequest());
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({
      ok: false,
      errors: { form: "Could not load posts." },
    });
    expect(JSON.stringify(payload)).not.toContain("secret");
    expect(error.mock.calls.flat().join(" ")).toBe("talvio posts: read failed");
    expect(state.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: "talvio posts: read failed" }),
      expect.objectContaining({ tags: { area: "blog-read-api" } }),
    );
  });

  it("rate-limits each read credential in memory and leaves the write route open", async () => {
    const { GET } = await importListRoute();

    for (let i = 0; i < BLOG_READ_RATE_LIMIT; i += 1) {
      expect((await GET(listRequest())).status).toBe(200);
    }

    const blocked = await GET(listRequest());
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    await expect(blocked.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Too many requests. Try again in a minute." },
    });

    vi.stubEnv("BLOG_READ_TOKEN_TALVIO_NEXT", NEXT_TOKEN);
    const rotated = await GET(listRequest("", bearer(NEXT_TOKEN)));
    expect(rotated.status).toBe(200);

    const { POST } = await import("@/app/api/posts/route");
    const write = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...bearer(WRITE_TOKEN),
        },
        body: JSON.stringify({
          title: "A new note",
          description: "Enough description for the card.",
          content: "## Hello\n\nThis is enough markdown content.",
        }),
      }),
    );

    expect(write.status).toBe(200);
  });

  it("counts an accepted credential in Upstash and not the client IP", async () => {
    const digest = createHash("sha256").update(READ_TOKEN, "utf8").digest("hex");
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([{ result: BLOG_READ_RATE_LIMIT + 1 }, { result: 0 }]),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://kv.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "kv-token");
    vi.stubEnv("KV_REST_API_URL", "https://kv.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "kv-token");

    const { GET } = await importListRoute();
    const response = await GET(
      listRequest("", {
        ...bearer(READ_TOKEN),
        "x-forwarded-for": "203.0.113.7",
      }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe(
      String(BLOG_READ_RATE_WINDOW_SECONDS),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const recorded = JSON.stringify(init);
    expect(recorded).toContain(`blog-read:talvio:${digest}`);
    expect(recorded).not.toContain(READ_TOKEN);
    expect(recorded).not.toContain("203.0.113.7");
    expect(init.headers).toMatchObject({ Authorization: "Bearer kv-token" });
  });
});
