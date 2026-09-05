import { BlogPostCard } from "@/components/blog-post-card";
import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import { listPublishedPosts, partitionPublishedPosts } from "@/lib/blog";
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
  const { featured, rest } = partitionPublishedPosts(posts);

  return (
    <article className="space-y-8 lg:space-y-16">
      <PageIntro
        eyebrow="Blog"
        title="Notes on building AI products."
        lede="Short writing on taking AI ideas into production: product definition, architecture, and the reliability work that sits between a demo and a customer."
      />
      {featured.length > 0 ? (
        <Section labelledBy="featured-posts-heading">
          <h2 id="featured-posts-heading" className="sr-only">
            Featured posts
          </h2>
          <div className="grid gap-2">
            {featured.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      ) : null}
      {posts.length === 0 ? (
        <Section labelledBy="blog-posts-heading">
          <h2 id="blog-posts-heading" className="sr-only">
            Published posts
          </h2>
          <p className="text-sm text-muted">No posts published yet.</p>
        </Section>
      ) : rest.length === 0 ? null : (
        <Section labelledBy="blog-posts-heading">
          <h2 id="blog-posts-heading" className="sr-only">
            Published posts
          </h2>
          <div className="grid gap-2">
            {rest.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
