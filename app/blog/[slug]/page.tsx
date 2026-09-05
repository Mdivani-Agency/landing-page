import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogTags } from "@/components/blog-tags";
import { Eyebrow } from "@/components/eyebrow";
import { articleMeasureClass, Markdown } from "@/components/markdown";
import {
  formatPostDate,
  getPostBySlug,
  listPublishedSlugs,
} from "@/lib/blog";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/blog-seo";
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
      <div className={articleMeasureClass}>
        <header className="flex flex-col items-start gap-1.5 pt-3">
          <Eyebrow>Blog</Eyebrow>
          {publishedLabel ? (
            <p className="text-xs uppercase tracking-caps text-secondary">
              {publishedLabel}
            </p>
          ) : null}
          <h1 className="max-w-[22ch] font-serif text-heading">{post.title}</h1>
          <p className="mt-1 mb-2 leading-[1.7] text-muted">
            {post.description}
          </p>
          <BlogTags tags={post.tags} />
        </header>
        {post.coverImageUrl ? (
          <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-card border border-subtle">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 73rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="relative mt-4">
          <div
            aria-hidden
            className="article-wash pointer-events-none absolute -inset-x-3 -inset-y-4 -z-10 hidden rounded-card bg-[rgba(8,9,11,0.72)] lg:block"
          />
          <Markdown>{post.content}</Markdown>
        </div>
      </div>
    </article>
  );
}
