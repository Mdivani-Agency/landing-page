# Bugbot review notes

Next.js App Router marketing site for Mdivani Agency. Hosted on Vercel. Blog posts and contact inquiries persist in Supabase.

## API route security

Review `app/api/**` as server-only handlers.

- `/api/contact` is a public POST. Check validation, body-size limits, rate limiting, and that responses do not leak server errors or credentials.
- `/api/posts` and `/api/posts/[slug]` are the blog write API. Every method must go through `authorizeBlogWrite` before reading or writing data.
- `BLOG_WRITE_TOKEN` is server-only (never `NEXT_PUBLIC_*`), at least 32 bytes. Missing or too-short token → 500. Wrong or absent bearer token → 401. Rate-limit by client IP before comparing tokens. The Talvio read token must not satisfy this gate.
- `/api/talvio/posts` and `/api/talvio/posts/[slug]` are the Talvio read API. Every method must go through `authorizeTalvioRead`. `BLOG_READ_TOKEN_TALVIO` (and optional `BLOG_READ_TOKEN_TALVIO_NEXT`) is server-only, at least 32 bytes, and is the only credential accepted. `BLOG_WRITE_TOKEN` must not satisfy this gate. If either read token equals `BLOG_WRITE_TOKEN`, both gates return 500 and accept neither secret. Rate-limit by credential hash in the shared Upstash/KV store, not by client IP. Do not add CORS. Responses must not include the token, stack, or query text.

## Secrets stay off the client

Flag any of the following in client components, `NEXT_PUBLIC_*` variables, or committed env files:

- `BLOG_WRITE_TOKEN`
- `BLOG_READ_TOKEN_TALVIO`
- `BLOG_READ_TOKEN_TALVIO_NEXT`
- `SUPABASE_SECRET_KEY` (bypasses row level security; `lib/supabase.ts` is `server-only`)
- `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
- KV / Upstash REST tokens
- `SENTRY_AUTH_TOKEN`
- CI tokens (`VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`)

`SUPABASE_PUBLISHABLE_KEY` is the anon key and remains subject to RLS. `SUPABASE_URL` plus that publishable key are the only Supabase values that belong in a read client.

Do not invent product or copy rules. Review against existing handlers, `lib/blog-write-auth.ts`, `lib/blog-read-auth.ts`, `lib/supabase.ts`, `docs/blog-write-api.md`, and `docs/blog-read-api.md`.
