import { getEligiblePostBySlug } from "@/lib/blog";
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from "@/lib/blog-schema";
import {
  authorizeTalvioRead,
  blogReadJson,
  talvioReadFailed,
} from "@/lib/blog-read-auth";
import { serializeBlogPost } from "@/lib/blog-write";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const NOT_FOUND = {
  ok: false,
  errors: { slug: "Post not found." },
} as const;

export async function GET(request: Request, context: RouteContext) {
  const denied = await authorizeTalvioRead(request);

  if (denied) {
    return denied;
  }

  const { slug } = await context.params;

  if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
    return blogReadJson(400, {
      ok: false,
      errors: { slug: "Use a lowercase slug with letters, numbers, and hyphens." },
    });
  }

  try {
    const post = await getEligiblePostBySlug("talvio", slug);

    if (!post) {
      return blogReadJson(404, NOT_FOUND);
    }

    return blogReadJson(200, { ok: true, post: serializeBlogPost(post) });
  } catch (error) {
    return talvioReadFailed(error, "Could not load the post.");
  }
}
