import { FORMATTING_CONTRACT } from "../resources/formatting";
import { updatePostInputSchema } from "../schema";
import type { ToolDefinition } from "../types";
import { failureResult, requireToken, writeSuccessResult } from "./result";

export const blogUpdatePost: ToolDefinition = {
  name: "blog_update_post",
  title: "Update a blog post",
  description: `Update an existing blog post by slug. Sending slug is an upsert: an existing post is overwritten. Use blog_get_post first when you need the current body.

status defaults to draft if omitted. That will unpublish a live post. To keep a post live, send status: "published".

Omitting sites keeps the existing site list. The result echoes the target base URL.

${FORMATTING_CONTRACT}`,
  inputSchema: updatePostInputSchema,
  annotations: { readOnlyHint: false, destructiveHint: true },
  async handler(input, ctx) {
    const denied = requireToken(ctx);
    if (denied) {
      return denied;
    }

    const result = await ctx.request("POST", "/api/posts", input);

    if (!result.ok) {
      return failureResult(result);
    }

    return writeSuccessResult(result);
  },
};
