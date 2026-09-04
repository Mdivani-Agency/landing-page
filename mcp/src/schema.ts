import { z } from "zod";
import {
  CONTENT_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  POST_STATUSES,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  isSameOriginCoverPath,
  siteKeys,
} from "../../lib/blog-schema";

export const titleField = z
  .string()
  .trim()
  .min(TITLE_MIN_LENGTH)
  .max(TITLE_MAX_LENGTH);

export const descriptionField = z
  .string()
  .trim()
  .min(DESCRIPTION_MIN_LENGTH)
  .max(DESCRIPTION_MAX_LENGTH);

export const contentField = z.string().trim().min(CONTENT_MIN_LENGTH);

export const slugField = z
  .string()
  .trim()
  .max(SLUG_MAX_LENGTH)
  .regex(SLUG_PATTERN);

export const optionalSlugField = z
  .string()
  .trim()
  .max(SLUG_MAX_LENGTH)
  .refine((value) => value === "" || SLUG_PATTERN.test(value), {
    message: "Use a lowercase slug with letters, numbers, and hyphens.",
  })
  .optional();

export const tagsField = z.array(z.string()).optional();

export const sitesField = z
  .array(z.string().trim().pipe(z.enum(siteKeys)))
  .min(1)
  .optional();

export const coverImageUrlField = z
  .string()
  .trim()
  .refine((value) => value === "" || isSameOriginCoverPath(value), {
    message: "Cover image must be a same-origin path starting with /.",
  })
  .optional();

export const statusField = z.enum(POST_STATUSES).optional();

export const featuredField = z.boolean().optional();

const writeFields = {
  title: titleField,
  description: descriptionField,
  content: contentField,
  tags: tagsField,
  sites: sitesField,
  cover_image_url: coverImageUrlField,
  status: statusField,
  featured: featuredField,
};

/**
 * Shared field bounds used by every write tool. The route validator in
 * `lib/blog-schema.ts` is the source of truth; this schema must stay in
 * lockstep — see `schema-agreement.test.ts`.
 */
export const writePayloadSchema = z.object({
  ...writeFields,
  slug: optionalSlugField,
});

export const createPostInputSchema = z.object(writeFields);

export const updatePostInputSchema = z.object({
  ...writeFields,
  slug: slugField,
});

export const validatePostInputSchema = writePayloadSchema;

export const listPostsInputSchema = z.object({
  status: statusField,
  site: z.enum(siteKeys).optional(),
});

export const getPostInputSchema = z.object({
  slug: slugField,
});
