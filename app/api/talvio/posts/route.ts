import { listEligiblePostSummaries } from "@/lib/blog";
import { parseTalvioPostsQuery } from "@/lib/blog-read";
import {
  authorizeTalvioRead,
  blogReadJson,
  talvioReadFailed,
} from "@/lib/blog-read-auth";
import { serializeBlogPostSummary } from "@/lib/blog-write";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await authorizeTalvioRead(request);

  if (denied) {
    return denied;
  }

  const parsed = parseTalvioPostsQuery(new URL(request.url));

  if (!parsed.ok) {
    return blogReadJson(400, { ok: false, errors: parsed.errors });
  }

  try {
    const { posts, total } = await listEligiblePostSummaries("talvio", parsed);

    return blogReadJson(200, {
      ok: true,
      posts: posts.map(serializeBlogPostSummary),
      limit: parsed.limit,
      offset: parsed.offset,
      total,
    });
  } catch (error) {
    return talvioReadFailed(error);
  }
}
