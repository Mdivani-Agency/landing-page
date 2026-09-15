import { BlogListing } from "@/components/blog-listing";
import { listPublishedPosts, paginateBlogListing } from "@/lib/blog";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata = createPageMetadata({
  title: "Blog",
  description:
    "Notes from Giorgi Mdivani on building AI products — from the first slice through production reliability.",
  path: "/blog",
  rss: true,
});

export default async function BlogPage() {
  const posts = await listPublishedPosts();

  return (
    <BlogListing
      listing={paginateBlogListing(posts, 1)}
      publishedCount={posts.length}
    />
  );
}
