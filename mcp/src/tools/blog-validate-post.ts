import {
  validateBlogWritePayload,
  type BlogWriteInput,
  type BlogWriteProvided,
} from "../../../lib/blog-schema";
import { FORMATTING_CONTRACT } from "../resources/formatting";
import { validatePostInputSchema } from "../schema";
import { defineTool } from "../types";
import { textResult } from "./result";

/**
 * Shape an agent can copy into a write tool. Optional keys appear only when
 * the input actually sent them, so create defaults are not replayed onto an
 * update (which would unpublish or clear tags/cover).
 */
export function writePayloadFromValidation(
  value: BlogWriteInput,
  provided: BlogWriteProvided,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: value.title,
    description: value.description,
    content: value.content,
  };

  if (provided.slugProvided) {
    payload.slug = value.slug;
  }

  if (provided.tagsProvided) {
    payload.tags = value.tags;
  }

  if (provided.sitesProvided) {
    payload.sites = value.sites;
  }

  if (provided.coverProvided) {
    payload.cover_image_url = value.coverImageUrl;
  }

  if (provided.statusProvided) {
    payload.status = value.status;
  }

  if (provided.featuredProvided) {
    payload.featured = value.featured;
  }

  return payload;
}

export const blogValidatePost = defineTool({
  name: "blog_validate_post",
  title: "Validate a blog post",
  description: `Validate a blog post payload locally against the same rules as POST /api/posts. Does not write anything and does not call the network.

Use this before blog_create_post or blog_update_post. Copy \`value\` into the write tool — do not add status, tags, sites, cover_image_url, or featured unless the caller sent them.

On create (no slug), omitted status becomes draft and omitted featured becomes false on the server. On update (slug present), omitted status, tags, cover_image_url, sites, and featured keep the stored values. Sending status: "draft" or tags: [] is an explicit write and will unpublish or clear. featured: false unpins a featured post.

The resolved slug is returned as \`slug\` even when generated. It is only inside \`value\` when you provided one, so a create-shaped \`value\` cannot be reused as an update.

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
      tags_provided: result.tagsProvided,
      cover_provided: result.coverProvided,
      status_provided: result.statusProvided,
      featured_provided: result.featuredProvided,
      value: writePayloadFromValidation(result.value, result),
    });
  },
});
