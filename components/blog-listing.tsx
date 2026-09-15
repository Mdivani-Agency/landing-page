import { BlogPagination } from "@/components/blog-pagination";
import { BlogPostCard } from "@/components/blog-post-card";
import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import type { BlogListingPage } from "@/lib/blog";

type BlogListingProps = {
  listing: BlogListingPage;
  publishedCount: number;
};

export function BlogListing({ listing, publishedCount }: BlogListingProps) {
  const showFeatured = listing.page === 1 && listing.featured.length > 0;

  return (
    <article className="space-y-8 lg:space-y-16">
      <PageIntro
        eyebrow="Blog"
        title="Notes on building AI products."
        lede="Short writing on taking AI ideas into production: product definition, architecture, and the reliability work that sits between a demo and a customer."
      />
      {showFeatured ? (
        <Section labelledBy="featured-posts-heading">
          <h2 id="featured-posts-heading" className="sr-only">
            Featured posts
          </h2>
          <div className="grid gap-2">
            {listing.featured.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      ) : null}
      {publishedCount === 0 ? (
        <Section labelledBy="blog-posts-heading">
          <h2 id="blog-posts-heading" className="sr-only">
            Published posts
          </h2>
          <p className="text-sm text-muted">No posts published yet.</p>
        </Section>
      ) : listing.posts.length === 0 ? null : (
        <Section labelledBy="blog-posts-heading">
          <h2 id="blog-posts-heading" className="sr-only">
            Published posts
          </h2>
          <div className="grid gap-2">
            {listing.posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
          <BlogPagination page={listing.page} pageCount={listing.pageCount} />
        </Section>
      )}
    </article>
  );
}
