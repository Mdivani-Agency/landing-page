import { describe, expect, it, vi } from "vitest";
import { createBlogApiClient } from "../http/client";

const token = "x".repeat(32);

describe("createBlogApiClient", () => {
  it("sends a bearer token and JSON body", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, post: { slug: "a-new-note" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const request = createBlogApiClient({
      baseUrl: "http://localhost:3000",
      token,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await request("POST", "/api/posts", { title: "A new note" });

    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:3000/api/posts",
      expect.objectContaining({
        method: "POST",
        redirect: "error",
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("maps a 400 into field errors", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          errors: { title: "Enter a title (3–160 characters)." },
        }),
        { status: 400 },
      ),
    );

    const request = createBlogApiClient({
      baseUrl: "http://localhost:3000",
      token,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await request("POST", "/api/posts", {});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.errors?.title).toBe("Enter a title (3–160 characters).");
    }
  });

  it("reports a configuration problem when the host is unreachable", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const request = createBlogApiClient({
      baseUrl: "http://localhost:3000",
      token,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await request("GET", "/api/posts");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("ECONNREFUSED");
      expect(result.message).toContain("BLOG_API_BASE_URL");
    }
  });
});
