import { listPostsInputSchema } from "../schema";
import type { ToolDefinition } from "../types";
import { failureResult, requireToken, writeSuccessResult } from "./result";

export const blogListPosts: ToolDefinition = {
  name: "blog_list_posts",
  title: "List blog posts",
  description: `List blog posts, including drafts and posts for other sites. Requires BLOG_WRITE_TOKEN.

Optional filters: status (draft|published) and site (agency|talvio).

Use this before blog_update_post when you are not sure whether a slug exists.`,
  inputSchema: listPostsInputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false },
  async handler(input, ctx) {
    const denied = requireToken(ctx);
    if (denied) {
      return denied;
    }

    const params = new URLSearchParams();
    if (input.status) {
      params.set("status", input.status);
    }
    if (input.site) {
      params.set("site", input.site);
    }

    const query = params.toString();
    const path = query ? `/api/posts?${query}` : "/api/posts";
    const result = await ctx.request("GET", path);

    if (!result.ok) {
      return failureResult(result);
    }

    return writeSuccessResult(result);
  },
};
