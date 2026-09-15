import Link from "next/link";
import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { BlogTags } from "@/components/blog-tags";
import { formatPostDate, type BlogPostSummary } from "@/lib/blog";

type BlogPostCardProps = {
  post: BlogPostSummary;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const publishedLabel = post.publishedAt
    ? formatPostDate(post.publishedAt)
    : null;
  const eyebrow = [post.featured ? "Featured" : null, publishedLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card variant={post.featured ? "featured" : "default"}>
      {eyebrow ? <Eyebrow variant="card">{eyebrow}</Eyebrow> : null}
      <CardTitle>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </CardTitle>
      <CardText>{post.description}</CardText>
      <BlogTags tags={post.tags} />
    </Card>
  );
}
