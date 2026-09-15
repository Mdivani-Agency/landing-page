# Blog MCP server

`mcp/` is a Yarn workspace that exposes blog authoring over stdio. Cursor
spawns the process; there is no hosted transport and no inbound auth.

## Setup

```bash
yarn install
yarn dev                 # Next.js at http://localhost:3000
export BLOG_WRITE_TOKEN=  # at least 32 bytes, same value as the app
export BLOG_API_BASE_URL=http://localhost:3000
yarn mcp                 # or: yarn workspace mdio-blog-mcp start
```

`.cursor/mcp.json` is committed and points Cursor at the workspace script.
It sets `BLOG_API_BASE_URL` only. `BLOG_WRITE_TOKEN` must come from the
environment — never put a literal token in that file.

The server logs the target base URL on stderr at startup and echoes it in
every write result.

## Tools

Adding a tool is a new file under `mcp/src/tools/` plus one entry in
`mcp/src/tools/index.ts`. `server.ts` has no per-tool logic.

| Tool | Network | Notes |
| --- | --- | --- |
| `blog_validate_post` | no | Shared validator. `value` omits unprovided optional keys. |
| `blog_create_post` | `POST /api/posts` | Omits `slug`. A 409 is a real conflict. |
| `blog_update_post` | `POST /api/posts` | Requires `slug`. Upsert. |
| `blog_list_posts` | `GET /api/posts` | Summaries, no `content`. Optional `status` and `site`. |
| `blog_get_post` | `GET /api/posts/[slug]` | Includes drafts. |

`blog_create_post` still defaults `status` to `draft` and `featured` to
`false`. `blog_update_post` keeps the stored `status`, `tags`,
`cover_image_url`, `sites`, and `featured` when those keys are omitted.
`blog_validate_post` returns those keys in `value` only when the caller
sent them, so a validate-then-update path cannot replay create defaults.
Write tools carry `destructiveHint`, so Cursor prompts before they run.
Publishing a new post requires an explicit `status: "published"`. Send
`featured: true` to pin a published post above the chronological `/blog`
grid on page 1. There is no featured cap. The public listing paginates the
non-featured grid at 6 posts per page (`/blog`, then `/blog/page/2`).

`BLOG_API_BASE_URL` is allowlisted to localhost and `mdivani.agency`. The
HTTP client uses `redirect: "error"` so the write token cannot follow a
cross-origin 3xx.

## Resource

`blog://formatting` is the renderer contract from
`components/markdown.tsx` and `app/blog/[slug]/page.tsx`. The same text is
embedded in every write-tool description because not every client surfaces
resources.

## Errors

The HTTP client turns status codes into messages an agent can act on:

- `400` — per-field validator messages, unchanged
- `409` — use `blog_update_post` or pick a different title
- `429` — retry window; do not loop
- `401` / `500` — configuration or persistence; report to the user
