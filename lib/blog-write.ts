import {
  upsertPostRecord,
  type BlogPost,
  type PostStatus,
} from "@/lib/blog";
import { siteKey, siteKeys, type SiteKey } from "@/lib/site";

export const BLOG_WRITE_MAX_BODY_BYTES = 100 * 1024;
export const BLOG_WRITE_MIN_TOKEN_BYTES = 32;
export const BLOG_WRITE_RATE_LIMIT = 30;
export const BLOG_WRITE_RATE_WINDOW_MS = 60_000;

export type BlogWriteErrors = Partial<
  Record<
    | "slug"
    | "title"
    | "description"
    | "content"
    | "tags"
    | "sites"
    | "coverImageUrl"
    | "status"
    | "form",
    string
  >
>;

export type BlogWriteInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  sites: SiteKey[];
  coverImageUrl: string | null;
  status: PostStatus;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80)
    .replaceAll(/^-+|-+$/g, "");
}

export function isSameOriginCoverPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("://") &&
    !value.includes("\\") &&
    !value.includes("..")
  );
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

export function validateBlogWritePayload(
  data: unknown,
):
  | { ok: true; value: BlogWriteInput; slugProvided: boolean }
  | { ok: false; errors: BlogWriteErrors } {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: { form: "Send a JSON object." } };
  }

  const body = data as Record<string, unknown>;
  const errors: BlogWriteErrors = {};

  const title = readString(body.title);
  if (!title || title.length < 3 || title.length > 160) {
    errors.title = "Enter a title (3–160 characters).";
  }

  const description = readString(body.description);
  if (!description || description.length < 10 || description.length > 320) {
    errors.description = "Enter a description (10–320 characters).";
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length < 20) {
    errors.content = "Enter Markdown content (at least 20 characters).";
  }

  const slugProvided = Boolean(readString(body.slug));
  let slug = readString(body.slug);
  if (slug) {
    if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
      errors.slug = "Use a lowercase slug with letters, numbers, and hyphens.";
    }
  } else if (title && !errors.title) {
    slug = slugifyTitle(title);
    if (!slug) {
      errors.slug = "Could not build a slug from the title.";
    }
  }

  let tags: string[] = [];
  if (body.tags != null) {
    if (
      !Array.isArray(body.tags) ||
      body.tags.some((tag) => typeof tag !== "string")
    ) {
      errors.tags = "Tags must be an array of strings.";
    } else {
      tags = body.tags.map((tag) => tag.trim()).filter(Boolean);
    }
  }

  // Defaults to the site doing the writing, so an existing caller that knows
  // nothing about Talvio keeps publishing here and only here.
  let sites: SiteKey[] = [siteKey];
  if (body.sites != null) {
    if (
      !Array.isArray(body.sites) ||
      body.sites.some((value) => typeof value !== "string")
    ) {
      errors.sites = "Sites must be an array of strings.";
    } else {
      const requested = body.sites
        .map((value) => (value as string).trim())
        .filter(Boolean);
      const unknown = requested.filter(
        (value) => !(siteKeys as readonly string[]).includes(value),
      );

      if (unknown.length > 0) {
        errors.sites = `Sites must be any of: ${siteKeys.join(", ")}.`;
      } else if (requested.length === 0) {
        errors.sites = "Name at least one site.";
      } else {
        sites = [...new Set(requested)] as SiteKey[];
      }
    }
  }

  let coverImageUrl: string | null = null;
  const cover = readString(body.cover_image_url ?? body.coverImageUrl);
  if (cover) {
    if (isSameOriginCoverPath(cover)) {
      coverImageUrl = cover;
    } else {
      errors.coverImageUrl =
        "Cover image must be a same-origin path starting with /.";
    }
  }

  const statusRaw = readString(body.status) ?? "draft";
  if (statusRaw !== "draft" && statusRaw !== "published") {
    errors.status = "Status must be draft or published.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    slugProvided,
    value: {
      slug: slug as string,
      title: title as string,
      description: description as string,
      content,
      tags,
      sites,
      coverImageUrl,
      status: statusRaw as PostStatus,
    },
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
