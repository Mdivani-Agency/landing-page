import Link from "next/link";
import { Card, CardText, CardTitle } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { BlogTags } from "@/components/blog-markdown";
import { formatPostDate, type BlogPost } from "@/lib/blog";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const publishedLabel = post.publishedAt
    ? formatPostDate(post.publishedAt)
    : null;

  return (
    <Card>
      {publishedLabel ? <Eyebrow variant="card">{publishedLabel}</Eyebrow> : null}
      <CardTitle>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </CardTitle>
      <CardText>{post.description}</CardText>
      <BlogTags tags={post.tags} />
    </Card>
  );
}
