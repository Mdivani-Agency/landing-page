import { notFound, permanentRedirect } from "next/navigation";
import { BlogListing } from "@/components/blog-listing";
import {
  blogListPageNumbers,
  blogListPath,
  listPublishedPosts,
  paginateBlogListing,
  parseBlogListPageParam,
} from "@/lib/blog";
import { createPageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

type BlogListPageProps = {
  params: Promise<{ page: string }>;
};

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return blogListPageNumbers(posts).map((page) => ({ page: String(page) }));
}

export async function generateMetadata({ params }: BlogListPageProps) {
  const requested = parseBlogListPageParam((await params).page);

  if (requested == null || requested === 1) {
    return {};
  }

  const listing = paginateBlogListing(await listPublishedPosts(), requested);

  if (!listing.inRange) {
    return {};
  }

  return createPageMetadata({
    title: `Blog — Page ${requested}`,
    description:
      "Notes from Giorgi Mdivani on building AI products — from the first slice through production reliability.",
    path: `/blog/page/${requested}`,
    rss: true,
  });
}

export default async function BlogListPage({ params }: BlogListPageProps) {
  const requested = parseBlogListPageParam((await params).page);

  if (requested == null) {
    notFound();
  }

  if (requested === 1) {
    permanentRedirect(blogListPath(1));
  }

  const posts = await listPublishedPosts();
  const listing = paginateBlogListing(posts, requested);

  if (!listing.inRange) {
    notFound();
  }

  return <BlogListing listing={listing} publishedCount={posts.length} />;
}
