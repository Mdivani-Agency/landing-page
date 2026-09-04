import { getPostRecordBySlug } from "@/lib/blog";
import { SLUG_PATTERN, SLUG_MAX_LENGTH } from "@/lib/blog-schema";
import { serializeBlogPost } from "@/lib/blog-write";
import {
  authorizeBlogWrite,
  blogWriteJson,
  blogWritePersistenceFailed,
} from "@/lib/blog-write-auth";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const denied = authorizeBlogWrite(request);

  if (denied) {
    return denied;
  }

  const { slug } = await context.params;

  if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
    return blogWriteJson(400, {
      ok: false,
      errors: { slug: "Use a lowercase slug with letters, numbers, and hyphens." },
    });
  }

  try {
    const post = await getPostRecordBySlug(slug);

    if (!post) {
      return blogWriteJson(404, {
        ok: false,
        errors: { slug: "Post not found." },
      });
    }

    return blogWriteJson(200, { ok: true, post: serializeBlogPost(post) });
  } catch (error) {
    return blogWritePersistenceFailed(error, "Could not load the post.");
  }
}
