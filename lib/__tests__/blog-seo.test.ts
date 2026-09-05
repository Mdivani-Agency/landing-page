import { beforeEach, describe, expect, it, vi } from "vitest";
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

import { listPublishedPosts, type BlogPost } from "@/lib/blog";
import {
  absoluteUrl,
  articleJsonLd,
  breadcrumbJsonLd,
  buildRssFeed,
  escapeXml,
  latestUpdatedAt,
} from "@/lib/blog-seo";
import { site } from "@/lib/site";

beforeEach(() => {
  state.client = createFakeSupabase(fakeBlogRows);
});

describe("blog SEO helpers", () => {
  it("builds article and breadcrumb JSON-LD for a published post", async () => {
    const [post] = await listPublishedPosts();
    expect(post).toBeDefined();

    expect(articleJsonLd(post)).toMatchObject({
      "@type": "Article",
      headline: post.title,
      datePublished: post.publishedAt?.toISOString(),
      image: [`${site.url}/assets/images/giorgi.jpg`],
      author: { "@type": "Person", name: site.personName, url: site.url },
      publisher: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/assets/images/giorgi.jpg`,
        },
      },
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

  it("uses a post cover as the Article image when present", () => {
    const post = {
      slug: "covered",
      title: "Covered post",
      description: "Enough description for the card.",
      content: "## Hello",
      coverImageUrl: "/assets/logo.svg",
      tags: [],
      sites: ["agency"],
      status: "published",
      featured: false,
      publishedAt: new Date("2026-08-01T09:00:00.000Z"),
      createdAt: new Date("2026-08-01T09:00:00.000Z"),
      updatedAt: new Date("2026-08-01T09:00:00.000Z"),
    } satisfies BlogPost;

    expect(articleJsonLd(post).image).toEqual([`${site.url}/assets/logo.svg`]);
  });

  it("picks the newest updatedAt even when that post is not the newest published", () => {
    const latest = latestUpdatedAt([
      { updatedAt: new Date("2026-08-01T09:00:00.000Z") },
      { updatedAt: new Date("2026-09-01T12:00:00.000Z") },
    ]);

    expect(latest.toISOString()).toBe("2026-09-01T12:00:00.000Z");
  });
});
