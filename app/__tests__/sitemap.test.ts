import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
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
});
