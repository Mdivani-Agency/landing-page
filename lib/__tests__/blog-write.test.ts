import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRows,
  type FakeSupabase,
} from "@/test-utils/supabase-mock";

const state = vi.hoisted(() => ({
  client: undefined as unknown as FakeSupabase,
}));

vi.mock("@/lib/supabase", async () => {
  const { supabaseModuleMock } = await import("@/test-utils/supabase-mock");
  return supabaseModuleMock(() => state.client);
});

import { getPostBySlug, listPublishedPosts } from "@/lib/blog";
import {
  BLOG_WRITE_MIN_TOKEN_BYTES,
  isSameOriginCoverPath,
  mergeBlogWriteWithExisting,
  readWriteToken,
  resetWriteRateLimit,
  slugifyTitle,
  upsertBlogPost,
  validateBlogWritePayload,
} from "@/lib/blog-write";

const validPayload = {
  title: "A new note",
  description: "Enough description for the card.",
  content: "## Hello\n\nThis is enough markdown content.",
};

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

afterEach(() => {
  resetWriteRateLimit();
});

describe("slugifyTitle", () => {
  it("builds a lowercase hyphenated slug", () => {
    expect(slugifyTitle("From Idea to a Production AI Product!")).toBe(
      "from-idea-to-a-production-ai-product",
    );
  });

  it("strips a trailing hyphen left by the 80-character slice", () => {
    expect(slugifyTitle(`${"x".repeat(79)} more words`)).toBe("x".repeat(79));
  });
});

describe("isSameOriginCoverPath", () => {
  it("accepts site-relative paths and rejects remote or protocol-relative URLs", () => {
    expect(isSameOriginCoverPath("/assets/logo.svg")).toBe(true);
    expect(isSameOriginCoverPath("https://cdn.example.com/hero.jpg")).toBe(
      false,
    );
    expect(isSameOriginCoverPath("//cdn.example.com/hero.jpg")).toBe(false);
    expect(isSameOriginCoverPath("/../secret")).toBe(false);
    expect(isSameOriginCoverPath("/assets/hero.jpg?v=1")).toBe(false);
    expect(isSameOriginCoverPath("/assets/hero.jpg#crop")).toBe(false);
  });
});

describe("readWriteToken", () => {
  it("rejects missing and short tokens", () => {
    expect(readWriteToken({})).toBeUndefined();
    expect(readWriteToken({ BLOG_WRITE_TOKEN: "short" })).toBeUndefined();
    expect(
      readWriteToken({
        BLOG_WRITE_TOKEN: "x".repeat(BLOG_WRITE_MIN_TOKEN_BYTES),
      }),
    ).toBe("x".repeat(BLOG_WRITE_MIN_TOKEN_BYTES));
  });
});

