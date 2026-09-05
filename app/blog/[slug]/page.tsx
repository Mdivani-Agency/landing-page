import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogShare } from "@/components/blog-share";
import { BlogTags } from "@/components/blog-tags";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Markdown } from "@/components/markdown";
import {
  formatPostDate,
  getPostBySlug,
  listPublishedSlugs,
} from "@/lib/blog";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd } from "@/lib/blog-seo";
import { createPageMetadata, serializeJsonLd } from "@/lib/metadata";

export const revalidate = 3600;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return createPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    image: post.coverImageUrl ?? undefined,
    rss: true,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedLabel = post.publishedAt
    ? formatPostDate(post.publishedAt)
    : null;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(articleJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd(post)),
        }}
      />
      <header className="flex max-w-[72ch] flex-col items-start gap-1.5 pt-3 text-md">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/blog", label: "Blog" },
            { label: post.title },
          ]}
        />
        {publishedLabel ? (
          <p className="text-xs uppercase tracking-caps text-secondary">
            {publishedLabel}
          </p>
        ) : null}
        <h1 className="max-w-[22ch] font-serif text-heading">{post.title}</h1>
        <p className="mt-1 mb-2 leading-[1.7] text-muted">
          {post.description}
        </p>
      </header>
      {post.coverImageUrl ? (
        <div className="relative mx-auto mt-3 aspect-[16/9] w-full max-w-[96rem] overflow-hidden rounded-card border border-subtle">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 96rem, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <section className="article-reading-surface relative mt-4 py-2 lg:py-4 lg:py-5">
        <div
          aria-hidden
          className="article-wash pointer-events-none absolute inset-0 -z-10 rounded-card bg-[rgba(8,9,11,0.72)]"
        />
        <div className="article-measure mx-auto w-full max-w-[68ch] text-md lg:max-w-[72ch]">
          <Markdown>{post.content}</Markdown>
        </div>
      </section>
      <footer className="article-footer mt-3 lg:mt-5 space-y-2">
        <BlogShare
          url={absoluteUrl(`/blog/${post.slug}`)}
          title={post.title}
          description={post.description}
        />
        <BlogTags tags={post.tags} />
      </footer>
    </article>
  );
}
