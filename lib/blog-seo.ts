import type { BlogPost } from "@/lib/blog";
import { brandLogo, socialImage } from "@/lib/metadata";
import { site } from "@/lib/site";

export function latestUpdatedAt(
  posts: { updatedAt: Date }[],
  fallback = new Date(),
): Date {
  return posts.reduce(
    (latest, post) => (post.updatedAt > latest ? post.updatedAt : latest),
    posts[0]?.updatedAt ?? fallback,
  );
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function articleJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: site.personName,
      url: site.url,
      jobTitle: site.personRole,
    },
    image: [absoluteUrl(post.coverImageUrl ?? socialImage.url)],
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(brandLogo.url),
      },
    },
    mainEntityOfPage: url,
    url,
  };
}

export function breadcrumbJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blog"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blog/${post.slug}`),
      },
    ],
  };
}

export function buildRssFeed(posts: BlogPost[], now = new Date()): string {
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const published = (post.publishedAt ?? post.createdAt).toUTCString();

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid>${escapeXml(url)}</guid>`,
        `      <pubDate>${published}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(`${site.personName} — Blog`)}</title>`,
    `    <link>${escapeXml(absoluteUrl("/blog"))}</link>`,
    `    <description>${escapeXml(
      "Notes on building AI products, from the first slice through production.",
    )}</description>`,
    `    <lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
