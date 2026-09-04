import { getPostInputSchema } from "../schema";
import type { ToolDefinition } from "../types";
import { failureResult, requireToken, writeSuccessResult } from "./result";

export const blogGetPost: ToolDefinition = {
  name: "blog_get_post",
  title: "Get a blog post",
  description: `Read one blog post by slug, including drafts. Requires BLOG_WRITE_TOKEN.

Use this before blog_update_post so you edit the current body instead of guessing.`,
  inputSchema: getPostInputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false },
  async handler(input, ctx) {
    const denied = requireToken(ctx);
    if (denied) {
      return denied;
    }

    const result = await ctx.request(
      "GET",
      `/api/posts/${encodeURIComponent(input.slug)}`,
    );

    if (!result.ok) {
      return failureResult(result);
    }

    return writeSuccessResult(result);
  },
};
