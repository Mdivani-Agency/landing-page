import { upsertPostRecord, type BlogPost } from "@/lib/blog";
import {
  BLOG_WRITE_MIN_TOKEN_BYTES,
  BLOG_WRITE_RATE_LIMIT,
  BLOG_WRITE_RATE_WINDOW_MS,
  type BlogWriteInput,
  type BlogWriteProvided,
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
  type BlogWriteProvided,
  type PostStatus,
} from "@/lib/blog-schema";

/**
 * PUT-style writes default omitted optional fields. On update, omitted
 * `sites`, `tags`, `cover_image_url`, `status`, and `featured` keep the
 * stored values. Sending `[]`, `null`, `draft`, or `false` still clears
 * or unpublishes.
 */
export function mergeBlogWriteWithExisting(
  value: BlogWriteInput,
  existing: BlogPost | null,
  provided: Pick<
    BlogWriteProvided,
    | "sitesProvided"
    | "tagsProvided"
    | "coverProvided"
    | "statusProvided"
    | "featuredProvided"
  >,
): BlogWriteInput {
  if (!existing) {
    return value;
  }

  return {
    ...value,
    sites: provided.sitesProvided ? value.sites : existing.sites,
    tags: provided.tagsProvided ? value.tags : existing.tags,
    coverImageUrl: provided.coverProvided
      ? value.coverImageUrl
      : existing.coverImageUrl,
    status: provided.statusProvided ? value.status : existing.status,
    featured: provided.featuredProvided ? value.featured : existing.featured,
  };
}

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
    featured: input.featured,
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
    featured: post.featured,
    published_at: post.publishedAt?.toISOString() ?? null,
    created_at: post.createdAt.toISOString(),
    updated_at: post.updatedAt.toISOString(),
  };
}

export function serializeBlogPostSummary(post: Omit<BlogPost, "content">) {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    cover_image_url: post.coverImageUrl,
    tags: post.tags,
    sites: post.sites,
    status: post.status,
    featured: post.featured,
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
