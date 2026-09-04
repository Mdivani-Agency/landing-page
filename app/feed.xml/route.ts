import { listPublishedPosts } from "@/lib/blog";
import { buildRssFeed } from "@/lib/blog-seo";

export const revalidate = 3600;

export async function GET() {
  const posts = await listPublishedPosts();
  const body = buildRssFeed(posts);

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
