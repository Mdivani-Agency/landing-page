import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { listPublishedPosts } from "@/lib/blog";
import { latestUpdatedAt } from "@/lib/blog-seo";
import { site } from "@/lib/site";

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
});