describe("validateBlogWritePayload", () => {
  it("defaults status to draft, sites to this site, and generates a slug", () => {
    const result = validateBlogWritePayload(validPayload);

    expect(result).toEqual({
      ok: true,
      slugProvided: false,
      sitesProvided: false,
      tagsProvided: false,
      coverProvided: false,
      statusProvided: false,
      featuredProvided: false,
      value: {
        slug: "a-new-note",
        title: "A new note",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        tags: [],
        sites: ["agency"],
        coverImageUrl: null,
        status: "draft",
        featured: false,
      },
    });
  });

  it("accepts an explicit site list and drops duplicates", () => {
    const result = validateBlogWritePayload({
      ...validPayload,
      sites: ["agency", "talvio", "agency"],
    });

    expect(result).toMatchObject({
      ok: true,
      sitesProvided: true,
      value: { sites: ["agency", "talvio"] },
    });
  });

  it("rejects an unknown site, a non-array, and an empty list", () => {
    for (const sites of [["nope"], "agency", []]) {
      const result = validateBlogWritePayload({ ...validPayload, sites });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.sites).toBeDefined();
      }
    }
  });

  it("rejects a remote cover URL and accepts a same-origin path", () => {
    const remote = validateBlogWritePayload({
      ...validPayload,
      cover_image_url: "https://cdn.example.com/hero.jpg",
    });
    expect(remote.ok).toBe(false);

    const local = validateBlogWritePayload({
      ...validPayload,
      cover_image_url: "/assets/logo.svg",
    });
    expect(local).toMatchObject({
      ok: true,
      value: { coverImageUrl: "/assets/logo.svg" },
    });

    const withQuery = validateBlogWritePayload({
      ...validPayload,
      cover_image_url: "/assets/hero.jpg?v=1",
    });
    expect(withQuery.ok).toBe(false);
  });

  it("marks tags, cover, status, and featured as provided only when the keys are present", () => {
    const omitted = validateBlogWritePayload(validPayload);
    expect(omitted.ok).toBe(true);
    if (omitted.ok) {
      expect(omitted.tagsProvided).toBe(false);
      expect(omitted.coverProvided).toBe(false);
      expect(omitted.statusProvided).toBe(false);
      expect(omitted.featuredProvided).toBe(false);
      expect(omitted.value.featured).toBe(false);
    }

    const explicit = validateBlogWritePayload({
      ...validPayload,
      tags: [],
      cover_image_url: "",
      status: "draft",
      featured: true,
    });
    expect(explicit.ok).toBe(true);
    if (explicit.ok) {
      expect(explicit.tagsProvided).toBe(true);
      expect(explicit.coverProvided).toBe(true);
      expect(explicit.statusProvided).toBe(true);
      expect(explicit.featuredProvided).toBe(true);
      expect(explicit.value.tags).toEqual([]);
      expect(explicit.value.coverImageUrl).toBeNull();
      expect(explicit.value.featured).toBe(true);
    }
  });

  it("rejects a non-boolean featured value", () => {
    const result = validateBlogWritePayload({
      ...validPayload,
      featured: "true",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.featured).toBeDefined();
    }
  });

  it("marks an explicit slug as provided", () => {
    const result = validateBlogWritePayload({
      ...validPayload,
      slug: "custom-slug",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.slugProvided).toBe(true);
      expect(result.value.slug).toBe("custom-slug");
    }
  });

  it("rejects a reserved listing slug", () => {
    const explicit = validateBlogWritePayload({
      ...validPayload,
      slug: "page",
    });
    const generated = validateBlogWritePayload({
      ...validPayload,
      title: "Page",
    });

    expect(explicit.ok).toBe(false);
    if (!explicit.ok) {
      expect(explicit.errors.slug).toBe("That slug is reserved.");
    }

    expect(generated.ok).toBe(false);
    if (!generated.ok) {
      expect(generated.errors.slug).toBe("That slug is reserved.");
    }
  });

  it("rejects a bad slug and an unknown status", () => {
    const result = validateBlogWritePayload({
      ...validPayload,
      slug: "Nope!",
      status: "live",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.slug).toBeDefined();
      expect(result.errors.status).toBeDefined();
    }
  });
});

