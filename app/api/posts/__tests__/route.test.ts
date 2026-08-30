import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

async function importRoute() {
  return import("@/app/api/posts/route");
}

const validBody = {
  title: "A new note",
  description: "Enough description for the card.",
  content: "## Hello\n\nThis is enough markdown content.",
};

function postRequest(
  body: unknown,
  headers: HeadersInit = {},
) {
  return new Request("http://localhost/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.resetModules();
    revalidatePath.mockReset();
    vi.stubEnv("BLOG_WRITE_TOKEN", "write-secret");
  });

  afterEach(async () => {
    const { resetBlogStore } = await import("@/lib/blog");
    const { resetWriteRateLimit } = await import("@/lib/blog-write");
    resetBlogStore();
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
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("creates a draft, generates a slug, and revalidates paths", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(validBody, { Authorization: "Bearer write-secret" }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.post.slug).toBe("a-new-note");
    expect(payload.post.status).toBe("draft");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/a-new-note");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePath).toHaveBeenCalledWith("/feed.xml");
  });

  it("returns field errors for invalid payloads", async () => {
    const { POST } = await importRoute();
    const response = await POST(
      postRequest(
        { title: "A", description: "short", content: "nope" },
        { Authorization: "Bearer write-secret" },
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
