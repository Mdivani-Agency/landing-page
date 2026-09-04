import { validateBlogWritePayload } from "../../../lib/blog-schema";
import { FORMATTING_CONTRACT } from "../resources/formatting";
import { validatePostInputSchema } from "../schema";
import { defineTool } from "../types";
import { textResult } from "./result";

export const blogValidatePost = defineTool({
  name: "blog_validate_post",
  title: "Validate a blog post",
  description: `Validate a blog post payload locally against the same rules as POST /api/posts. Does not write anything and does not call the network.

Use this before blog_create_post or blog_update_post.

Omitting slug means the API will generate one from title. Sending slug is an update.

status defaults to draft. Publishing requires status: "published".

${FORMATTING_CONTRACT}`,
  inputSchema: validatePostInputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false },
  async handler(input) {
    const result = validateBlogWritePayload(input);

    if (!result.ok) {
      return textResult(
        {
          ok: false,
          errors: result.errors,
        },
        true,
      );
    }

    return textResult({
      ok: true,
      slug: result.value.slug,
      slug_provided: result.slugProvided,
      sites_provided: result.sitesProvided,
      value: {
        slug: result.value.slug,
        title: result.value.title,
        description: result.value.description,
        content: result.value.content,
        tags: result.value.tags,
        sites: result.value.sites,
        cover_image_url: result.value.coverImageUrl,
        status: result.value.status,
      },
    });
  },
});