describe("upsertBlogPost", () => {
  it("inserts a draft that stays off the public listing", async () => {
    const created = await upsertBlogPost(
      {
        slug: "new-draft",
        title: "New draft",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        tags: ["AI"],
        sites: ["agency"],
        coverImageUrl: null,
        status: "draft",
        featured: false,
      },
      null,
    );

    expect(created.status).toBe("draft");
    await expect(getPostBySlug("new-draft")).resolves.toBeNull();

    const slugs = (await listPublishedPosts()).map((post) => post.slug);
    expect(slugs).not.toContain("new-draft");
  });

  it("keeps the original published date when updating a published post", async () => {
    const existing = {
      slug: "idea-to-production-ai",
      title: "Updated title",
      description: "Updated description for the card.",
      content: "## Updated\n\nThis is enough markdown content.",
      tags: ["AI"],
      sites: ["agency" as const],
      coverImageUrl: null,
      status: "published" as const,
      featured: true,
      publishedAt: new Date("2026-08-01T09:00:00.000Z"),
      createdAt: new Date("2026-08-01T09:00:00.000Z"),
      updatedAt: new Date("2026-08-01T09:00:00.000Z"),
    };

    const updated = await upsertBlogPost(
      {
        slug: "idea-to-production-ai",
        title: "Updated title",
        description: "Updated description for the card.",
        content: "## Updated\n\nThis is enough markdown content.",
        tags: ["AI"],
        sites: ["agency"],
        coverImageUrl: null,
        status: "published",
        featured: true,
      },
      existing,
      new Date("2026-08-30T12:00:00.000Z"),
    );

    expect(updated.title).toBe("Updated title");
    expect(updated.featured).toBe(true);
    expect(updated.publishedAt?.toISOString()).toBe("2026-08-01T09:00:00.000Z");
    expect(updated.updatedAt.toISOString()).toBe("2026-08-30T12:00:00.000Z");
  });

  it("writes a post targeted at the other site that this site will not list", async () => {
    await upsertBlogPost(
      {
        slug: "talvio-launch",
        title: "Talvio launch",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        tags: [],
        sites: ["talvio"],
        coverImageUrl: null,
        status: "published",
        featured: false,
      },
      null,
    );

    const slugs = (await listPublishedPosts()).map((post) => post.slug);
    expect(slugs).not.toContain("talvio-launch");
  });
});

describe("mergeBlogWriteWithExisting", () => {
  it("keeps stored featured when an update omits it", () => {
    const existing = {
      slug: "idea-to-production-ai",
      title: "From idea to a production AI product",
      description: "Enough description for the card.",
      content: "## Start with a job\n\nThe model is not the product.",
      coverImageUrl: null,
      tags: ["AI"],
      sites: ["agency" as const],
      status: "published" as const,
      featured: true,
      publishedAt: new Date("2026-08-01T09:00:00.000Z"),
      createdAt: new Date("2026-08-01T09:00:00.000Z"),
      updatedAt: new Date("2026-08-01T09:00:00.000Z"),
    };

    const merged = mergeBlogWriteWithExisting(
      {
        slug: "idea-to-production-ai",
        title: "Typo fix only",
        description: "Updated description for the card.",
        content: "## Updated\n\nThis is enough markdown content.",
        tags: [],
        sites: ["agency"],
        coverImageUrl: null,
        status: "draft",
        featured: false,
      },
      existing,
      {
        sitesProvided: false,
        tagsProvided: false,
        coverProvided: false,
        statusProvided: false,
        featuredProvided: false,
      },
    );

    expect(merged.featured).toBe(true);
    expect(merged.status).toBe("published");
    expect(merged.tags).toEqual(["AI"]);
  });

  it("unpins when featured is sent as false", () => {
    const existing = {
      slug: "idea-to-production-ai",
      title: "From idea to a production AI product",
      description: "Enough description for the card.",
      content: "## Start with a job\n\nThe model is not the product.",
      coverImageUrl: null,
      tags: ["AI"],
      sites: ["agency" as const],
      status: "published" as const,
      featured: true,
      publishedAt: new Date("2026-08-01T09:00:00.000Z"),
      createdAt: new Date("2026-08-01T09:00:00.000Z"),
      updatedAt: new Date("2026-08-01T09:00:00.000Z"),
    };

    const merged = mergeBlogWriteWithExisting(
      {
        slug: "idea-to-production-ai",
        title: existing.title,
        description: existing.description,
        content: existing.content,
        tags: existing.tags,
        sites: existing.sites,
        coverImageUrl: null,
        status: "published",
        featured: false,
      },
      existing,
      {
        sitesProvided: true,
        tagsProvided: true,
        coverProvided: true,
        statusProvided: true,
        featuredProvided: true,
      },
    );

    expect(merged.featured).toBe(false);
  });
});
