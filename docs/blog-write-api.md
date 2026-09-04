# Blog write API

`POST /api/posts` creates or updates a post. This is the integration point for a future authoring bot. There is no public write UI.

Persistence today is an in-process store seeded from `lib/blog-seed.ts`. It is enough for local development and tests. A managed database (MDI-70) should replace the store before production use. Do not set `BLOG_WRITE_TOKEN` on Vercel until then: a successful write is not visible to the ISR isolate that serves `/blog`.

The handler does not call `revalidatePath`. That would regenerate listing and post pages from seed data.

## Authentication

Send a bearer token. The secret is `BLOG_WRITE_TOKEN` (server-only, not `NEXT_PUBLIC_*`). It must be at least 32 bytes and different from any revalidation secret.

```
Authorization: Bearer <BLOG_WRITE_TOKEN>
```

The `Bearer` scheme is case-insensitive. The handler rate-limits by client IP before comparing tokens. Comparison uses SHA-256 digests so secret length is not leaked by timing.

Missing or wrong tokens return `401` `{ "ok": false, "errors": { "form": "Unauthorized." } }`. The handler does not say whether a slug exists. A missing or too-short `BLOG_WRITE_TOKEN` returns `500`.

## Request

JSON only. Maximum body size: 100 KB, enforced while reading the stream (a missing or understated `Content-Length` cannot bypass the cap).

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | 3–160 characters |
| `description` | yes | 10–320 characters |
| `content` | yes | Markdown, at least 20 characters |
| `slug` | no | `[a-z0-9]+(-[a-z0-9]+)*`. Generated from `title` when omitted. Omit only to create; send `slug` to update |
| `tags` | no | Array of strings |
| `cover_image_url` | no | Same-origin path starting with `/` (not `//` or an absolute URL). Remote hosts are rejected because `next/image` has no remote allowlist |
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
- `409` generated slug already exists; body includes `slug`
- `429` more than 30 requests per IP per minute (in-memory, per instance)
- `500` `BLOG_WRITE_TOKEN` is missing or shorter than 32 bytes

## Limits

- 100 KB payload cap
- 30 requests / 60 seconds / client IP, stored in process memory (not shared across serverless instances)
- Default `status` is `draft` so a bot can write for review before going live
