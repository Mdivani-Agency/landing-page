import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { getPostRecordBySlug, type BlogPost } from "@/lib/blog";
import {
  BLOG_WRITE_MAX_BODY_BYTES,
  consumeWriteRateLimit,
  readWriteToken,
  serializeBlogPost,
  upsertBlogPost,
  validateBlogWritePayload,
} from "@/lib/blog-write";
import { declaredContentLengthExceedsLimit, readBodyWithinLimit } from "@/lib/contact";
import { getClientIp } from "@/lib/rate-limit";

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

function unauthorized() {
  return json(401, { ok: false, errors: { form: "Unauthorized." } });
}

function digestToken(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function tokensEqual(provided: string, expected: string): boolean {
  return timingSafeEqual(digestToken(provided), digestToken(expected));
}

function persistenceFailed(error: unknown) {
  const exception =
    error instanceof Error ? error : new Error("blog write failed");

  console.error("posts: persistence failed", exception);
  Sentry.captureException(exception, { tags: { area: "blog-write" } });

  return json(500, { ok: false, errors: { form: "Could not save the post." } });
}

function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  if (!consumeWriteRateLimit(getClientIp(request.headers))) {
    return json(429, {
      ok: false,
      errors: { form: "Too many requests. Try again in a minute." },
    });
  }

  const expected = readWriteToken();

  if (!expected) {
    console.error("posts: missing env", "BLOG_WRITE_TOKEN");
    return json(500, {
      ok: false,
      errors: { form: "Write API is not configured." },
    });
  }

  const provided = bearerToken(request.headers.get("authorization"));

  if (!provided || !tokensEqual(provided, expected)) {
    return unauthorized();
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(400, { ok: false, errors: { form: "Send a JSON body." } });
  }

  if (
    declaredContentLengthExceedsLimit(
      request.headers.get("content-length"),
      BLOG_WRITE_MAX_BODY_BYTES,
    )
  ) {
    return json(400, { ok: false, errors: { form: "Request is too large." } });
  }

  const bodyText = await readBodyWithinLimit(
    request.body,
    BLOG_WRITE_MAX_BODY_BYTES,
  );

  if (bodyText === null) {
    return json(400, { ok: false, errors: { form: "Request is too large." } });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bodyText) as unknown;
  } catch {
    return json(400, { ok: false, errors: { form: "Send a JSON body." } });
  }

  const validated = validateBlogWritePayload(parsed);

  if (!validated.ok) {
    return json(400, { ok: false, errors: validated.errors });
  }

  let existing: BlogPost | null;

  try {
    existing = await getPostRecordBySlug(validated.value.slug);
  } catch (error) {
    return persistenceFailed(error);
  }

  if (!validated.slugProvided && existing) {
    return json(409, {
      ok: false,
      errors: { slug: "A post with that slug already exists." },
      slug: validated.value.slug,
    });
  }

  let post: BlogPost;

  try {
    post = await upsertBlogPost(validated.value, existing);
  } catch (error) {
    return persistenceFailed(error);
  }

  // Unconditional: unpublishing has to drop the post from these as surely as
  // publishing adds it.
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/feed.xml");

  return json(200, { ok: true, post: serializeBlogPost(post) });
}

export function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}
