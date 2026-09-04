import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRows,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";
import {
  BLOG_WRITE_MAX_BODY_BYTES,
  BLOG_WRITE_MIN_TOKEN_BYTES,
  BLOG_WRITE_RATE_LIMIT,
} from "@/lib/blog-write";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
  revalidatePath: vi.fn(),
  captureException: vi.fn(),
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(() => state.client);
});

vi.mock("next/cache", () => ({ revalidatePath: state.revalidatePath }));

vi.mock("@sentry/nextjs", () => ({
  captureException: state.captureException,
}));

async function importRoute() {
  return import("@/app/api/posts/route");
}

const WRITE_TOKEN = "x".repeat(BLOG_WRITE_MIN_TOKEN_BYTES);

const validBody = {
  title: "A new note",
  description: "Enough description for the card.",
  content: "## Hello\n\nThis is enough markdown content.",
};

function postRequest(body: unknown, headers: HeadersInit = {}) {
  return new Request("http://localhost/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function authorized(headers: HeadersInit = {}) {
  return { Authorization: `Bearer ${WRITE_TOKEN}`, ...headers };
}

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("BLOG_WRITE_TOKEN", WRITE_TOKEN);
    state.client = createFakeSupabase(fakeBlogRows);
    state.revalidatePath.mockClear();
    state.captureException.mockClear();
  });

  afterEach(async () => {
    const { resetWriteRateLimit } = await import("@/lib/blog-write");
    resetWriteRateLimit();
    vi.unstubAllEnvs();
  });

  it("rejects missing bearer tokens with 401", async () => {
    const { POST } = await importRoute();
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Unauthorized." },
    });
  });

  it("rejects a wrong bearer token with 401", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, {
        Authorization: `Bearer ${"y".repeat(BLOG_WRITE_MIN_TOKEN_BYTES)}`,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("accepts a lowercase Bearer scheme", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, { Authorization: `bearer ${WRITE_TOKEN}` }),
    );

    expect(response.status).toBe(200);
  });

  it("returns 500 when the write token is missing", async () => {
    vi.stubEnv("BLOG_WRITE_TOKEN", "");
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, { Authorization: `Bearer ${WRITE_TOKEN}` }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Write API is not configured." },
    });
  });

  it("returns 500 when the write token is shorter than 32 bytes", async () => {
    vi.stubEnv("BLOG_WRITE_TOKEN", "write-secret");
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, { Authorization: "Bearer write-secret" }),
    );

    expect(response.status).toBe(500);
  });

  it("rate-limits unauthenticated clients", async () => {
    const { POST } = await importRoute();

    for (let i = 0; i < BLOG_WRITE_RATE_LIMIT; i += 1) {
      const response = await POST(postRequest(validBody));
      expect(response.status).toBe(401);
    }

    const limited = await POST(postRequest(validBody));
    expect(limited.status).toBe(429);
  });

  it("creates a draft, generates a slug, and defaults to this site", async () => {
    const { POST } = await importRoute();
    const response = await POST(postRequest(validBody, authorized()));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.post.slug).toBe("a-new-note");
    expect(payload.post.status).toBe("draft");
    expect(payload.post.sites).toEqual(["agency"]);
  });

  it("publishes a post that getPostBySlug can read back", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest({ ...validBody, status: "published" }, authorized()),
    );

    expect(response.status).toBe(200);

    const { getPostBySlug } = await import("@/lib/blog");
    const stored = await getPostBySlug("a-new-note");
    expect(stored?.title).toBe("A new note");
    expect(stored?.status).toBe("published");
  });

  it("revalidates the listing, the post, and the feed after a write", async () => {
    const { POST } = await importRoute();
    await POST(
      postRequest({ ...validBody, status: "published" }, authorized()),
    );

    expect(state.revalidatePath).toHaveBeenCalledWith("/blog");
    expect(state.revalidatePath).toHaveBeenCalledWith("/blog/a-new-note");
    expect(state.revalidatePath).toHaveBeenCalledWith("/feed.xml");
    expect(state.revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
  });

  it("rejects a generated slug that already exists", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          title: "Idea to production AI",
          description: "Enough description for the card.",
          content: "## Hello\n\nThis is enough markdown content.",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { slug: "A post with that slug already exists." },
      slug: "idea-to-production-ai",
    });
  });

  it("returns 409 for a draft slug the public reads cannot see", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          // Slugifies onto the existing draft, which only the admin client
          // can see.
          title: "Draft internal notes",
          description: "Enough description for the card.",
          content: "## Hello\n\nThis is enough markdown content.",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(409);
  });

  it("updates an existing post when the slug is explicit", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          slug: "idea-to-production-ai",
          title: "Updated title",
          description: "Updated description for the card.",
          content: "## Updated\n\nThis is enough markdown content.",
          status: "published",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.post.title).toBe("Updated title");

    const { getPostBySlug } = await import("@/lib/blog");
    const stored = await getPostBySlug("idea-to-production-ai");
    expect(stored?.title).toBe("Updated title");
    expect(stored?.sites).toEqual(["agency"]);
  });

  it("keeps existing sites when an update omits them", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          slug: "talvio-only-post",
          title: "Still only for Talvio",
          description: "Updated description for the card.",
          content: "## Updated\n\nThis is enough markdown content.",
          status: "published",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.post.sites).toEqual(["talvio"]);

    const { getPostRecordBySlug } = await import("@/lib/blog");
    const stored = await getPostRecordBySlug("talvio-only-post");
    expect(stored?.sites).toEqual(["talvio"]);
    expect(stored?.title).toBe("Still only for Talvio");
  });

  it("rejects a Content-Type that only mentions JSON in a parameter", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, authorized({ "Content-Type": "text/plain; application/json" })),
    );

    expect(response.status).toBe(400);
  });

  it("rejects a same-origin cover path with a query string", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        { ...validBody, cover_image_url: "/assets/hero.jpg?v=1" },
        authorized(),
      ),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.errors.coverImageUrl).toBeDefined();
  });

  it("returns 500 and reports when persistence fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    state.client = createFakeSupabase([], { error: { message: "denied" } });

    const { POST } = await importRoute();
    const response = await POST(postRequest(validBody, authorized()));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Could not save the post." },
    });
    expect(state.captureException).toHaveBeenCalled();
    expect(state.revalidatePath).not.toHaveBeenCalled();

    error.mockRestore();
  });

  it("accepts a same-origin cover path that next/image can render", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          ...validBody,
          status: "published",
          cover_image_url: "/assets/logo.svg",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.post.cover_image_url).toBe("/assets/logo.svg");

    const { getPostBySlug } = await import("@/lib/blog");
    const stored = await getPostBySlug("a-new-note");
    expect(stored?.coverImageUrl).toBe("/assets/logo.svg");
  });

  it("rejects a remote cover URL", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        {
          ...validBody,
          cover_image_url: "https://cdn.example.com/hero.jpg",
        },
        authorized(),
      ),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.errors.coverImageUrl).toBeDefined();
  });

  it("rejects an oversized body before buffering the rest", async () => {
    const { POST } = await importRoute();
    const oversized = "a".repeat(BLOG_WRITE_MAX_BODY_BYTES + 1);
    const response = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        headers: authorized({ "Content-Type": "application/json" }),
        body: oversized,
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      errors: { form: "Request is too large." },
    });
  });

  it("rejects a declared Content-Length over the cap", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        validBody,
        authorized({
          "Content-Length": String(BLOG_WRITE_MAX_BODY_BYTES + 1),
        }),
      ),
    );

    expect(response.status).toBe(400);
  });

  it("returns field errors for invalid payloads", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        { title: "A", description: "short", content: "nope" },
        authorized(),
      ),
    );

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.errors.title).toBeDefined();
    expect(payload.errors.description).toBeDefined();
    expect(payload.errors.content).toBeDefined();
  });
});

describe("GET /api/posts", () => {
  it("returns 405", async () => {
    const { GET } = await importRoute();
    expect(GET().status).toBe(405);
  });
});
