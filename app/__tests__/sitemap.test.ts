import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createFakeSupabase,
  fakeBlogRow,
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

import sitemap from "@/app/sitemap";
import { listPublishedPosts } from "@/lib/blog";
import { latestUpdatedAt } from "@/lib/blog-seo";
import { site } from "@/lib/site";

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

describe("sitemap", () => {
  it("includes the blog index and published posts, not drafts", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(`${site.url}/blog`);
    expect(urls).toContain(`${site.url}/blog/idea-to-production-ai`);
    expect(urls).not.toContain(`${site.url}/blog/draft-internal-notes`);

    const post = entries.find(
      (entry) => entry.url === `${site.url}/blog/idea-to-production-ai`,
    );
    expect(post?.lastModified).toBeInstanceOf(Date);
  });

  it("sets the blog index lastModified to the newest updated post", async () => {
    const posts = await listPublishedPosts();
    const entries = await sitemap();
    const blog = entries.find((entry) => entry.url === `${site.url}/blog`);

    expect(blog?.lastModified).toEqual(latestUpdatedAt(posts));
  });

  it("omits paginated listing URLs when one page is enough", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).not.toContain(`${site.url}/blog/page/2`);
  });

  it("includes later listing pages when the chronological grid overflows", async () => {
    state.client = createFakeSupabase([
      ...fakeBlogRows,
      ...Array.from({ length: 6 }, (_, index) =>
        fakeBlogRow({
          slug: `extra-${index + 1}`,
          title: `Extra post ${index + 1}`,
          published_at: `2026-07-${String(index + 1).padStart(2, "0")}T09:00:00.000Z`,
        }),
      ),
    ]);

    const posts = await listPublishedPosts();
    const entries = await sitemap();
    const pageTwo = entries.find(
      (entry) => entry.url === `${site.url}/blog/page/2`,
    );

    expect(pageTwo).toMatchObject({
      lastModified: latestUpdatedAt(posts),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  });
});
