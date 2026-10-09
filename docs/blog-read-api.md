# Talvio blog read API

`GET /api/talvio/posts` and `GET /api/talvio/posts/[slug]` are the server-side
read API for the Talvio blog. There is no browser access and no CORS header.
The editor routes under `/api/posts` are unchanged and do not accept this
credential. See [`docs/blog-write-api.md`](blog-write-api.md).

Set `BLOG_READ_TOKEN_TALVIO` on Vercel production only after this route is
deployed. Until then the route returns `500`.

## Authentication

Send a bearer token. The secret is `BLOG_READ_TOKEN_TALVIO` (server-only, not
`NEXT_PUBLIC_*`). It must be at least 32 bytes and should be different from
`BLOG_WRITE_TOKEN`.

```
Authorization: Bearer <BLOG_READ_TOKEN_TALVIO>
```

The `Bearer` scheme is case-insensitive. Comparison uses SHA-256 digests so
secret length is not leaked by timing.

`BLOG_WRITE_TOKEN` is rejected with `401`. A missing or wrong bearer token
returns `401` `{ "ok": false, "errors": { "form": "Unauthorized." } }`.
A missing or too-short `BLOG_READ_TOKEN_TALVIO` returns `500`
`{ "ok": false, "errors": { "form": "Read API is not configured." } }`.

### Rotation

`BLOG_READ_TOKEN_TALVIO_NEXT` is optional. When it is set and at least 32
bytes, either token is accepted, and each token has its own rate-limit
bucket. A present but too-short next token fails closed (`500`) so a bad
rotation is not ignored.

1. Generate the replacement and set it as `BLOG_READ_TOKEN_TALVIO_NEXT`.
2. Deploy Talvio onto the next token.
3. Copy that value into `BLOG_READ_TOKEN_TALVIO` and remove
   `BLOG_READ_TOKEN_TALVIO_NEXT`.

## Publication rule

A row is returned only when the database query finds all of the following:

- `status = 'published'`
- `sites` contains `talvio`
- `published_at <=` the request time
- tags do not name another site unless they also name Talvio

The tag backstop is symmetric with the agency site. A shared post (`sites`
contains `agency` and `talvio`) tagged only `agency`, `Agency`, or `AGENCY`
is hidden from Talvio. A shared post tagged only `talvio` stays hidden on
the agency site. A shared post with no site-key tag, or with both site
keys, is eligible for both. Overlap is the whole tag, so `agency-story`
does not count as `agency`.

That is the decision MDI-273 should record: the backstop applies in
reverse. Agency pages and this API share one helper, `publishedOnSite` in
`lib/blog.ts`.

Drafts, agency-only posts, future-dated posts, posts withheld by the tag
backstop, and unknown slugs all return the same detail body:

```json
{ "ok": false, "errors": { "slug": "Post not found." } }
```

An invalid slug (not `[a-z0-9]+(-[a-z0-9]+)*`, or longer than 80 characters)
returns `400` after the credential is accepted.

## `GET /api/talvio/posts`

Eligible summaries, newest `published_at` first, then `slug` ascending.
`content` is omitted. No other serializer field is removed.

| Query | Default | Bounds |
| --- | --- | --- |
| `limit` | 20 | integer 1–100 |
| `offset` | 0 | integer 0–100000 |

`100` stays under Supabase `max_rows` (default 1000), so a page is not
silently truncated. `total` is the exact count of eligible rows, ignoring
`limit` and `offset`. Walk `offset` until `offset >= total` to prove the
catalog is complete.

```http
GET /api/talvio/posts?limit=20&offset=0
Authorization: Bearer $BLOG_READ_TOKEN_TALVIO
```

`200`:

```json
{
  "ok": true,
  "posts": [
    {
      "slug": "published-talvio",
      "title": "Published on Talvio",
      "description": "A Talvio essay that is live.",
      "cover_image_url": "/covers/talvio.png",
      "tags": ["product"],
      "sites": ["talvio"],
      "status": "published",
      "featured": true,
      "published_at": "2026-09-03T00:00:00.000Z",
      "created_at": "2026-08-01T09:00:00.000Z",
      "updated_at": "2026-08-01T09:00:00.000Z"
    }
  ],
  "limit": 20,
  "offset": 0,
  "total": 1
}
```

`limit` above 100, `limit` below 1, or a non-integer `offset` returns `400`
`{ "ok": false, "errors": { "limit" and/or "offset": "…" } }`.

## `GET /api/talvio/posts/[slug]`

The same publication rule for one slug. `200` adds `content` (Markdown) to
the summary fields.

`200` `{ "ok": true, "post": { … } }`
`404` the shared not-found body above

## Responses

Every body is `{ "ok": true, … }` or `{ "ok": false, "errors": { … } }`.
Responses send `Cache-Control: private, no-store`. They do not send CORS
headers.

- `400` invalid list query or invalid slug
- `401` missing or wrong credential, including `BLOG_WRITE_TOKEN`
- `404` ineligible or unknown slug
- `429` more than 120 requests per accepted credential per 60 seconds.
  `Retry-After` is set. The write API's 30/minute IP limit is a different
  counter and is not consumed by these routes.
- `500` read token missing or too short, or the read failed

The rate limit is keyed by the SHA-256 of the accepted token and stored in
the same Upstash / KV REST pair as `POST /api/contact`
(`KV_REST_API_URL` + `KV_REST_API_TOKEN`, or the `UPSTASH_REDIS_REST_*`
aliases). It holds across instances. Without that pair the route falls back
to process memory, which does not hold across isolates — keep the KV
integration on production. A store outage fails open so a Redis blip does
not take Talvio down. Logs and responses omit the token, stack traces, and
query text.

## Limits

- 120 requests / 60 seconds / accepted read token
- default page 20, maximum page 100, maximum offset 100000
- no request body
