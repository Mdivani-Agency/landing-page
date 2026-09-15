import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRows,
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

import {
  BLOG_LIST_PAGE_SIZE,
  blogListPageNumbers,
  blogListPath,
  blogPaginationItems,
  formatPostDate,
  getPostBySlug,
  getPostRecordBySlug,
  listPostRecords,
  listPublishedPosts,
  listPublishedSlugs,
  paginateBlogListing,
  parseBlogListPageParam,
  partitionPublishedPosts,
  upsertPostRecord,
} from "@/lib/blog";

beforeEach(() => {
  // One store behind both clients, so a write is visible to the next read.
  state.client = createFakeSupabase(fakeBlogRows);
  state.configured = true;
  state.captureException.mockClear();
});

describe("listPublishedPosts", () => {
  it("returns published posts for this site, newest first", async () => {
    const slugs = (await listPublishedPosts()).map((post) => post.slug);

    expect(slugs).toEqual([
      "shipping-the-first-slice",
      "idea-to-production-ai",
    ]);
  });

  it("hides drafts and posts belonging only to another site", async () => {
    const slugs = (await listPublishedPosts()).map((post) => post.slug);

    expect(slugs).not.toContain("draft-internal-notes");
    expect(slugs).not.toContain("talvio-only-post");
  });

  it("maps snake_case columns onto the camelCase post shape", async () => {
    const [, post] = await listPublishedPosts();

    expect(post).toMatchObject({
      slug: "idea-to-production-ai",
      coverImageUrl: null,
      sites: ["agency"],
      tags: ["AI", "product", "greenfield"],
      featured: true,
    });
    expect(post.publishedAt).toBeInstanceOf(Date);
    expect(post.createdAt).toBeInstanceOf(Date);
  });

  it("degrades to an empty list when credentials are missing", async () => {
    // next build runs in CI without Supabase variables; an empty blog has to
    // be the outcome there rather than a failed build.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    state.configured = false;

    await expect(listPublishedPosts()).resolves.toEqual([]);
    expect(warn).toHaveBeenCalled();
    expect(state.captureException).toHaveBeenCalled();

    warn.mockRestore();
  });

  it("degrades to an empty list when the query errors", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    state.client = createFakeSupabase([], { error: { message: "boom" } });

    await expect(listPublishedPosts()).resolves.toEqual([]);
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });

  it("reports a read failure so the empty result is not silent", async () => {
    // The fallback hides the failure from every page, and ISR can cache that
    // empty listing for an hour, so the report is the only signal.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    state.client = createFakeSupabase([], { error: { message: "boom" } });

    await listPublishedPosts();

    expect(state.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: { area: "blog-read" } }),
    );

    error.mockRestore();
  });
});

describe("partitionPublishedPosts", () => {
  it("puts featured published posts first and keeps newest-first within each group", async () => {
    const posts = await listPublishedPosts();
    const { featured, rest } = partitionPublishedPosts(posts);

    expect(featured.map((post) => post.slug)).toEqual([
      "idea-to-production-ai",
    ]);
    expect(rest.map((post) => post.slug)).toEqual(["shipping-the-first-slice"]);
  });

  it("ignores a featured flag on a draft because public reads never return it", async () => {
    const posts = await listPublishedPosts();
    expect(posts.map((post) => post.slug)).not.toContain("draft-internal-notes");
    expect(partitionPublishedPosts(posts).featured.every((post) => post.status === "published")).toBe(
      true,
    );
  });
});

