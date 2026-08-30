import { describe, expect, it } from "vitest";
import {
  formatPostDate,
  getPostBySlug,
  listPublishedPosts,
  listPublishedSlugs,
} from "@/lib/blog";

describe("blog data layer", () => {
  it("lists only published posts, newest first", async () => {
    const posts = await listPublishedPosts();
    const slugs = posts.map((post) => post.slug);

    expect(slugs).toContain("idea-to-production-ai");
    expect(slugs).not.toContain("draft-internal-notes");

    const times = posts.map((post) => post.publishedAt?.getTime() ?? 0);
    expect(times).toEqual([...times].sort((left, right) => right - left));
  });

  it("returns a published post by slug and hides drafts", async () => {
    const published = await getPostBySlug("idea-to-production-ai");
    expect(published?.title).toBe("From idea to a production AI product");
    expect(published?.status).toBe("published");

    await expect(getPostBySlug("draft-internal-notes")).resolves.toBeNull();
    await expect(getPostBySlug("missing")).resolves.toBeNull();
  });

  it("exposes published slugs for static generation", async () => {
    await expect(listPublishedSlugs()).resolves.toEqual([
      "idea-to-production-ai",
    ]);
  });
});

describe("formatPostDate", () => {
  it("formats dates in day-month-year English", () => {
    expect(formatPostDate(new Date("2026-08-01T09:00:00.000Z"))).toMatch(
      /1 August 2026|1 Aug 2026/,
    );
  });
});
