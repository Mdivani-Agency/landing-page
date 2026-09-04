# Blog write API

Authenticated endpoints under `/api/posts` are the integration point for the
authoring MCP server (`mcp/`). There is no public write UI.

Writes persist in Supabase `public.blog_posts` through the admin client
(`SUPABASE_SECRET_KEY`). Set `BLOG_WRITE_TOKEN` on Vercel only after
`migrate_supabase` has applied that table (TD-044 / TD-045). Persistence
failures return `500` and are reported to Sentry.

Successful writes call `revalidatePath` for `/blog`, `/blog/[slug]`,
`/feed.xml`, and `/sitemap.xml`.

Field bounds and slug rules live in `lib/blog-schema.ts`. The route handler
and the MCP tool schemas both import that module.

## Authentication

Send a bearer token. The secret is `BLOG_WRITE_TOKEN` (server-only, not
`NEXT_PUBLIC_*`). It must be at least 32 bytes and different from any
revalidation secret.

```
Authorization: Bearer <BLOG_WRITE_TOKEN>
```

The `Bearer` scheme is case-insensitive. Every method rate-limits by client
IP before comparing tokens. Comparison uses SHA-256 digests so secret length
is not leaked by timing.

Missing or wrong tokens return `401` `{ "ok": false, "errors": { "form": "Unauthorized." } }`.
On write, the handler does not say whether a slug exists. A missing or
too-short `BLOG_WRITE_TOKEN` returns `500`.

## `POST /api/posts`

Creates or updates a post. JSON only. Maximum body size: 100 KB, enforced
while reading the stream (a missing or understated `Content-Length` cannot
bypass the cap).

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | 3–160 characters |
| `description` | yes | 10–320 characters, plain text |
| `content` | yes | Markdown, at least 20 characters |
| `slug` | no | `[a-z0-9]+(-[a-z0-9]+)*`, max 80. Generated from `title` when omitted. Omit only to create; send `slug` to update |
| `tags` | no | Array of strings; blanks dropped |
| `sites` | no | `agency` and/or `talvio`. On create, defaults to this site (`agency`). On update, omitted `sites` keeps the existing list |
| `cover_image_url` | no | Same-origin path starting with `/` (not `//`, `?`, `#`, or an absolute URL). Remote hosts and query strings are rejected because `next/image` has no remote allowlist and rejects local `src` with search |
| `status` | no | `draft` (default) or `published` |

Create versus update is decided by `slug`. Omitting it means create: if the
generated slug is taken the API returns `409`. Sending `slug` means upsert.

On update, omitted `sites`, `tags`, `cover_image_url`, and `status` keep the
stored values. Send `tags: []`, `cover_image_url: ""`, or `status: "draft"`
to clear or unpublish. On create, omitted `status` is still `draft`.

`published_at` is set on first publish and preserved across later updates.
`created_at` is preserved. `updated_at` is always now.

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
  "sites": ["agency"],
  "status": "draft"
}
```

## `GET /api/posts`

Authenticated listing, including drafts and posts for other sites.

Optional query parameters:

- `status` — `draft` or `published`
- `site` — `agency` or `talvio`

```http
GET /api/posts?status=draft
Authorization: Bearer $BLOG_WRITE_TOKEN
```

`200` `{ "ok": true, "posts": [ ... ] }` — summary rows without `content`.
Use `GET /api/posts/[slug]` for the Markdown body. `status` and `site` are
applied in the database query.

## `GET /api/posts/[slug]`

Authenticated read of one post, including drafts.

`200` `{ "ok": true, "post": { ... } }`  
`404` `{ "ok": false, "errors": { "slug": "Post not found." } }`

## Responses

- `200` `{ "ok": true, "post": { "slug", "title", "description", "content", "cover_image_url", "tags", "sites", "status", "published_at", "created_at", "updated_at" } }` (list uses `posts`)
- `400` `{ "ok": false, "errors": { "fieldName": "…" } }`
- `401` unauthorized
- `404` authenticated get for an unknown slug
- `409` generated slug already exists; body includes `slug`
- `429` more than 30 requests per IP per minute (in-memory, per instance)
- `500` `BLOG_WRITE_TOKEN` is missing or shorter than 32 bytes, or persistence failed

## Limits

- 100 KB payload cap on `POST`
- 30 requests / 60 seconds / client IP, stored in process memory (not shared across serverless instances)
- Default `status` is `draft` so a bot can write for review before going live

## MCP server

See [`docs/blog-mcp.md`](blog-mcp.md).
