import { upsertPostRecord, type BlogPost } from "@/lib/blog";
import {
  BLOG_WRITE_MIN_TOKEN_BYTES,
  BLOG_WRITE_RATE_LIMIT,
  BLOG_WRITE_RATE_WINDOW_MS,
  type BlogWriteInput,
} from "@/lib/blog-schema";

export {
  BLOG_WRITE_MAX_BODY_BYTES,
  BLOG_WRITE_MIN_TOKEN_BYTES,
  BLOG_WRITE_RATE_LIMIT,
  BLOG_WRITE_RATE_WINDOW_MS,
  CONTENT_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  POST_STATUSES,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  isSameOriginCoverPath,
  slugifyTitle,
  validateBlogWritePayload,
  type BlogWriteErrors,
  type BlogWriteInput,
  type PostStatus,
} from "@/lib/blog-schema";

export async function upsertBlogPost(
  input: BlogWriteInput,
  existing: BlogPost | null,
  now = new Date(),
): Promise<BlogPost> {
  const iso = now.toISOString();
  const publishedAt =
    input.status === "published"
      ? (existing?.publishedAt?.toISOString() ?? iso)
      : existing?.publishedAt?.toISOString() ?? null;

  return upsertPostRecord({
    slug: input.slug,
    title: input.title,
    description: input.description,
    content: input.content,
    coverImageUrl: input.coverImageUrl,
    tags: input.tags,
    sites: input.sites,
    status: input.status,
    publishedAt,
    createdAt: existing?.createdAt.toISOString() ?? iso,
    updatedAt: iso,
  });
}

export function serializeBlogPost(post: BlogPost) {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    cover_image_url: post.coverImageUrl,
    tags: post.tags,
    sites: post.sites,
    status: post.status,
    published_at: post.publishedAt?.toISOString() ?? null,
    created_at: post.createdAt.toISOString(),
    updated_at: post.updatedAt.toISOString(),
  };
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function consumeWriteRateLimit(
  key: string,
  now = Date.now(),
): boolean {
  const current = rateBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateBuckets.set(key, {
      count: 1,
      resetAt: now + BLOG_WRITE_RATE_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= BLOG_WRITE_RATE_LIMIT) {
    return false;
  }

  current.count += 1;
  return true;
}

export function resetWriteRateLimit(): void {
  rateBuckets.clear();
}

export function readWriteToken(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  const token = env.BLOG_WRITE_TOKEN?.trim();

  if (!token || Buffer.byteLength(token, "utf8") < BLOG_WRITE_MIN_TOKEN_BYTES) {
    return undefined;
  }

  return token;
}
