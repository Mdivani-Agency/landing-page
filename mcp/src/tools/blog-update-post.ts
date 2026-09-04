import { FORMATTING_CONTRACT } from "../resources/formatting";
import { updatePostInputSchema } from "../schema";
import { defineTool } from "../types";
import { failureResult, requireToken, writeSuccessResult } from "./result";

export const blogUpdatePost = defineTool({
  name: "blog_update_post",
  title: "Update a blog post",
  description: `Update an existing blog post by slug. Sending slug is an upsert. Use blog_get_post first when you need the current body.

Omitted optional fields keep the stored values: status, tags, cover_image_url, and sites. A typical typo fix (slug + title + description + content only) will not unpublish and will not clear tags or the cover.

To change those fields, send them explicitly. status: "draft" unpublishes. tags: [] or cover_image_url: "" clears. sites: [] is rejected; send the full list to replace.

The result echoes the target base URL.

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
});
