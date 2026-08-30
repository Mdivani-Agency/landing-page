import { describe, expect, it } from "vitest";
import { listPublishedPosts } from "@/lib/blog";
import {
  absoluteUrl,
  articleJsonLd,
  breadcrumbJsonLd,
  buildRssFeed,
  escapeXml,
} from "@/lib/blog-seo";
import { site } from "@/lib/site";

describe("blog SEO helpers", () => {
  it("builds article and breadcrumb JSON-LD for a published post", async () => {
    const [post] = await listPublishedPosts();
    expect(post).toBeDefined();

    expect(articleJsonLd(post)).toMatchObject({
      "@type": "Article",
      headline: post.title,
      datePublished: post.publishedAt?.toISOString(),
      author: { "@type": "Person", name: site.personName, url: site.url },
      mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    });

    expect(breadcrumbJsonLd(post).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${site.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${site.url}/blog/${post.slug}`,
      },
    ]);
  });

  it("builds an RSS feed of published posts only and escapes XML", async () => {
    const posts = await listPublishedPosts();
    const xml = buildRssFeed(posts, new Date("2026-08-30T12:00:00.000Z"));

    expect(xml).toContain("<title>From idea to a production AI product</title>");
    expect(xml).toContain(`${site.url}/blog/idea-to-production-ai`);
    expect(xml).not.toContain("draft-internal-notes");
    expect(xml).not.toContain("Internal notes");
    expect(escapeXml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
    expect(absoluteUrl("/blog")).toBe(`${site.url}/blog`);
  });
});
