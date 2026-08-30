import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { legalLinks, navLinks, site } from "@/lib/site";

const pagePriority: Record<string, number> = {
  "/": 1,
  "/work": 0.8,
  "/how-i-work": 0.8,
  "/inquiry": 0.8,
  "/about": 0.7,
  "/blog": 0.7,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();
  const paths = [
    "/",
    ...navLinks.map((link) => link.href),
    ...legalLinks.map((link) => link.href),
  ];

  const pages = paths.map((path) => ({
    url: path === "/" ? site.url : `${site.url}${path}`,
    lastModified:
      path === "/blog" ? (posts[0]?.updatedAt ?? new Date()) : new Date(),
    changeFrequency:
      path === "/privacy-policy" || path === "/terms-of-service"
        ? "yearly"
        : path === "/blog"
          ? "weekly"
          : "monthly",
    priority: pagePriority[path] ?? 0.3,
  })) satisfies MetadataRoute.Sitemap;

  return [
    ...pages,
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