describe("blog listing pagination", () => {
  it("documents the public listing page size", () => {
    expect(BLOG_LIST_PAGE_SIZE).toBe(6);
  });

  it("uses /blog for page 1 and /blog/page/N after that", () => {
    expect(blogListPath(1)).toBe("/blog");
    expect(blogListPath(2)).toBe("/blog/page/2");
  });

  it("accepts only positive integer page params", () => {
    expect(parseBlogListPageParam("2")).toBe(2);
    expect(parseBlogListPageParam("1")).toBe(1);
    expect(parseBlogListPageParam("0")).toBeNull();
    expect(parseBlogListPageParam("02")).toBeNull();
    expect(parseBlogListPageParam("page")).toBeNull();
    expect(parseBlogListPageParam("-1")).toBeNull();
  });

  it("paginates only the chronological grid and keeps featured out of the slice", async () => {
    const extras = Array.from({ length: 8 }, (_, index) => ({
      slug: `extra-${index + 1}`,
      title: `Extra ${index + 1}`,
      description: "Enough description for the card.",
      content: "## Hello\n\nThis is enough markdown content.",
      coverImageUrl: null,
      tags: [],
      sites: ["agency" as const],
      status: "published" as const,
      featured: false,
      publishedAt: new Date(`2026-07-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`),
      createdAt: new Date("2026-07-01T09:00:00.000Z"),
      updatedAt: new Date("2026-07-01T09:00:00.000Z"),
    }));

    const posts = [...(await listPublishedPosts()), ...extras];
    const first = paginateBlogListing(posts, 1);
    const second = paginateBlogListing(posts, 2);

    expect(first.featured.map((post) => post.slug)).toEqual([
      "idea-to-production-ai",
    ]);
    expect(first.posts).toHaveLength(6);
    expect(first.posts.map((post) => post.slug)).not.toContain(
      "idea-to-production-ai",
    );
    expect(first.pageCount).toBe(2);
    expect(first.inRange).toBe(true);

    expect(second.posts).toHaveLength(3);
    expect(second.featured.map((post) => post.slug)).toEqual([
      "idea-to-production-ai",
    ]);
    expect(second.inRange).toBe(true);
    expect(paginateBlogListing(posts, 3).inRange).toBe(false);
  });

  it("lists only page numbers after page 1 for static paths and the sitemap", async () => {
    expect(blogListPageNumbers(await listPublishedPosts())).toEqual([]);

    const extras = Array.from({ length: 6 }, (_, index) => ({
      slug: `extra-${index + 1}`,
      title: `Extra ${index + 1}`,
      description: "Enough description for the card.",
      content: "## Hello\n\nThis is enough markdown content.",
      coverImageUrl: null,
      tags: [],
      sites: ["agency" as const],
      status: "published" as const,
      featured: false,
      publishedAt: new Date(`2026-07-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`),
      createdAt: new Date("2026-07-01T09:00:00.000Z"),
      updatedAt: new Date("2026-07-01T09:00:00.000Z"),
    }));

    expect(blogListPageNumbers([...(await listPublishedPosts()), ...extras])).toEqual([
      2,
    ]);
  });

  it("collapses long page ranges around the current page", () => {
    expect(blogPaginationItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(blogPaginationItems(1, 20)).toEqual([1, 2, "ellipsis", 20]);
    expect(blogPaginationItems(10, 20)).toEqual([
      1,
      "ellipsis",
      9,
      10,
      11,
      "ellipsis",
      20,
    ]);
    expect(blogPaginationItems(20, 20)).toEqual([1, "ellipsis", 19, 20]);
  });
});

describe("getPostBySlug", () => {
  it("returns a published post", async () => {
    const post = await getPostBySlug("idea-to-production-ai");
    expect(post?.title).toBe("From idea to a production AI product");
  });

  it("hides drafts, other sites, and unknown slugs", async () => {
    await expect(getPostBySlug("draft-internal-notes")).resolves.toBeNull();
    await expect(getPostBySlug("talvio-only-post")).resolves.toBeNull();
    await expect(getPostBySlug("missing")).resolves.toBeNull();
  });

  it("reports a read failure rather than 404-ing silently", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    state.client = createFakeSupabase([], { error: { message: "boom" } });

    await expect(getPostBySlug("idea-to-production-ai")).resolves.toBeNull();
    expect(state.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ tags: { area: "blog-read" } }),
    );

    error.mockRestore();
  });
});

describe("listPublishedSlugs", () => {
  it("exposes published slugs for static generation", async () => {
    await expect(listPublishedSlugs()).resolves.toEqual([
      "shipping-the-first-slice",
      "idea-to-production-ai",
    ]);
  });
});

describe("getPostRecordBySlug", () => {
  it("finds a draft that the public reads hide", async () => {
    // The write path needs this: a draft holding the slug must produce a 409
    // rather than a unique-constraint failure on insert.
    const record = await getPostRecordBySlug("draft-internal-notes");
    expect(record?.status).toBe("draft");
  });

  it("finds a post belonging to another site", async () => {
    const record = await getPostRecordBySlug("talvio-only-post");
    expect(record?.sites).toEqual(["talvio"]);
  });

  it("returns null for an unknown slug", async () => {
    await expect(getPostRecordBySlug("missing")).resolves.toBeNull();
  });
});

describe("listPostRecords", () => {
  it("includes drafts and other-site posts", async () => {
    const slugs = (await listPostRecords()).map((post) => post.slug);

    expect(slugs).toEqual(
      expect.arrayContaining([
        "idea-to-production-ai",
        "draft-internal-notes",
        "talvio-only-post",
      ]),
    );
  });

  it("throws when the admin query fails", async () => {
    state.client = createFakeSupabase([], { error: { message: "denied" } });

    await expect(listPostRecords()).rejects.toThrow(/denied/);
  });

  it("pushes status and site filters into the query", async () => {
    const drafts = await listPostRecords({ status: "draft" });
    expect(drafts.map((post) => post.slug)).toEqual(["draft-internal-notes"]);
    expect(drafts[0]).not.toHaveProperty("content");

    const talvio = await listPostRecords({ site: "talvio" });
    expect(talvio.map((post) => post.slug)).toEqual(["talvio-only-post"]);
  });
});

describe("upsertPostRecord", () => {
  it("inserts a post the public reads can then see", async () => {
    await upsertPostRecord({
      slug: "brand-new",
      title: "Brand new",
      description: "Enough description for the card.",
      content: "## Hello\n\nThis is enough markdown content.",
      coverImageUrl: null,
      tags: ["AI"],
      sites: ["agency"],
      status: "published",
      featured: false,
      publishedAt: "2026-09-01T09:00:00.000Z",
      createdAt: "2026-09-01T09:00:00.000Z",
      updatedAt: "2026-09-01T09:00:00.000Z",
    });

    const post = await getPostBySlug("brand-new");
    expect(post?.title).toBe("Brand new");
  });

  it("throws when the admin query fails", async () => {
    state.client = createFakeSupabase([], { error: { message: "denied" } });

    await expect(
      upsertPostRecord({
        slug: "brand-new",
        title: "Brand new",
        description: "Enough description for the card.",
        content: "## Hello\n\nThis is enough markdown content.",
        coverImageUrl: null,
        tags: [],
        sites: ["agency"],
        status: "draft",
        featured: false,
        publishedAt: null,
        createdAt: "2026-09-01T09:00:00.000Z",
        updatedAt: "2026-09-01T09:00:00.000Z",
      }),
    ).rejects.toThrow(/denied/);
  });
});

describe("formatPostDate", () => {
  it("formats dates in day-month-year English", () => {
    expect(formatPostDate(new Date("2026-08-01T00:00:00.000Z"))).toBe(
      "1 August 2026",
    );
  });
});
