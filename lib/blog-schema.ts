import { siteKey, siteKeys, type SiteKey } from "./site";

export const BLOG_WRITE_MAX_BODY_BYTES = 100 * 1024;
export const BLOG_WRITE_MIN_TOKEN_BYTES = 32;
export const BLOG_WRITE_RATE_LIMIT = 30;
export const BLOG_WRITE_RATE_WINDOW_MS = 60_000;

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 160;
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 320;
export const CONTENT_MIN_LENGTH = 20;
export const SLUG_MAX_LENGTH = 80;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** URL segments that collide with `/blog/page/[page]` listing routes. */
export const RESERVED_SLUGS = ["page"] as const;

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export const POST_STATUSES = ["draft", "published"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export { siteKey, siteKeys };
export type { SiteKey };

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
    | "featured"
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
  featured: boolean;
};

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replaceAll(/^-+|-+$/g, "");
}

export function isSameOriginCoverPath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("://") &&
    !value.includes("\\") &&
    !value.includes("..") &&
    !value.includes("?") &&
    !value.includes("#")
  );
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

export type BlogWriteProvided = {
  slugProvided: boolean;
  sitesProvided: boolean;
  tagsProvided: boolean;
  coverProvided: boolean;
  statusProvided: boolean;
  featuredProvided: boolean;
};

export function validateBlogWritePayload(
  data: unknown,
):
  | ({
      ok: true;
      value: BlogWriteInput;
    } & BlogWriteProvided)
  | { ok: false; errors: BlogWriteErrors } {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, errors: { form: "Send a JSON object." } };
  }

  const body = data as Record<string, unknown>;
  const errors: BlogWriteErrors = {};

  const title = readString(body.title);
  if (
    !title ||
    title.length < TITLE_MIN_LENGTH ||
    title.length > TITLE_MAX_LENGTH
  ) {
    errors.title = "Enter a title (3–160 characters).";
  }

  const description = readString(body.description);
  if (
    !description ||
    description.length < DESCRIPTION_MIN_LENGTH ||
    description.length > DESCRIPTION_MAX_LENGTH
  ) {
    errors.description = "Enter a description (10–320 characters).";
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length < CONTENT_MIN_LENGTH) {
    errors.content = "Enter Markdown content (at least 20 characters).";
  }

  const slugProvided = Boolean(readString(body.slug));
  let slug = readString(body.slug);
  if (slug) {
    if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
      errors.slug = "Use a lowercase slug with letters, numbers, and hyphens.";
    } else if (isReservedSlug(slug)) {
      errors.slug = "That slug is reserved.";
    }
  } else if (title && !errors.title) {
    slug = slugifyTitle(title);
    if (!slug) {
      errors.slug = "Could not build a slug from the title.";
    } else if (isReservedSlug(slug)) {
      errors.slug = "That slug is reserved.";
    }
  }

  // `in` so an explicit null/[]/"" still counts as provided and can clear
  // the stored value. Omitted keys keep the existing row on update.
  const tagsProvided = "tags" in body;
  let tags: string[] = [];
  if (tagsProvided) {
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
  // nothing about Talvio keeps publishing here and only here. Omitted `sites`
  // on an update must not overwrite a wider list — see `sitesProvided`.
  const sitesProvided = "sites" in body;
  let sites: SiteKey[] = [siteKey];
  if (sitesProvided) {
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

  const coverProvided = "cover_image_url" in body || "coverImageUrl" in body;
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

  const statusProvided = "status" in body;
  const statusRaw = readString(body.status) ?? "draft";
  if (!POST_STATUSES.includes(statusRaw as PostStatus)) {
    errors.status = "Status must be draft or published.";
  }

  const featuredProvided = "featured" in body;
  let featured = false;
  if (featuredProvided) {
    if (typeof body.featured !== "boolean") {
      errors.featured = "Featured must be true or false.";
    } else {
      featured = body.featured;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    slugProvided,
    sitesProvided,
    tagsProvided,
    coverProvided,
    statusProvided,
    featuredProvided,
    value: {
      slug: slug as string,
      title: title as string,
      description: description as string,
      content,
      tags,
      sites,
      coverImageUrl,
      status: statusRaw as PostStatus,
      featured,
    },
  };
}
