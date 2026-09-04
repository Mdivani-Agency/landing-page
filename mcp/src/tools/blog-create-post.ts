import { FORMATTING_CONTRACT } from "../resources/formatting";
import { createPostInputSchema } from "../schema";
import { defineTool } from "../types";
import { failureResult, requireToken, writeSuccessResult } from "./result";

export const blogCreatePost = defineTool({
  name: "blog_create_post",
  title: "Create a blog post",
  description: `Create a new blog post. This tool never sends slug, so the API generates one from title. If that slug is already taken the call fails with 409 — it will not overwrite an existing post. To change an existing post, call blog_update_post.

On create, omitted status becomes draft and omitted featured becomes false. Publishing requires an explicit status: "published". Send featured: true to pin the post above the chronological /blog grid once it is published. Draft + featured is stored but ignored by public reads. There is no featured cap.

Prefer blog_validate_post first, and send its \`value\` as-is — do not add status/tags/cover defaults. The result echoes the target base URL so you can see whether this write hit production or localhost.

${FORMATTING_CONTRACT}`,
  inputSchema: createPostInputSchema,
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
