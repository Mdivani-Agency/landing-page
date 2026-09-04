import { BlogPostCard } from "@/components/blog-post-card";
import { PageIntro } from "@/components/page-intro";
import { Section } from "@/components/section";
import { listPublishedPosts } from "@/lib/blog";
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
    <article className="space-y-16">
      <PageIntro
        eyebrow="Blog"
        title="Notes on building AI products."
        lede="Short writing on taking AI ideas into production: product definition, architecture, and the reliability work that sits between a demo and a customer."
      />
      <Section labelledBy="blog-posts-heading">
        <h2 id="blog-posts-heading" className="sr-only">
          Published posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted">No posts published yet.</p>
        ) : (
          <div className="grid gap-2">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Section>
    </article>
  );
}
