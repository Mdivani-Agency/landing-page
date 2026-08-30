# Blog write API

`POST /api/posts` creates or updates a post. This is the integration point for a future authoring bot. There is no public write UI.

Persistence today is an in-process store seeded from `lib/blog-seed.ts`. It is enough for local development and tests. A managed database (MDI-70) should replace the store before production use.

## Authentication

Send a bearer token. The secret is `BLOG_WRITE_TOKEN` (server-only, not `NEXT_PUBLIC_*`). It must be different from any revalidation secret.

```
Authorization: Bearer <BLOG_WRITE_TOKEN>
```

Missing or wrong tokens return `401` `{ "ok": false, "errors": { "form": "Unauthorized." } }`. The handler does not say whether a slug exists.

## Request

JSON only. Maximum body size: 100 KB.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | 3–160 characters |
| `description` | yes | 10–320 characters |
| `content` | yes | Markdown, at least 20 characters |
| `slug` | no | `[a-z0-9]+(-[a-z0-9]+)*`. Generated from `title` when omitted |
| `tags` | no | Array of strings |
| `cover_image_url` | no | `http` or `https` URL |
| `status` | no | `draft` (default) or `published` |

Example:

```http
POST /api/posts
Authorization: Bearer $BLOG_WRITE_TOKEN
Content-Type: application/json

{
  "title": "From idea to a production AI product",
  "description": "How the first slice gets to production.",
  "content": "## Start with a job\n\nThe model is not the product.",
  "tags": ["AI", "product"],
  "status": "draft"
}
```

## Responses

- `200` `{ "ok": true, "post": { "slug", "title", "description", "content", "cover_image_url", "tags", "status", "published_at", "created_at", "updated_at" } }`
- `400` `{ "ok": false, "errors": { "fieldName": "…" } }`
- `401` unauthorized
- `429` more than 30 requests per IP per minute (in-memory, per instance)
- `500` `BLOG_WRITE_TOKEN` is not configured

Successful writes call `revalidatePath` for `/blog`, `/blog/[slug]`, `/sitemap.xml`, and `/feed.xml`.

## Limits

- 100 KB payload cap
- 30 requests / 60 seconds / client IP, stored in process memory (not shared across serverless instances)
- Default `status` is `draft` so a bot can write for review before going live
