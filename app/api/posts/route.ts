import { revalidatePath } from "next/cache";
import {
  getPostRecordBySlug,
  listPostRecords,
  type BlogPost,
  type BlogPostSummary,
} from "@/lib/blog";
import { POST_STATUSES, type PostStatus } from "@/lib/blog-schema";
import {
  BLOG_WRITE_MAX_BODY_BYTES,
  mergeBlogWriteWithExisting,
  serializeBlogPost,
  serializeBlogPostSummary,
  upsertBlogPost,
  validateBlogWritePayload,
} from "@/lib/blog-write";
import {
  authorizeBlogWrite,
  blogWriteJson,
  blogWritePersistenceFailed,
} from "@/lib/blog-write-auth";
import {
  declaredContentLengthExceedsLimit,
  isJsonContentType,
  readBodyWithinLimit,
} from "@/lib/contact";
import { siteKeys, type SiteKey } from "@/lib/site";

export async function POST(request: Request) {
  const denied = authorizeBlogWrite(request);

  if (denied) {
    return denied;
  }

  if (!isJsonContentType(request.headers.get("content-type"))) {
    return blogWriteJson(400, { ok: false, errors: { form: "Send a JSON body." } });
  }

  if (
    declaredContentLengthExceedsLimit(
      request.headers.get("content-length"),
      BLOG_WRITE_MAX_BODY_BYTES,
    )
  ) {
    return blogWriteJson(400, {
      ok: false,
      errors: { form: "Request is too large." },
    });
  }

  const bodyText = await readBodyWithinLimit(
    request.body,
    BLOG_WRITE_MAX_BODY_BYTES,
  );

  if (bodyText === null) {
    return blogWriteJson(400, {
      ok: false,
      errors: { form: "Request is too large." },
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText) as unknown;
  } catch {
    return blogWriteJson(400, { ok: false, errors: { form: "Send a JSON body." } });
  }

  const validated = validateBlogWritePayload(parsed);

  if (!validated.ok) {
    return blogWriteJson(400, { ok: false, errors: validated.errors });
  }

  let existing: BlogPost | null;

  try {
    existing = await getPostRecordBySlug(validated.value.slug);
  } catch (error) {
    return blogWritePersistenceFailed(error);
  }

  if (!validated.slugProvided && existing) {
    return blogWriteJson(409, {
      ok: false,
      errors: { slug: "A post with that slug already exists." },
      slug: validated.value.slug,
    });
  }

  const input = mergeBlogWriteWithExisting(validated.value, existing, validated);

  let post: BlogPost;

  try {
    post = await upsertBlogPost(input, existing);
  } catch (error) {
    return blogWritePersistenceFailed(error);
  }

  // Unconditional: unpublishing has to drop the post from these as surely as
  // publishing adds it. The layout type also covers `/blog/page/[page]`.
  revalidatePath("/blog");
  revalidatePath("/blog", "layout");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");

  return blogWriteJson(200, { ok: true, post: serializeBlogPost(post) });
}

export async function GET(request: Request) {
  const denied = authorizeBlogWrite(request);

  if (denied) {
    return denied;
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status")?.trim();
  const siteFilter = url.searchParams.get("site")?.trim();

  if (
    statusFilter &&
    !POST_STATUSES.includes(statusFilter as PostStatus)
  ) {
    return blogWriteJson(400, {
      ok: false,
      errors: { status: "Status must be draft or published." },
    });
  }

  if (siteFilter && !(siteKeys as readonly string[]).includes(siteFilter)) {
    return blogWriteJson(400, {
      ok: false,
      errors: { site: `Site must be any of: ${siteKeys.join(", ")}.` },
    });
  }

  let posts: BlogPostSummary[];

  try {
    posts = await listPostRecords({
      status: statusFilter as PostStatus | undefined,
      site: siteFilter as SiteKey | undefined,
    });
  } catch (error) {
    return blogWritePersistenceFailed(error, "Could not load posts.");
  }

  return blogWriteJson(200, {
    ok: true,
    posts: posts.map(serializeBlogPostSummary),
  });
}
