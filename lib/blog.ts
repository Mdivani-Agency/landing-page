import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type PostStatus } from "@/lib/blog-schema";
import { siteKey, type SiteKey } from "@/lib/site";
import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
  readSupabaseAdminEnv,
  readSupabaseEnv,
} from "@/lib/supabase";

export type { PostStatus };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImageUrl: string | null;
  tags: string[];
  sites: SiteKey[];
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPostSummary = Omit<BlogPost, "content">;

export type BlogPostRecord = Omit<
  BlogPost,
  "publishedAt" | "createdAt" | "updatedAt"
> & {
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Row shape of `public.blog_posts`. Hand-maintained rather than generated, so
 * it has to move in step with `supabase/migrations/`.
 */
type BlogPostRow = {
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  sites: SiteKey[];
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const TABLE = "blog_posts";

const COLUMNS =
  "slug, title, description, content, cover_image_url, tags, sites, status, published_at, created_at, updated_at";

const LIST_COLUMNS =
  "slug, title, description, cover_image_url, tags, sites, status, published_at, created_at, updated_at";

function toPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    tags: row.tags,
    sites: row.sites,
    status: row.status,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toRow(record: BlogPostRecord): BlogPostRow {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    content: record.content,
    cover_image_url: record.coverImageUrl,
    tags: record.tags,
    sites: record.sites,
    status: record.status,
    published_at: record.publishedAt,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

/**
 * A read failure returns an empty result rather than throwing, so no page
 * shows an error and nothing downstream reveals it. Both blog pages are ISR
 * with `revalidate = 3600`, so an unreported failure can serve an empty blog
 * for an hour — hence the report alongside the fallback.
 */
function reportReadFailure(message: string, detail?: unknown): void {
  Sentry.captureException(new Error(message), {
    tags: { area: "blog-read" },
    extra: { detail },
  });
}

/**
 * Reads tolerate missing credentials: `next build` runs without Supabase
 * variables in CI, and an empty blog is a better outcome there than a failed
 * build. Writes do not — see `adminClient`.
 */
function readClient(): SupabaseClient | null {
  const env = readSupabaseEnv();

  if (!env.ok) {
    // Warn, not error: absent variables are expected during a CI build and
    // only indicate a fault on a deployed environment.
    const message = `blog: missing env ${env.missing.join(", ")}`;
    console.warn(message);
    reportReadFailure(message);
    return null;
  }

  return createSupabaseReadClient(env.url, env.key);
}

function adminClient(): SupabaseClient {
  const env = readSupabaseAdminEnv();

  if (!env.ok) {
    throw new Error(`blog: missing env ${env.missing.join(", ")}`);
  }

  return createSupabaseAdminClient(env.url, env.key);
}

export async function listPublishedPosts(): Promise<BlogPost[]> {
  const client = readClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .eq("status", "published")
    .contains("sites", [siteKey])
    .order("published_at", { ascending: false });

  if (error) {
    console.error("blog: list published failed", error);
    reportReadFailure("blog: list published failed", error);
    return [];
  }

  return ((data ?? []) as BlogPostRow[]).map(toPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const client = readClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from(TABLE)
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .contains("sites", [siteKey])
    .maybeSingle();

  if (error) {
    console.error("blog: get by slug failed", error);
    reportReadFailure("blog: get by slug failed", error);
    return null;
  }

  return data ? toPost(data as BlogPostRow) : null;
}

export async function listPublishedSlugs(): Promise<string[]> {
  const posts = await listPublishedPosts();
  return posts.map((post) => post.slug);
}

/**
 * Write-path lookup. Uses the admin client and applies no status or site
 * filter on purpose: row level security hides drafts from the publishable
 * key, so a read-client lookup would miss a draft holding the slug and let
 * the insert fail on the unique constraint instead of returning a 409.
 */
export async function getPostRecordBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const { data, error } = await adminClient()
    .from(TABLE)
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`blog: get record by slug failed: ${error.message}`);
  }

  return data ? toPost(data as BlogPostRow) : null;
}

/**
 * Authenticated listing. Drafts and other-site posts are visible to a
 * caller who already holds the write token. Omits `content` — use
 * `getPostRecordBySlug` for the body. Filters are applied in the query.
 */
export async function listPostRecords(filters?: {
  status?: PostStatus;
  site?: SiteKey;
}): Promise<BlogPostSummary[]> {
  let query = adminClient()
    .from(TABLE)
    .select(LIST_COLUMNS)
    .order("updated_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.site) {
    query = query.contains("sites", [filters.site]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`blog: list records failed: ${error.message}`);
  }

  return ((data ?? []) as Omit<BlogPostRow, "content">[]).map((row) => {
    const post = toPost({ ...row, content: "" });
    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      coverImageUrl: post.coverImageUrl,
      tags: post.tags,
      sites: post.sites,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  });
}

export async function upsertPostRecord(
  record: BlogPostRecord,
): Promise<BlogPost> {
  const { data, error } = await adminClient()
    .from(TABLE)
    .upsert(toRow(record), { onConflict: "slug" })
    .select(COLUMNS)
    .single();

  if (error) {
    throw new Error(`blog: upsert failed: ${error.message}`);
  }

  return toPost(data as BlogPostRow);
}

export function formatPostDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
