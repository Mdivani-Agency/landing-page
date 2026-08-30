import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  getPostRecordBySlug,
} from "@/lib/blog";
import {
  BLOG_WRITE_MAX_BODY_BYTES,
  consumeWriteRateLimit,
  readWriteToken,
  serializeBlogPost,
  upsertBlogPost,
  validateBlogWritePayload,
} from "@/lib/blog-write";

function json(status: number, body: unknown) {
  return Response.json(body, { status });
}

function unauthorized() {
  return json(401, { ok: false, errors: { form: "Unauthorized." } });
}

function tokensEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export async function POST(request: Request) {
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

  if (!consumeWriteRateLimit(clientKey(request))) {
    return json(429, {
      ok: false,
      errors: { form: "Too many requests. Try again in a minute." },
    });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json(400, { ok: false, errors: { form: "Send a JSON body." } });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > BLOG_WRITE_MAX_BODY_BYTES) {
    return json(400, { ok: false, errors: { form: "Request is too large." } });
  }

  const bodyText = await request.text();
  if (new TextEncoder().encode(bodyText).length > BLOG_WRITE_MAX_BODY_BYTES) {
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

  const existing = await getPostRecordBySlug(validated.value.slug);
  const post = await upsertBlogPost(validated.value, existing);

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");

  return json(200, { ok: true, post: serializeBlogPost(post) });
}

export function GET() {
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}
